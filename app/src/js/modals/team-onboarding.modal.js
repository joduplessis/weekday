import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import ModalPortal from '../portals/modal.portal'
import PropTypes from 'prop-types'
import GraphqlService from '../services/graphql.service'
import UploadService from '../services/upload.service'
import { Button, Modal, Input, Textarea, Avatar, Notification, Spinner, Error } from '../elements'
import { validEmail, logger, validateEmail } from '../helpers/util'
import { createTeam } from '../actions'
import MessagingService from '../services/messaging.service'

export default function TeamOnboardingModal(props) {
  const [loading, setLoading] = useState(null)
  const [notification, setNotification] = useState(null)
  const [error, setError] = useState(null)
  const [step, setStep] = useState(1)
  const [image, setImage] = useState('')
  const [teamId, setTeamId] = useState('')
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [shortcode, setShortcode] = useState('')
  const [emails, setEmails] = useState('')
  const [email1, setEmail1] = useState('')
  const [email2, setEmail2] = useState('')
  const [email3, setEmail3] = useState('')
  const [email4, setEmail4] = useState('')
  const dispatch = useDispatch()
  const fileRef = useRef(null)
  const user = useSelector(state => state.user)

  const handleFileChange = async e => {
    if (e.target.files.length == 0) return

    setLoading(true)
    setError(null)

    try {
      const file = e.target.files[0]
      const { name, type, size } = file
      const raw = await UploadService.getUploadUrl(name, type, false)
      const { url } = await raw.json()
      const upload = await UploadService.uploadFile(url, file, type)
      const uri = upload.url.split('?')[0]
      const mime = type

      setImage(uri)
      setLoading(false)
    } catch (e) {
      setLoading(false)
      setError('Error uploading file')
    }
  }

  const handleNewTeamCreate = async () => {
    setLoading(true)
    setError(false)

    try {
      const userId = user.id
      const userName = user.name
      const { data } = await GraphqlService.getInstance().createTeam(userId, userName, {
        name,
        description: '',
        image,
      })

      setSlug(data.createTeam.slug)
      setShortcode(data.createTeam.shortcode)
      setTeamId(data.createTeam.id)
      setLoading(false)
      setStep(3)
      dispatch(createTeam(data.createTeam))

      MessagingService.getInstance().join(data.createTeam.id)
    } catch (e) {
      logger(e)
      setLoading(false)
      setError(e)
    }
  }

  const handleNewTeamInvites = async () => {
    try {
      const emails = []

      // Check all our 4 email addresses here
      // If they are not black then they must be valid
      // Otherwise don't add them to be invited
      if (email1 != '') {
        if (!validEmail(email1)) return setError('Only valid emails are accepted')
        emails.push(email1)
      }

      if (email2 != '') {
        if (!validEmail(email2)) return setError('Only valid emails are accepted')
        emails.push(email2)
      }

      if (email3 != '') {
        if (!validEmail(email3)) return setError('Only valid emails are accepted')
        emails.push(email3)
      }

      if (email4 != '') {
        if (!validEmail(email4)) return setError('Only valid emails are accepted')
        emails.push(email4)
      }

      // Don't do anything if they haven't added emails
      if (emails.length == 0) return

      setLoading(true)
      setError(null)

      const removeSpaces = emails.join(',').replace(/ /g, '')
      const emailArray = removeSpaces.split(',').filter(email => email != '' && validateEmail(email))
      const emailsString = emailArray.join(',')

      await GraphqlService.getInstance().inviteTeamMembers(teamId, emailsString)

      // Stop the loading
      setLoading(false)

      // And then cancel the modal
      props.onCancel()
    } catch (e) {
      setLoading(false)
      setError('Error creating team member')
    }
  }

  // Render functions for ease of reading
  const renderStep1 = () => {
    if (step != 1) return null

    return (
      <React.Fragment>
        <Text className="h1 mb-30 color-d3">Create a team</Text>
        <Text className="h3 mb-10 pl-20 pr-20 text-center color-d2">What would you like to call your new team?</Text>

        <div className="column mt-30 align-items-center w-100">
          <InputContainer>
            <Input placeholder="Team name" inputSize="large" value={name} onChange={e => setName(e.target.value)} />
          </InputContainer>

          <Button onClick={() => (name != '' ? setStep(2) : null)} size="large" text="Next" className="mt-30" />

          <div className="mt-30 color-blue h5 button" onClick={props.onCancel}>
            No thanks, not now
          </div>
        </div>
      </React.Fragment>
    )
  }

  const renderStep2 = () => {
    if (step != 2) return null

    return (
      <React.Fragment>
        <input accept="image/png,image/jpg" type="file" className="hide" ref={fileRef} onChange={handleFileChange} />

        <Avatar image={image} className="mr-20" size="xxx-large" />

        <Text className="h1 mb-30 mt-30 color-d3">{name}</Text>
        <Text className="h3 mb-10 pl-20 pr-20 text-center color-d2">Choose an image</Text>
        <Text className="h5 color-d0 mb-30">
          <span className="color-blue bold h5 button" onClick={() => fileRef.current.click()}>
            Click here
          </span>{' '}
          to choose an image for your new team
        </Text>

        <div className="row mt-30">
          <Button className="mr-10" onClick={() => setStep(1)} size="large" text="Back" />
          <Button onClick={handleNewTeamCreate} size="large" text="Create Team" />
        </div>

        <div className="mt-30 color-blue h5 button" onClick={props.onCancel}>
          No thanks, not now
        </div>
      </React.Fragment>
    )
  }

  const renderStep3 = () => {
    if (step != 3) return null

    return (
      <React.Fragment>
        <Text className="h1 mb-30 color-d3">Congratulations!</Text>
        <Text className="h3 mb-10 pl-20 pr-20 text-center color-d2">Your team has been successfully created.</Text>
        <Text className="h5 color-d0">Add more emails below to invite others to your team.</Text>

        <div className="column mt-30 align-items-center w-100">
          <InputContainer>
            <Input
              placeholder="Email address one"
              inputSize="large"
              value={email1}
              onChange={e => setEmail1(e.target.value)}
            />
          </InputContainer>

          <InputContainer>
            <Input
              placeholder="Email address two"
              inputSize="large"
              value={email2}
              onChange={e => setEmail2(e.target.value)}
            />
          </InputContainer>

          <InputContainer>
            <Input
              placeholder="Email address three"
              inputSize="large"
              value={email3}
              onChange={e => setEmail3(e.target.value)}
            />
          </InputContainer>

          <InputContainer>
            <Input
              placeholder="Email address four"
              inputSize="large"
              value={email4}
              onChange={e => setEmail4(e.target.value)}
            />
          </InputContainer>

          <Button onClick={handleNewTeamInvites} size="large" text="Invite Now" className="mt-30" />

          <div className="mt-30 color-blue h5 button" onClick={props.onCancel}>
            Skip for now
          </div>
        </div>
      </React.Fragment>
    )
  }

  return (
    <ModalPortal>
      <Modal title="Create a new team" frameless={true} width="100%" height="100%" onClose={props.onCancel}>
        <React.Fragment>
          {error && <Error message={error} onDismiss={() => setError(false)} />}
          {loading && <Spinner />}
          {notification && <Notification text={notification} onDismiss={() => setNotification(false)} />}

          <Container>
            <Inner>
              {renderStep1()}
              {renderStep2()}
              {renderStep3()}
            </Inner>

            <Logo>
              <img src="icon.svg" height="20" alt="Weekday" />
            </Logo>
          </Container>
        </React.Fragment>
      </Modal>
    </ModalPortal>
  )
}

TeamOnboardingModal.propTypes = {
  onOkay: PropTypes.any,
  onCancel: PropTypes.any,
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: center;
  justify-content: center;
  background: #f3f3f3;
  position: relative;
`

const Inner = styled.div`
  background: white;
  position: relative;
  padding-top: 80px;
  padding-bottom: 80px;
  width: 550px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
  flex-direction: column;

  @media only screen and (max-width: 768px) {
    height: 100%;
    width: 100%;
    border-radius: 0px;
  }
`

const Logo = styled.div`
  position: absolute;
  top: 40px;
  left: 40px;
  z-index: 1000;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-content: center;
  align-items: center;
  margin-right: auto;
`

const InputContainer = styled.div`
  width: 80%;
  padding: 5px;
`

const Text = styled.div``
