import React, { useState, useEffect } from 'react'
import AuthService from '../services/auth.service'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { Loading, Error, Input, Button, Notification, Avatar } from '../elements'
import GraphqlService from '../services/graphql.service'

export default props => {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)
  const [image, setImage] = useState('')
  const [name, setName] = useState('')
  const [team, setTeam] = useState('')
  const [description, setDescription] = useState('')
  const [notification, setNotification] = useState(false)
  const [shortcode, setShortcode] = useState('')

  const handleChannelJoin = async () => {
    setLoading(true)
    setError(false)
    setNotification(false)

    try {
      const { userId } = await AuthService.currentAuthenticatedUser()
      const { shortcode } = props.match.params
      const { data } = await GraphqlService.getInstance().joinChannel(shortcode, userId)

      setLoading(false)

      if (!data.joinChannel) {
        setError('Could not join channel')
      }
      if (data.joinChannel) {
        setJoined(true)
        setNotification('Successfully joined channel')
      }
    } catch (e) {
      setLoading(false)
      setNotification(false)
      setError('Could not join channel')
    }
  }

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)

        const { data } = await GraphqlService.getInstance().channelShortcode(props.match.params.shortcode)

        setImage(data.channelShortcode.team.image)
        setTeam(data.channelShortcode.team.name)
        setName(data.channelShortcode.name)
        setDescription(data.channelShortcode.description)
        setLoading(false)
      } catch (e) {
        setLoading(false)
        setError('This channel does not exist')
      }
    })()
  }, [])

  return (
    <React.Fragment>
      <Error message={error} onDismiss={() => setError(null)} />
      <Notification text={notification} onDismiss={() => setNotification(false)} />

      <Container className="column">
        <Loading show={loading} />

        {!joined && (
          <Inner>
            <Avatar image={image} title={team} className="mb-20" size="xx-large" />
            <Text className="h1 mb-10 mt-10 color-d3">{name}</Text>
            <Text className="h5 bold mb-30 color-d3">{team}</Text>
            <Text className="h3 mb-10 pl-20 pr-20 text-center color-d2">{description}</Text>
            <Text className="h5 color-d0 mb-30">Join this channel now! Click on the button below.</Text>
            <Inputs>
              <Button onClick={handleChannelJoin} size="large" text="Join Now" />
            </Inputs>
          </Inner>
        )}

        {joined && (
          <Inner>
            <Avatar image={image} title={team} className="mb-20" size="xx-large" />
            <Text className="h1 mb-10 mt-10 color-d3">{name}</Text>
            <Text className="h5 bold mb-30 color-d3">{team}</Text>
            <Text className="h3 mb-10 pl-20 pr-20 text-center color-d2">Congratulations</Text>
            <Text className="h5 color-d0 mb-20">
              You have successfully joined this channel. Click on the button to start.
            </Text>
            <Inputs>
              <Button onClick={() => props.history.push('/app')} size="large" text="Start" />
            </Inputs>
          </Inner>
        )}

        <Logo onClick={() => props.history.push('/app')}>
          <img src="icon.svg" height="20" alt="Weekday" />
        </Logo>
      </Container>
    </React.Fragment>
  )
}

const Container = styled.div`
  background: #f3f3f3;
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0px;
  top: 0px;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
`

const Inputs = styled.div`
  position: relative;
  width: 300px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
  flex-direction: column;
`

const Inner = styled.div`
  background: white;
  position: relative;
  height: 650px;
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

const Text = styled.div``
