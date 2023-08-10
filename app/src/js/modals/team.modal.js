import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import GraphqlService from '../services/graphql.service'
import UploadService from '../services/upload.service'
import ConfirmModal from './confirm.modal'
import PropTypes from 'prop-types'
import MessagingService from '../services/messaging.service'
import ModalPortal from '../portals/modal.portal'
import { browserHistory } from '../services/browser-history.service'
import styled from 'styled-components'
import { Input, Textarea, Modal, Tabbed, Notification, Spinner, Error, User, Avatar, Button, Range } from '../elements'
import { IconComponent } from '../components/icon.component'
import { copyToClipboard, stripSpecialChars, validateEmail } from '../helpers/util'
import { BASE_URL, APP_TYPE } from '../environment'
import { deleteTeam, updateTeam } from '../actions'
import MembersTeamComponent from '../components/members-team.component'
import moment from 'moment'
import * as PaymentService from '../services/payment.service'
import { STRIPE, PRICE, QUANTITY } from '../constants'

const { Stripe } = window

export default function TeamModal(props) {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(null)
  const [notification, setNotification] = useState(null)
  const [image, setImage] = useState('')
  const [name, setName] = useState('')
  const [active, setActive] = useState(null)
  const [quantity, setQuantity] = useState(0)
  const [premiumQuantity, setPremiumQuantity] = useState(5)
  const [slug, setSlug] = useState('')
  const [shortcode, setShortcode] = useState('')
  const [emails, setEmails] = useState('')
  const [totalMembers, setTotalMembers] = useState(0)
  const [description, setDescription] = useState('')
  const dispatch = useDispatch()
  const fileRef = useRef(null)
  const user = useSelector(state => state.user)
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false)
  const [admin, setAdmin] = useState(false)

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

  const handleUpdateTeamSlug = async () => {
    setLoading(true)
    setError(null)

    try {
      const teamId = props.id
      const { data } = await GraphqlService.getInstance().updateTeamSlug(teamId, slug)

      setLoading(false)

      if (data.updateTeamSlug) {
        setNotification('Succesfully updated team slug')
        dispatch(updateTeam(teamId, { slug }))
      } else {
        setError('Slug unavailable')
      }
    } catch (e) {
      setLoading(false)
      setError('Error updating team slug')
    }
  }

  const handleUpdateTeamShortcode = async () => {
    setLoading(true)
    setError(null)

    try {
      const teamId = props.id
      const { data } = await GraphqlService.getInstance().updateTeamShortcode(teamId, shortcode)

      setLoading(false)
      setNotification('Succesfully updated team shortcode')
      dispatch(updateTeam(teamId, { shortcode }))
    } catch (e) {
      setLoading(false)
      setError('Error updating team shortcode')
    }
  }

  const handleUpdateTeam = async () => {
    setLoading(true)
    setError(null)

    try {
      const teamId = props.id
      await GraphqlService.getInstance().updateTeam(teamId, { name, description, image })

      setLoading(false)
      setNotification('Succesfully updated team')
      dispatch(updateTeam(teamId, { name, description, image }))
    } catch (e) {
      setLoading(false)
      setError('Error updating team')
    }
  }

  const handleDeleteTeam = async () => {
    setError(null)
    setConfirmDeleteModal(false)

    if (active) return setError('Please delete your subscription first.')

    // Now start loading
    setLoading(true)

    try {
      const teamId = props.id
      const { data } = await GraphqlService.getInstance().deleteTeam(teamId)

      // Sync this one for everyone
      dispatch(deleteTeam(teamId, true))
      setLoading(false)
      props.onClose()
      browserHistory.push('/app')
    } catch (e) {
      setLoading(false)
      setError('Error deleting team')
    }
  }

  const handleInviteTeamMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      setNotification(null)

      const removeSpaces = emails.replace(/ /g, '')
      const emailArray = removeSpaces.split(',').filter(email => email != '' && validateEmail(email))
      const emailsString = emailArray.join(',')
      const teamId = props.id

      await GraphqlService.getInstance().inviteTeamMembers(teamId, emailsString)

      setLoading(false)
      setNotification('Successfully sent invites')
      setEmails('')
    } catch (e) {
      setLoading(false)
      setError('Error inviting team members')
    }
  }

  const handleDeleteClick = member => {
    if (member.user.id == user.id) {
      setConfirmSelfDeleteModal(true)
    } else {
      setConfirmMemberDeleteModal(true)
      setMemberDeleteId(member.user.id)
    }
  }

  const openCheckout = async () => {
    try {
      const stripe = Stripe(STRIPE)
      const res = await PaymentService.getCheckout(slug, PRICE, premiumQuantity)
      const { sessionId } = await res.json()

      // Redirect them to the checkout using a sessionId
      stripe.redirectToCheckout({ sessionId }).then(result => {
        setError(result.error.message)
      })
    } catch (e) {
      console.log(e)
      setError('Error directing to Stripe')
    }
  }

  const getCustomerPortalUrl = async () => {
    const res = await PaymentService.getPaymentPortalUrl(props.id)
    const {
      session: { url },
    } = await res.json()

    window.location.href = url
  }

  // Effect loads current team details
  useEffect(() => {
    ;(async () => {
      try {
        if (!props.id) return

        setLoading(true)

        const { data } = await GraphqlService.getInstance().team(props.id, user.id)
        const { team } = data

        setImage(team.image)
        setActive(!!team.active)
        setQuantity(team.quantity)
        setName(team.name || '')
        setDescription(team.description || '')
        setShortcode(team.shortcode)
        setSlug(team.slug)
        setTotalMembers(team.totalMembers)
        setAdmin(team.role == 'ADMIN')
        setLoading(false)
      } catch (e) {
        setLoading(false)
        setError('Error getting data')
      }
    })()
  }, [props.id])

  const renderSubscription = () => {
    return (
      <div className="row align-items-start w-100">
        <div className="column w-100">
          {!active && (
            <Notification text={`You are using the free version with only ${QUANTITY} allowed team members.`} />
          )}

          {/* If they user has subscribed */}
          {active && (
            <React.Fragment>
              <PremiumText>You're premium! Your plan allows for {quantity} members.</PremiumText>
              <div className="row justify-content-center mb-20 mt-10">
                <img src="upgrade.png" width="100%" />
              </div>
            </React.Fragment>
          )}

          <div className="column p-20 flex-1 scroll w-100">
            <Text className="color-d2 h5 mb-10">Subscription</Text>
            <Text className="color-d0 p mb-30">Upgrade or downgrade your team to suit your needs</Text>

            {active && (
              <Button text="Manage subscription" size="large" theme="muted" onClick={() => getCustomerPortalUrl()} />
            )}

            {!active && (
              <React.Fragment>
                <Text className="h5 color-d2">Upgrade your team to {premiumQuantity} members.</Text>
                <div className="pt-30 pb-30 w-100">
                  <input
                    className="range"
                    type="range"
                    min={QUANTITY}
                    max={1000}
                    value={premiumQuantity}
                    onChange={e => setPremiumQuantity(e.target.value)}
                  />
                </div>
                <div className="pt-10 w-100">
                  <Button text="Upgrade" size="large" theme="muted" onClick={() => openCheckout()} />
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Render functions for ease of reading
  const renderOverview = () => {
    return (
      <div className="row align-items-start w-100">
        <div className="column w-100">
          {error && <Error message={error} onDismiss={() => setError(false)} />}
          {loading && <Spinner />}
          {notification && <Notification text={notification} onDismiss={() => setNotification(false)} />}

          <div className="row w-100 p-20">
            <input
              accept="image/png,image/jpg"
              type="file"
              className="hide"
              ref={fileRef}
              onChange={handleFileChange}
            />

            <Avatar image={image} className="mr-20" size="large" />

            <div className="column flexer header pl-10">
              <div className="row pb-5">
                <Text className="h5 color-d2">{name}</Text>
              </div>
              <div className="row">
                {admin && (
                  <Text className="p color-blue button bold" onClick={() => fileRef.current.click()}>
                    Update team image
                  </Text>
                )}
              </div>
            </div>
          </div>

          <div className="column p-20 flex-1 scroll w-100">
            <Input
              label="Team name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter full name"
              className="mb-20"
              disabled={!admin}
            />

            <Textarea
              label="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add a description"
              rows={8}
              className="mb-20"
              disabled={!admin}
            />

            {admin && <Button onClick={handleUpdateTeam} text="Save" theme="muted" />}
          </div>
        </div>
      </div>
    )
  }

  const renderMembers = () => {
    return (
      <div className="column flex-1 w-100 h-100">
        <MembersTeamComponent
          totalMembers={totalMembers}
          admin={admin}
          id={props.id}
          createPrivateChannel={props.createPrivateChannel}
          onClose={props.onClose}
        />
      </div>
    )
  }

  const renderAccess = () => {
    return (
      <div className="row align-items-start w-100">
        <div className="column w-100">
          {error && <Error message={error} onDismiss={() => setError(false)} />}
          {loading && <Spinner />}
          {notification && <Notification text={notification} onDismiss={() => setNotification(false)} />}

          <div className="column p-20 flex-1 scroll w-100">
            <Text className="color-d2 h5 mb-10">Outside access</Text>
            <Text className="color-d0 p mb-30">{`Allow anybody to join your team using a shortcode at ${BASE_URL}/t/${slug}`}</Text>

            <div className="row mb-20 w-100">
              <div className="pr-10 color-d0 p">{`${BASE_URL}/t/`}</div>
              <Input value={slug} onChange={e => setSlug(stripSpecialChars(e.target.value))} placeholder="Enter Slug" />
            </div>

            <div className="row pb-30 mb-30 w-100 border-bottom">
              <Button theme="muted" onClick={handleUpdateTeamSlug} text="Update slug" />
              <Button
                theme="muted"
                onClick={() => copyToClipboard(`${BASE_URL}/t/${slug}`)}
                text="Copy URL"
                className="ml-5"
              />
            </div>

            <Input
              label="Update your team shortcode"
              value={shortcode}
              onChange={e => setShortcode(e.target.value)}
              placeholder="Enter shortcode"
              className="mb-20"
            />

            <div className="row mb-30">
              <Button onClick={handleUpdateTeamShortcode} text="Update shortcode" theme="muted" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderInviteShare = () => {
    return (
      <div className="row align-items-start w-100">
        <div className="column w-100">
          {error && <Error message={error} onDismiss={() => setError(false)} />}
          {loading && <Spinner />}
          {notification && <Notification text={notification} onDismiss={() => setNotification(false)} />}

          <div className="column p-20 flex-1 scroll w-100">
            <Text className="color-d2 h5 mb-10">Invite users</Text>
            <Text className="color-d0 p mb-30">Add users email.</Text>

            <Textarea
              placeholder="Comma seperated email addresses"
              value={emails}
              onChange={e => setEmails(e.target.value)}
            />

            <Button text="Invite users" onClick={handleInviteTeamMembers} theme="muted" />
          </div>
        </div>
      </div>
    )
  }

  const renderDangerZone = () => {
    return (
      <div className="row align-items-start w-100">
        <div className="column w-100">
          {error && <Error message={error} onDismiss={() => setError(false)} />}
          {loading && <Spinner />}
          {notification && <Notification text={notification} onDismiss={() => setNotification(false)} />}

          {confirmDeleteModal && (
            <ConfirmModal
              onOkay={handleDeleteTeam}
              onCancel={() => setConfirmDeleteModal(false)}
              text="Are you sure you want to delete this team, it can not be undone?"
              title="Are you sure?"
            />
          )}

          <div className="column p-20 flex-1 scroll w-100">
            <Text className="color-red h5 mb-10">Here be dragons!</Text>
            <Text className="color-d0 p mb-30">This cannot be undone.</Text>

            <Button text="Delete" theme="red" onClick={() => setConfirmDeleteModal(true)} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <ModalPortal>
      <Modal title={`Team ${name}`} width={800} height="90%" onClose={props.onClose}>
        <Tabbed
          start={props.start}
          onChange={i => {
            setNotification(null)
            setError(null)
          }}
          panels={[
            {
              title: 'Overview',
              show: true,
              content: renderOverview(),
            },
            {
              title: 'Members',
              show: true,
              content: renderMembers(),
            },
            {
              title: 'Access',
              show: admin,
              content: renderAccess(),
            },
            {
              title: 'Invite & share',
              show: admin,
              content: renderInviteShare(),
            },
            {
              title: 'Subscription',
              show: admin && APP_TYPE != 'cordova' && APP_TYPE != 'electron',
              content: renderSubscription(),
            },
            {
              title: 'Danger zone',
              show: admin,
              content: renderDangerZone(),
            },
          ]}
        />
      </Modal>
    </ModalPortal>
  )
}

TeamModal.propTypes = {
  onClose: PropTypes.func,
  start: PropTypes.number,
  id: PropTypes.string,
  history: PropTypes.any,
  createPrivateChannel: PropTypes.func,
}

const Text = styled.div``

const PremiumText = styled.div`
  background-color: #3369e7;
  color: white;
  font-size: 18px;
  text-align: center;
  font-weight: 600;
  padding: 10px;
  width: 100%;
`
