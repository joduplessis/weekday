import React, { useEffect, useState } from 'react'
import '../helpers/extensions'
import moment from 'moment'
import styled from 'styled-components'
import { useSelector, useDispatch } from 'react-redux'
import { hydrateNotifications, updateNotificationRead } from '../actions'
import { Spinner, Popup } from '../elements'
import GraphqlService from '../services/graphql.service'
import MessagingService from '../services/messaging.service'
import { IconComponent } from './icon.component'
import { logger } from '../helpers/util'
import { browserHistory } from '../services/browser-history.service'

export default function NotificationsComponent(props) {
  const [page, setPage] = useState(0)
  const notifications = useSelector(state => state.notifications)
  const common = useSelector(state => state.common)
  const user = useSelector(state => state.user)
  const userId = user.id
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [notificationsMenu, setNotificationsMenu] = useState(false)
  const hasNotification = notifications.filter(notification => !notification.read).length > 0

  const fetchNotifications = async userId => {
    setLoading(true)
    setError(false)

    try {
      const { data } = await GraphqlService.getInstance().notifications(userId, page)

      setLoading(false)
      setPage(page + 1)
      dispatch(hydrateNotifications(data.notifications))
    } catch (e) {
      logger(e)
      setLoading(false)
      setError(e)
    }
  }

  const handleReadButtonClick = async (notificationId, read) => {
    setLoading(true)
    setError(false)

    try {
      await GraphqlService.getInstance().updateNotificationRead(notificationId, read)

      setLoading(false)
      dispatch(updateNotificationRead(notificationId, read))
    } catch (e) {
      setLoading(false)
      setError(false)
    }
  }

  const handleLoadButtonClick = () => {
    setPage(page + 1)
    fetchNotifications(userId)
  }

  // Get all the teams
  useEffect(() => {
    if (user.id) fetchNotifications(user.id)
  }, [user.id])

  return (
    <Popup
      handleDismiss={() => setNotificationsMenu(false)}
      visible={notificationsMenu}
      width={275}
      direction="left-bottom"
      content={
        <Container className="column">
          {loading && <Spinner />}

          <Inner className="column align-items-center">
            <ScrollContainer className="column align-items-center">
              {notifications.map((notification, index) => {
                return (
                  <Row key={index} className="row">
                    <div className="flexer column">
                      <div className="row w-100 flexer">
                        <div className="column w-100">
                          <div className="row mb-5 w-100">
                            <Team hasChannel={notification.channel.id}>{notification.team.name}</Team>
                            {notification.channel.id && (
                              <Channel
                                onClick={() => {
                                  setNotificationsMenu(false)
                                  browserHistory.push(
                                    `/app/team/${notification.team.id}/channel/${notification.channel.id}`
                                  )
                                }}
                              >
                                {notification.channel.name}
                              </Channel>
                            )}
                            <div className="flexer" />
                            <Created>{moment(notification.createdAt).fromNow()}</Created>
                          </div>
                          <Title read={notification.read}>{notification.title}</Title>
                          <Body read={notification.read}>{notification.body}</Body>
                        </div>
                      </div>
                      <div className="row">
                        <Button
                          className="button"
                          onClick={() => handleReadButtonClick(notification.id, !notification.read)}
                        >
                          {notification.read ? 'Mark as unread' : 'Mark as read'}
                        </Button>
                      </div>
                    </div>
                  </Row>
                )
              })}

              {notifications.length == 0 && (
                <React.Fragment>
                  <img src="icon.svg" width="100" className="mt-40 mb-20" />
                  <TitleText>Hooray</TitleText>
                  <SubtitleText>You are all caught up</SubtitleText>
                </React.Fragment>
              )}

              <br />
              <br />
            </ScrollContainer>

            <LoadContainer onClick={() => handleLoadButtonClick()} className="button row justify-content-center">
              <IconComponent icon="refresh" size={15} color="#acb5bd" className="mt-5 mb-5" />
              <LoadText>More</LoadText>
            </LoadContainer>
          </Inner>
        </Container>
      }
    >
      <div style={{ ...props.style }} className="button" onClick={e => setNotificationsMenu(true)}>
        {hasNotification && <Badge />}
        {props.children}
      </div>
    </Popup>
  )
}

NotificationsComponent.propTypes = {}

const Badge = styled.span`
  position: absolute;
  right: -3px;
  bottom: -3px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background-color: #4084ed;
`

const Container = styled.div`
  width: 100%;
  height: 500px;
  overflow: hidden;
`

const ScrollContainer = styled.div`
  width: 100%;
  height: 500px;
  overflow: scroll;
  position: relative;
`

const Inner = styled.div`
  width: 100%;
  height: 500px;
  overflow: scroll;
  position: relative;
`

const Row = styled.div`
  background: transparent;
  padding: 10px;
  width: 100%;
  border-bottom: 1px solid #f1f3f5;
`

const Created = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: #cfd4da;
  margin-left: auto;
`

const Title = styled.div`
  font-size: 15px;
  font-weight: ${props => (props.read ? '400' : '600')};
  color: ${props => (props.read ? '#cfd4da' : '#202529')};
  flex: 1;
`

const Body = styled.div`
  font-size: 13px;
  font-weight: ${props => (props.read ? '400' : '600')};
  color: ${props => (props.read ? '#cfd4da' : '#343a40')};
  margin-top: 4px;
`

const Channel = styled.div`
  font-size: 10px;
  font-weight: 500;
  color: #8895a7;
  background: #f2f3f5;
  padding: 5px;
  cursor: pointer;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;

  :hover {
    background: #e9edef;
  }
`

const Team = styled.div`
  font-size: 10px;
  font-weight: 700;
  padding: 5px;
  color: #8895a7;
  background: #e9edef;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  border-top-right-radius: ${props => (props.hasChannel ? '0' : '5')}px;
  border-bottom-right-radius: ${props => (props.hasChannel ? '0' : '5')}px;
`

const Button = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: #007af5;
  width: 100%;
  margin-top: 4px;
`

const LoadContainer = styled.div`
  background: #f8f9fa;
  border-top: 1px solid #e1e7eb;
  border-bottom: 1px solid #e1e7eb;
  width: 100%;
  position: absolute;
  bottom: 0px;
  left: 0px;
`

const LoadText = styled.div`
  padding: 5px 10px 5px 10px;
  font-size: 10px;
  font-weight: 700;
  color: #adb5bd;
  font-weight: regular;
`

const TitleText = styled.div`
  color: #483545;
  font-size: 14px;
  font-weight: 400;
`

const SubtitleText = styled.div`
  color: #858e96;
  font-size: 12px;
  font-weight: 400;
`
