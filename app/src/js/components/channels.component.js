import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { connect } from 'react-redux'
import { useParams, useLocation, useHistory, useRouteMatch } from 'react-router-dom'
import GraphqlService from '../services/graphql.service'
import MessagingService from '../services/messaging.service'
import '../helpers/extensions'
import styled from 'styled-components'
import { BrowserRouter as Router, Link } from 'react-router-dom'
import ChannelModal from '../modals/channel.modal'
import AccountModal from '../modals/account.modal'
import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { IconComponent } from './icon.component'
import QuickUserComponent from './quick-user.component'
import PropTypes from 'prop-types'
import EventService from '../services/event.service'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import StorageService from '../services/storage.service'
import arrayMove from 'array-move'
import NotificationsComponent from '../components/notifications.component'
import { TypingComponent } from '../components/typing.component'
import {
  createChannel,
  hydrateChannels,
  hydrateTeam,
  updateUserDnd,
  updateUserPresence,
  updateUserStatus,
  updateUserMuted,
  updateUserArchived,
  updateTeamMemberPosition,
  updateChannel,
  hydrateChannel,
  hydrateMessage,
  hydrateThreads,
  hydrateChannelUnreads,
  createChannelNotification,
  updateChannelNotification,
  deleteChannelNotification,
} from '../actions'
import TeamModal from '../modals/team.modal'
import { Toggle, Popup, Menu, Avatar, Tooltip, Input, Button, Select, Label, Spinner } from '../elements'
import QuickInputComponent from '../components/quick-input.component'
import AuthService from '../services/auth.service'
import { version } from '../../../package.json'
import {
  logger,
  shortenMarkdownText,
  isExtensionOpen,
  generateInitials,
  privateChannelWithSameMembers,
  getUnreadCountForChannelId,
  doNotDisturbUser,
  getChannelNameWithMembers,
  getUsersThatAreStillTyping,
  getChannelOtherUser,
  shade,
} from '../helpers/util'
import moment from 'moment'
import { browserHistory } from '../services/browser-history.service'
import * as chroma from 'chroma-js'
import { v4 as uuidv4 } from 'uuid'
import NewChannelModal from '../modals/new-channel.modal'
import {
  IS_MOBILE,
  CHANNELS_ORDER,
  CHANNEL_ORDER_INDEX,
  TOGGLE_CHANNELS_DRAWER,
  NAVIGATE,
  TEXT_VERY_FADED_WHITE,
  TEXT_OFF_WHITE,
  BACKGROUND_FADED_BLACK,
  CHANNEL_NOTIFICATIONS,
  LAYOUTS,
  USER_IS_TYPING,
  COLORS,
  DND_OPTIONS,
} from '../constants'

const Channel = props => {
  let typingInterval
  const [over, setOver] = useState(false)
  const [menu, setMenu] = useState(false)
  const [active, setActive] = useState(false)
  const [typing, setTyping] = useState([])
  const [name, setName] = useState('')
  const [isBroadcast, setIsBroadcast] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [iconColor, setIconColor] = useState('black')
  const [icon, setIcon] = useState('')
  const [showAllThreads, setShowAllThreads] = useState(false)
  const [collapsedThreads, setCollapsedThreads] = useState(false)
  const [channelNotificationEvery, setChannelNotificationEvery] = useState(null)
  const dispatch = useDispatch()
  const [iconCollapsable, setIconCollapsable] = useState(false)
  const threads = useSelector(state => state.threads)
  const channelNotifications = useSelector(state => state.channelNotifications)
  const channelUnreads = useSelector(state => state.channelUnreads)
  const user = useSelector(state => state.user)
  const params = useParams()
  const location = useLocation()
  const maxThreads = 3
  const icons = [
    'bell',
    'pen',
    'star',
    'flag',
    'smile',
    'shield',
    'monitor',
    'smartphone',
    'hash',
    'compass',
    'package',
    'radio',
    'box',
    'lock',
    'attachment',
    'at',
    'check',
    null,
  ]
  const colors1 = [
    '#050f2c',
    '#003666',
    '#00aeff',
    '#3369e7',
    '#8e43e7',
    '#b84592',
    '#ff4f81',
    '#ff6c5f',
    '#ffc168',
    '#2dde98',
    '#1cc7d0',
    '#00a98f',
  ]
  const colors = [...COLORS, ...colors1]
  const doNotDisturb = doNotDisturbUser(user)

  const fetchThreads = async () => {
    const {
      data: { threads },
    } = await GraphqlService.getInstance().threads(props.id)
    if (!threads) return

    // Debug
    // handleMessageModalOpen(threads[0].id)
    // Convert all of the dates to unix timestamps
    // And then sort them by the timestamp
    // ANY other sorting will happen on the reducer
    dispatch(
      hydrateThreads(
        threads.map(thread => {
          return {
            ...thread,
            updatedAt: moment(thread.updatedAt)
              .toDate()
              .getTime(),
          }
        })
      )
    )
  }

  // Listen for typing indicators
  useEffect(() => {
    // Listen for typing messages
    EventService.getInstance().on(USER_IS_TYPING, ({ channelId, userName }) => {
      if (channelId != props.id) return

      // Create a timestamp
      const userTime = new Date().getTime()

      // remove ourselves
      if (userName == user.username) return

      // Add it to the array
      setTyping([...typing, { userName, userTime }])
    })

    // Check if the typing array is valid every 1 second
    // Iterage over the current channel's typing array
    // If it's too old - then remove it and notify everyone else
    typingInterval = setInterval(() => {
      setTyping(getUsersThatAreStillTyping(typing))
    }, 2500)

    // Remove the interval
    return () => {
      clearInterval(typingInterval)
    }
  }, [])

  // Fetch threads
  useEffect(() => {
    const { pathname } = location
    const urlParts = pathname.split('/')
    const lastIndex = urlParts.length - 1
    const secondLastIndex = urlParts.length - 2
    const active = urlParts[lastIndex] == props.id || urlParts[secondLastIndex] == props.id

    // Update our active status
    setActive(active)

    // Fetch the threads if this is the active thread
    if (active) fetchThreads()
  }, [location])

  // Set the excerpt
  useEffect(() => {
    if (!props.id) return
    if (!props.excerpt) return

    setExcerpt(shortenMarkdownText(props.excerpt))
  }, [props.excerpt])

  // Set background colors
  useEffect(() => {
    if (!props.id) return
    if (!user.id) return

    setName(props.private ? getChannelNameWithMembers(props.members, user.id) : props.name)
    setIsBroadcast(props.readonly)
    setIsPublic(props.public)
    setIconColor(shade(props.color || '#000000', 0.5))
    setIcon(props.readonly ? 'radio' : props.public ? 'hash' : 'lock')
  }, [user, props.id, props.color, props.members, props.public, props.readonly, props.name])

  const handleUpdateIcon = async icon => {
    try {
      await GraphqlService.getInstance().updateChannel(props.id, { icon })

      dispatch(updateChannel(props.id, { icon }))
    } catch (e) {
      logger(e)
    }
  }

  const handleUpdateColor = async color => {
    try {
      await GraphqlService.getInstance().updateChannel(props.id, { color })

      dispatch(updateChannel(props.id, { color }))
    } catch (e) {
      logger(e)
    }
  }

  const handleMessageModalOpen = async messageId => {
    const {
      data: { message },
    } = await GraphqlService.getInstance().message(messageId)
    if (!message) return
    dispatch(hydrateMessage(message))
  }

  const handleMenuIconClick = e => {
    e.stopPropagation()

    const channelId = props.id
    const channelNotification = channelNotifications.filter(
      channelNotification => channelNotification.channelId == channelId
    )[0]
    const every = channelNotification ? channelNotification.every : null

    // This might be null - which is correct
    setChannelNotificationEvery(every)
    setMenu(true)
  }

  const handleUpdateUserArchived = async () => {
    try {
      const userId = user.id
      const channelId = props.id
      const archived = !props.archived

      await GraphqlService.getInstance().updateUserArchived(userId, channelId, archived)

      setMenu(false)
      dispatch(updateUserArchived(userId, channelId, archived))
    } catch (e) {
      logger(e)
    }
  }

  const handleUpdateUserMuted = async () => {
    try {
      const userId = user.id
      const channelId = props.id
      const muted = !props.muted

      await GraphqlService.getInstance().updateUserMuted(userId, channelId, muted)

      setMenu(false)
      dispatch(updateUserMuted(userId, channelId, muted))
    } catch (e) {
      logger(e)
    }
  }

  const handleChannelNotification = every => {
    const channelId = props.id
    const channelNotification = channelNotifications.filter(
      channelNotification => channelNotification.channelId == channelId
    )[0]

    // If it doesn't exist, then create it
    if (!channelNotification) {
      handleChannelNotificationAdd(every)
    } else {
      // It exists, but the EVERY part is different, then update it
      // ELSE - if it's the same, then we delete the notification
      if (channelNotification.every != every) {
        handleChannelNotificationUpdate(channelNotification.id, every)
      } else {
        handleChannelNotificationDelete(channelNotification.id)
      }
    }
  }

  const handleChannelNotificationAdd = async every => {
    try {
      const userId = user.id
      const channelId = props.id
      const { data } = await GraphqlService.getInstance().createChannelNotification(userId, channelId, every)

      setMenu(false)
      dispatch(createChannelNotification(data.createChannelNotification))
    } catch (e) {
      logger(e)
    }
  }

  const handleChannelNotificationUpdate = async (channelNotificationId, every) => {
    try {
      await GraphqlService.getInstance().updateChannelNotification(channelNotificationId, every)

      setMenu(false)
      dispatch(updateChannelNotification(channelNotificationId, every))
    } catch (e) {
      logger(e)
    }
  }

  const handleChannelNotificationDelete = async channelNotificationId => {
    try {
      await GraphqlService.getInstance().deleteChannelNotification(channelNotificationId)

      setMenu(false)
      dispatch(deleteChannelNotification(channelNotificationId))
    } catch (e) {
      logger(e)
    }
  }

  const renderChannelType = () => {
    if (isBroadcast) {
      return (
        <ChannelType>
          <IconComponent icon="radio" size={12} color="#0083c4" />
        </ChannelType>
      )
    }

    if (isPublic) {
      return (
        <ChannelType>
          <IconComponent icon="unlock" size={12} color="#0083c4" />
        </ChannelType>
      )
    }

    return null
  }

  const renderUnreadBadge = () => {
    if (!props.unread) return null
    if (props.unread == 0) return null
    if (props.muted) return null
    if (doNotDisturb) return null

    // Otherwise show this
    return <ChannelBadge color={props.color}>{props.unread}</ChannelBadge>
  }

  const renderIsTyping = () => {
    const isTyping = typing.length != 0

    if (!isTyping) return null

    return (
      <IsTyping>
        <TypingComponent />
      </IsTyping>
    )
  }

  const renderAvatar = () => {
    if (props.private) {
      if (props.members.length == 2) {
        const otherUser = getChannelOtherUser(props.members, user.id)
        return (
          <Avatar
            muted={props.muted}
            color={props.color}
            userId={otherUser.id}
            size={IS_MOBILE ? 'medium-small' : 'small'}
            image={otherUser.image}
            title={otherUser.name}
          />
        )
      } else {
        return (
          <ChannelIcon color={props.color}>
            <MembersCountText color={iconColor}>{props.members.length}</MembersCountText>
          </ChannelIcon>
        )
      }
    } else {
      return (
        <ChannelIcon color={null}>
          {!props.private && <IconComponent icon={props.icon} size={20} color={active ? props.color : '#202933'} />}
        </ChannelIcon>
      )
    }
  }

  const renderExcerpt = () => {
    const isTyping = typing.length != 0

    if (isTyping) {
      return (
        <ChannelExcerpt>
          &nbsp;
          <ChannelExcerptTextContainer>
            <ChannelExcerptText active={false}>...typing...</ChannelExcerptText>
          </ChannelExcerptTextContainer>
        </ChannelExcerpt>
      )
    } else {
      return (
        <ChannelExcerpt>
          &nbsp;
          <ChannelExcerptTextContainer>
            <ChannelExcerptText active={active || props.unread != 0}>{excerpt}</ChannelExcerptText>
          </ChannelExcerptTextContainer>
        </ChannelExcerpt>
      )
    }
  }

  const renderThreads = () => {
    if (collapsedThreads || threads.length == 0 || !active) return null

    return (
      <Threads>
        {threads.map((thread, index) => {
          if (!showAllThreads && index >= maxThreads) return

          // If this channel has unread messages
          // See if any of those are related to this thread
          // thread = message || thread.id == parent.id
          // threaded is implicit (true) here if it matches
          const unread =
            props.unread && !doNotDisturb
              ? !!channelUnreads
                  .filter(channelUnread => channelUnread.parentId == thread.id && channelUnread.threaded)
                  .flatten()
              : false

          return (
            <Thread key={index} onClick={() => handleMessageModalOpen(thread.id)}>
              <ThreadLine color={props.color} />
              <ThreadText unread={unread}>{thread.body}</ThreadText>
            </Thread>
          )
        })}

        {threads.length > maxThreads && (
          <Thread onClick={() => setShowAllThreads(!showAllThreads)}>
            <ThreadLine color={props.color} />
            <ThreadText bold>{showAllThreads ? 'Show less' : 'Show more'}</ThreadText>
          </Thread>
        )}
      </Threads>
    )
  }

  const renderThreadsToggle = () => {
    if (threads.length == 0 || !active) return null

    return (
      <CollapseThreadsIcon onClick={() => setCollapsedThreads(!collapsedThreads)}>
        <IconComponent
          icon={collapsedThreads ? 'chevron-right' : 'chevron-down'}
          color="#91A0B0"
          size={14}
          className="button"
        />
      </CollapseThreadsIcon>
    )
  }

  const renderPopup = () => {
    if (!over) return null

    return (
      <Popup
        handleDismiss={() => setMenu(false)}
        visible={menu}
        width={200}
        direction="right-bottom"
        content={
          <React.Fragment>
            <Menu
              items={[
                {
                  text: 'Mentions' + (channelNotificationEvery == CHANNEL_NOTIFICATIONS.MENTIONS ? ' (current)' : ''),
                  label: 'Notify me of mentions only',
                  icon: <IconComponent icon="at" size={18} color="#11161c" />,
                  onClick: e => handleChannelNotification(CHANNEL_NOTIFICATIONS.MENTIONS),
                },
                {
                  text: 'Messages' + (channelNotificationEvery == CHANNEL_NOTIFICATIONS.MESSAGES ? ' (current)' : ''),
                  label: 'Notify me of all messages',
                  icon: <IconComponent icon="message-circle" size={18} color="#11161c" />,
                  onClick: e => handleChannelNotification(CHANNEL_NOTIFICATIONS.MESSAGES),
                },
                {
                  text: 'None' + (channelNotificationEvery == CHANNEL_NOTIFICATIONS.NONE ? ' (current)' : ''),
                  label: 'Do not notify me at all',
                  icon: <IconComponent icon="message-minus" size={18} color="#11161c" />,
                  onClick: e => handleChannelNotification(CHANNEL_NOTIFICATIONS.NONE),
                },
              ]}
            />
            <div className="w-100 border-top">
              <Menu
                items={[
                  {
                    text: props.archived ? 'Unarchive' : 'Archive',
                    onClick: e => handleUpdateUserArchived(),
                  },
                  {
                    text: props.muted ? 'Unmute' : 'Mute',
                    onClick: e => handleUpdateUserMuted(),
                  },
                ]}
              />
            </div>

            <div className="w-100 p-20 column align-items-start border-top">
              <div className="row w-100">
                <CollapseTitleText>Theme</CollapseTitleText>
                <IconComponent
                  icon={iconCollapsable ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#acb5bd"
                  className="button"
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIconCollapsable(!iconCollapsable)
                  }}
                />
              </div>
              <Collapsable className={iconCollapsable ? 'open' : ''}>
                <div className="row wrap pt-20">
                  {colors.map((color, index) => (
                    <ColorCircle
                      color={color}
                      current={color == props.color}
                      key={index}
                      onClick={e => {
                        e.stopPropagation()
                        setMenu(false)
                        handleUpdateColor(color)
                      }}
                    />
                  ))}
                </div>
                <div className="row wrap w-100 mt-10">
                  {icons.map((icon, index) => {
                    return (
                      <IconCircle current={icon == props.icon} key={index}>
                        <IconComponent
                          icon={icon}
                          size={16}
                          color="#ACB5BD"
                          onClick={e => {
                            e.stopPropagation()
                            setMenu(false)
                            handleUpdateIcon(icon)
                          }}
                        />
                      </IconCircle>
                    )
                  })}
                </div>
              </Collapsable>
            </div>
          </React.Fragment>
        }
      >
        <ChannelMoreIcon onClick={handleMenuIconClick}>
          <IconComponent icon="more-h" color="#91A0B0" size={15} />
        </ChannelMoreIcon>
      </Popup>
    )
  }

  const renderColorBar = () => {
    if (props.private) return null

    return (
      <Color>
        <ColorInner color={props.color} />
      </Color>
    )
  }

  return (
    <ChannelContainer>
      {renderColorBar()}
      <ChannelInnerContainer
        onClick={e => {
          e.preventDefault()

          if (!IS_MOBILE) props.onNavigate()
        }}
        onTouchEnd={e => {
          e.preventDefault()

          if (IS_MOBILE) props.onNavigate()
        }}
        onMouseEnter={() => setOver(true)}
        onMouseLeave={() => {
          setOver(false)
          setMenu(false)
        }}
        unread={props.unread}
      >
        <ChannelContainerPadding active={active}>
          {renderAvatar()}
          {renderIsTyping()}

          <ChannelContents>
            <ChannelInnerContents>
              <ChannelTitleRow>
                <ChannelTitle color={props.color} active={active}>
                  {name}
                </ChannelTitle>
              </ChannelTitleRow>
              {renderChannelType()}
              {renderExcerpt()}
            </ChannelInnerContents>
          </ChannelContents>
        </ChannelContainerPadding>

        {renderPopup()}
        {renderUnreadBadge()}
        {renderThreadsToggle()}
      </ChannelInnerContainer>

      {renderThreads()}
    </ChannelContainer>
  )
}

Channel.propTypes = {
  dark: PropTypes.bool,
  muted: PropTypes.bool,
  archived: PropTypes.bool,
  unread: PropTypes.number,
  id: PropTypes.string,
  color: PropTypes.string,
  name: PropTypes.string,
  image: PropTypes.string,
  icon: PropTypes.string,
  label: PropTypes.string,
  excerpt: PropTypes.string,
  public: PropTypes.bool,
  private: PropTypes.bool,
  readonly: PropTypes.bool,
  members: PropTypes.array,
  onNavigate: PropTypes.any,
}

const ChannelContainer = styled.div`
  position: relative;
  width: 100%;
`

const Color = styled.div`
  position: absolute;
  left: 0px;
  top: 0px;
  width: 3px;
  height: 100%;
`

const ColorInner = styled.div`
  background-color: ${props => props.color};
  border-bottom-right-radius: 2px;
  border-top-right-radius: 2px;
  position: absolute;
  left: 0px;
  top: 5%;
  width: 3px;
  height: 90%;
`

const IsTyping = styled.div`
  position: absolute;
  left: -22px;
  top: 2px;
  background: white;
  border-radius: 5px;
  padding: 2px;
  z-index: 11;
`

const ChannelIcon = styled.div`
  position: relative;
  background-color: ${props => props.color};
  width: 20px;
  height: 20px;
  border-radius: 7px;
  overflow: hidden;
  position: relative;
  top: 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;
`

const Threads = styled.div`
  position: relative;
`

const ThreadLine = styled.div`
  background: ${props => (props.color ? props.color : '#858E96')};
  width: 2px;
  height: 100%;
  position: absolute;
  left: 36px;
  bottom: 5px;
  display: none;
`

const ChannelType = styled.div`
  background: #def5ff;
  border-radius: 5px;
  padding: 3px;
  margin-right: 3px;
`

const MembersCountText = styled.div`
  color: ${props => props.color};
  font-weight: 900;
  font-size: 10px;
`

const CollapseTitleText = styled.div`
  flex: 1;
  color: #11161c;
  font-weight: 700;
  font-size: 12px;
`

const CollapseThreadsIcon = styled.div`
  position: absolute;
  top: 4px;
  left: 4px;
  width: 17px;
  height: 15px;
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;
  z-index: 10;
  border-radius: 3px;

  :hover {
    background-color: #f0f3f5;
  }
`

const Thread = styled.div`
  padding-left: 52px;
  padding-right: 70px;
  padding-bottom: 5px;
  cursor: pointer;
  position: relative;

  :hover {
    opacity: 0.75;
  }
`

const ThreadText = styled.div`
  padding-bottom: 2px;
  padding-top: 2px;
  font-size: 11px;
  font-weight: 700;
  color: ${props => (props.unread ? '#202933' : '#CFD4D9')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 5px;
`

const IconCircle = styled.div`
  background: ${props => (props.selected ? '#F0F3F5' : 'white')};
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;

  &:hover {
    background: #f0f3f5;
  }
`

const ColorCircle = styled.div`
  background: ${props => props.color};
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 3px;
  margin-bottom: 3px;
  border: 1px solid ${props => (props.selected ? '#F0F3F5' : 'white')}
  transition: .2s border;

  &:hover {
    border: 3px solid #F0F3F5;
  }
`

const UserName = styled.div`
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  color: #202933;
  margin-top: 15px;
`

const UserRole = styled.div`
  font-size: 12px;
  text-align: center;
  color: #91a0b0;
  margin-top: 5px;
  font-weight: 600;
`

const ChannelInnerContainer = styled.li`
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  margin-bottom: 0px;
  padding-right: 20px;
  transition: 0.2s background-color;
  width: 100%;
  margin-bottom: 2px;

  &:hover {
    /* NOTHING YET */
  }
`

const TeamRole = styled.div`
  color: #cfd4d9;
  font-weight: 700;
  font-size: 11px;
`

const TeamName = styled.div`
  color: #202933;
  font-weight: 600;
  font-size: 18px;
`

const ChannelContainerPadding = styled.div`
  flex: 1;
  margin: 0px 0px 0px 25px;
  padding: 2px;
  background-color: ${props => (props.active ? '#F8F9FA' : 'transparent')};
  display: flex;
  flex-direction: row;
  align-items: stretch;
  align-content: center;
  justify-content: center;
  position: relative;
  border-radius: 5px;

  @media only screen and (max-width: 768px) {
    padding: 5px 0px 5px 20px;
  }
`

const ChannelBadge = styled.div`
  padding: 3px 7px 3px 7px;
  border-radius: 10px;
  background-color: ${props => props.color || '#122640'};
  font-size: 11px;
  color: white;
  font-weight: 600;
  margin-left: 5px;
`

const ChannelTitle = styled.div`
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: ${props => (props.active ? props.color : '#202933')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
  /*letter-spacing: -0.5px;*/
  margin-right: 5px;
`

const ChannelTitleSmall = styled.div`
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: ${props => (props.active ? '#21262A' : '#485056')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
  /*letter-spacing: -0.5px;*/
  margin-right: 5px;
`

const ChannelTitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  align-content: center;
  justify-content: center;
`

const ChannelTitleRowIcon = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;
  padding: 0px;
  margin: 0px;
`

const ChannelExcerpt = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;

  @media only screen and (max-width: 768px) {
    width: 100%;
  }
`

const ChannelExcerptTextContainer = styled.div`
  overflow: hidden;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0px;
  left: 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: flex-start;
`

const ChannelExcerptText = styled.span`
  font-size: 11px;
  color: #dee2e5;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  align: left;
  flex: 1;
  opacity: 0.75;
`

const ChannelContents = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  align-content: flex-start;
  justify-content: flex-start;
  position: relative;
  flex: 1;
  padding-left: 10px;
`

const ChannelInnerContents = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: flex-start;
  position: relative;

  @media only screen and (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
  }
`

const ChannelMoreIcon = styled.span`
  cursor: pointer;
  opacity: 1;
  transition: opacity 0.5s;
  background-color: #f8f9fa;
  display: inline-block;
  z-index: 5;
  right: 0px;
  top: 0px;
  display: flex;
  margin-left: 5px;
  margin-right: 4px;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;

  &:hover {
    opacity: 0.75;
  }
`

const SortableItem = SortableElement(({ pathname, channel, onNavigate }) => {
  const type = 'public'

  return (
    <Channel
      id={channel.id}
      color={channel.color}
      icon={channel.icon}
      unread={channel.unread}
      name={channel.name}
      image={channel.image}
      excerpt={channel.excerpt}
      public={channel.public}
      members={channel.members}
      private={channel.private}
      readonly={channel.readonly}
      muted={channel.muted}
      archived={channel.archived}
      onNavigate={() => onNavigate(channel.id)}
    />
  )
})

const SortableList = SortableContainer(({ channels, pathname, onNavigate }) => {
  return (
    <Ul>
      {channels.map((channel, index) => {
        return (
          <SortableItem key={channel.id} index={index} channel={channel} pathname={pathname} onNavigate={onNavigate} />
        )
      })}
    </Ul>
  )
})

const Ul = styled.ul`
  margin: 0px;
  padding: 0px;
  list-style-type: none;
`

class ChannelsComponent extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      filter: '',
      results: [],
      newChannelModal: false,
      teamModal: false,
      teamModalStart: 0,
      channelPublicPopup: false,
      accountModal: false,
      accountMenu: false,
      archivedCollapsed: false,
      starredCollapsed: true,
      publicCollapsed: true,
      privateCollapsed: true,
      starred: [],
      muted: [],
      archived: [],
      public: [],
      private: [],
      loading: false,
      error: false,
      positionCollapsableOpen: false,
      positionCollapsableInput: '',
      statusCollapsableOpen: false,
      presenceCollapsableOpen: false,
      statusCollapsableInput: '',
      dndCollapsableOpen: false,
      dndIndex: 0,
      hideChannels: false,
      hash: null,
      starredChannelsUnread: false,
      archivedChannelsUnread: false,
      privateChannelsUnread: false,
      publicChannelsUnread: false,
    }

    this.createChannel = this.createChannel.bind(this)
    this.createPrivateChannel = this.createPrivateChannel.bind(this)
    this.createPublicChannel = this.createPublicChannel.bind(this)
    this.updateUserStatus = this.updateUserStatus.bind(this)
    this.updateUserPresence = this.updateUserPresence.bind(this)
    this.updateUserDnd = this.updateUserDnd.bind(this)
    this.getCurrentDndIndex = this.getCurrentDndIndex.bind(this)
    this.handleTeamMemberPositionChange = this.handleTeamMemberPositionChange.bind(this)

    this.renderHeaderButtons = this.renderHeaderButtons.bind(this)
    this.renderNewChannelModal = this.renderNewChannelModal.bind(this)
    this.renderAccountModal = this.renderAccountModal.bind(this)
    this.renderTeamModal = this.renderTeamModal.bind(this)
    this.renderHeader = this.renderHeader.bind(this)
    this.renderStarred = this.renderStarred.bind(this)
    this.renderPublic = this.renderPublic.bind(this)
    this.renderPrivate = this.renderPrivate.bind(this)
    this.renderArchived = this.renderArchived.bind(this)
    this.renderDnd = this.renderDnd.bind(this)
    this.navigate = this.navigate.bind(this)

    this.openAccountSettings = this.openAccountSettings.bind(this)
    this.openTeamSubscription = this.openTeamSubscription.bind(this)
    this.openTeamSettings = this.openTeamSettings.bind(this)
    this.openTeamDirectory = this.openTeamDirectory.bind(this)
    this.signout = this.signout.bind(this)
    this.openUserMenu = this.openUserMenu.bind(this)
    this.closeUserMenu = this.closeUserMenu.bind(this)

    this.dndOptions = DND_OPTIONS
  }

  navigate(channelId, type) {
    if (this.props.channel.id == channelId) return

    // Store this for reloads
    StorageService.setStorage(NAVIGATE, JSON.stringify({ channelId, type }))

    // If there is a suffix
    let suffix = ''

    // If there is an extension open,
    // then add it when browsing
    // extensions always have the slug at the end
    if (isExtensionOpen()) {
      const urlParts = window.location.href.split('/')
      const extension = urlParts[urlParts.length - 1]

      suffix = `/${extension}`
    }

    // Consutrct the url we need to go to
    const to = `/app/team/${this.props.team.id}/channel/${channelId}${suffix}`

    // first close the drawer (mobile!!!)
    this.props.toggleDrawer()

    // AND GO!
    this.props.history.push(to)
  }

  async handleTeamMemberPositionChange(position) {
    try {
      const teamId = this.props.team.id
      const userId = this.props.user.id

      await GraphqlService.getInstance().updateTeamMemberPosition(teamId, userId, position)

      this.props.updateTeamMemberPosition(position)
    } catch (e) {
      logger(e)
    }
  }

  getCurrentDndIndex() {
    return this.dndOptions.reduce((acc, dnd, index) => {
      return dnd.value == this.props.user.dnd ? acc + index : acc + 0
    }, 0)
  }

  async updateUserDnd(dnd) {
    try {
      const userId = this.props.user.id
      const teamId = this.props.team.id
      const dndUntil = moment()
        .add(dnd, 'hours')
        .toISOString()

      await GraphqlService.getInstance().updateUser(userId, { dnd, dndUntil })

      this.props.updateUserDnd(dnd, dndUntil)
    } catch (e) {
      logger(e)
    }
  }

  async updateUserPresence(presence) {
    this.setState({ presenceMenu: false })

    try {
      const userId = this.props.user.id
      await GraphqlService.getInstance().updateUser(userId, { presence })
      this.props.updateUserPresence(presence)
    } catch (e) {
      logger(e)
    }
  }

  async updateUserStatus(userId, teamId, status) {
    try {
      await GraphqlService.getInstance().updateUser(userId, { status })

      this.props.updateUserStatus(status)
    } catch (e) {
      logger(e)
    }
  }

  static getDerivedStateFromProps(props, state) {
    const unserializedOrder = StorageService.getStorage(CHANNELS_ORDER)
    let serializedOrder = unserializedOrder ? JSON.parse(unserializedOrder) : {}

    let starredChannelsUnread = false
    let archivedChannelsUnread = false
    let privateChannelsUnread = false
    let publicChannelsUnread = false

    // Createe the channel lists
    // And add unread counters
    const starredChannels = props.channels
      .filter((channel, index) => props.user.starred.indexOf(channel.id) != -1)
      .map(channel => {
        return {
          ...channel,
          unread: getUnreadCountForChannelId(props.channelUnreads, channel.id),
        }
      })
    const archivedChannels = props.channels
      .filter((channel, index) => props.user.archived.indexOf(channel.id) != -1)
      .map(channel => {
        return {
          ...channel,
          unread: getUnreadCountForChannelId(props.channelUnreads, channel.id),
        }
      })
    const privateChannels = props.channels
      .filter(
        (channel, index) =>
          channel.private &&
          props.user.archived.indexOf(channel.id) == -1 &&
          props.user.starred.indexOf(channel.id) == -1
      )
      .map(channel => {
        return {
          ...channel,
          unread: getUnreadCountForChannelId(props.channelUnreads, channel.id),
        }
      })
    const publicChannels = props.channels
      .filter(
        (channel, index) =>
          !channel.private &&
          props.user.archived.indexOf(channel.id) == -1 &&
          props.user.starred.indexOf(channel.id) == -1
      )
      .map((channel, index) => {
        // We explod the object here because channel isn't mutable
        let mutableChannel = { ...channel }

        // Set up some variables
        const channelId = channel.id
        const channelOrder = serializedOrder[channelId]

        // If there is a channelOrder value, then assign the property CHANNEL_ORDER_INDEX to it
        // If there isn't one, then we set the index to the length of the index
        // We save add the length so we don't interfere with current orderings (so it should be added to the bottom)
        mutableChannel[CHANNEL_ORDER_INDEX] =
          channelOrder != null && channelOrder != undefined ? channelOrder : props.channels.length + index

        // Return this (for sorting)
        return mutableChannel
      })
      .sort((a, b) => {
        return parseFloat(a[CHANNEL_ORDER_INDEX]) - parseFloat(b[CHANNEL_ORDER_INDEX])
      })
      .map(channel => {
        return {
          ...channel,
          unread: getUnreadCountForChannelId(props.channelUnreads, channel.id),
        }
      })

    // Calculate unread for groups
    starredChannels.map(channel => (!!channel.unread ? (starredChannelsUnread = true) : null))
    archivedChannels.map(channel => (!!channel.unread ? (archivedChannelsUnread = true) : null))
    privateChannels.map(channel => (!!channel.unread ? (privateChannelsUnread = true) : null))
    publicChannels.map(channel => (!!channel.unread ? (publicChannelsUnread = true) : null))

    return {
      starred: starredChannels,
      archived: archivedChannels,
      private: privateChannels,
      public: publicChannels,
      starredChannelsUnread,
      archivedChannelsUnread,
      privateChannelsUnread,
      publicChannelsUnread,
    }
  }

  createPrivateChannel(users) {
    const { user } = this.props
    const currentUser = { id: user.id, name: user.name, username: user.username }
    this.createChannel(null, null, null, currentUser, [...users, currentUser], true)
    this.setState({ filter: '', showFilter: false, results: [] })
  }

  createPublicChannel(name) {
    const { user } = this.props
    const currentUser = { id: user.id, name: user.name, username: user.username }
    this.createChannel(name, null, null, currentUser, [currentUser], false)
    this.setState({ filter: '', showFilter: false, results: [] })
  }

  async createChannel(name, description, image, user, users, isPrivate) {
    logger({ user, users })

    try {
      const teamId = this.props.team.id
      const userId = user.id
      const { channels } = this.props

      // If it's private - see if it already exists
      if (isPrivate) {
        const existingChannel = privateChannelWithSameMembers(channels, users)

        // 3. If it's found - then go there first (don't create a new one)
        if (existingChannel) return this.props.history.push(`/app/team/${teamId}/channel/${existingChannel.id}`)
      }

      // Otherwise create the new channel
      // 1) Create the channel object based on an open channel or private
      // 2) Seperate the members object for the API call
      const { data } = await GraphqlService.getInstance().createChannel({
        user,
        users,
        channel: {
          name,
          description,
          image,
          team: teamId,
          user: userId,
          messages: [],
          public: false,
          private: isPrivate,
        },
      })

      // Get the ID and pull the new channels from the GQL to add to our channels list
      const createChannel = data.createChannel
      const channelId = createChannel.id
      const newChannel = await GraphqlService.getInstance().channel(channelId)

      // Update our redux store
      this.props.createChannel(newChannel.data.channel)

      // Join this channel ourselves
      MessagingService.getInstance().join(channelId)

      // Navigate there
      browserHistory.push(`/app/team/${teamId}/channel/${channelId}`)
    } catch (e) {
      logger(e)
    }
  }

  componentDidMount() {
    const { teamId } = this.props.match.params
    const userId = this.props.user.id

    // Fetch the team & channels
    this.fetchData(teamId, userId)

    // Toggle channels drawer (from Dock)
    EventService.getInstance().on(TOGGLE_CHANNELS_DRAWER, data => {
      this.setState({
        hideChannels: !this.state.hideChannels,
      })
    })
  }

  componentDidUpdate(prevProps) {
    const { teamId } = this.props.match.params
    const userId = this.props.user.id

    if (teamId != prevProps.match.params.teamId) this.fetchData(teamId, userId)
  }

  async fetchData(teamId, userId) {
    this.setState({ loading: true, error: null })

    try {
      // await GraphqlService.getInstance().channels(teamId, userId)
      // Not sure why I was using the above to seperate the calls
      const { data } = await GraphqlService.getInstance().channelUnreads(teamId, userId)
      const channelUnreads = data.channelUnreads
      const team = await GraphqlService.getInstance().teamChannelsComponent(teamId, userId)
      const channels = team.data.team.channels
      const channelIds = channels.map(channel => channel.id)

      // Kill the loading
      this.setState({ loading: false, error: null })

      // Join the channels
      MessagingService.getInstance().joins(channelIds)

      // Populate our stores
      this.props.hydrateTeam(team.data.team)
      this.props.hydrateChannels(channels)
      this.props.hydrateChannelUnreads(channelUnreads)

      // Cacheed nav info
      const navigation = StorageService.getStorage(NAVIGATE)

      // If thre is a reload - reidrect them
      if (navigation) {
        const { type, channelId } = JSON.parse(navigation)
        if (type && channelId) {
          this.navigate(channelId, type)
        }
      }
    } catch (e) {
      this.setState({ loading: false, error: e })
    }
  }

  // Child render functions that compose the
  // parts of the channels sidebar
  renderDnd() {
    const { dnd, dndUntil, timezone } = this.props.user
    const currentDate = moment()
    const dndUntilDate = moment(dndUntil).tz(timezone)
    const currentDateIsAfterDndDate = currentDate.isAfter(dndUntilDate)
    const dndIsSet = !!dnd

    return (
      <div className="w-100 p-20 column align-items-start border-bottom">
        <div className="row w-100">
          <CollapseTitleText>Do not disturb</CollapseTitleText>
          <Toggle
            on={dndIsSet && !currentDateIsAfterDndDate}
            onChange={() => {
              if (!dndIsSet || currentDateIsAfterDndDate) {
                this.updateUserDnd(1)
              } else {
                this.updateUserDnd(0)
              }
            }}
          />
        </div>
        <Collapsable className={dndIsSet && !currentDateIsAfterDndDate ? 'open' : ''}>
          <div className="column w-100 mt-10">
            <div className="small bold color-d2 flexer mb-10">Turn off notifications for:</div>
            <Select
              selected={this.getCurrentDndIndex()}
              options={this.dndOptions}
              onSelect={index => this.updateUserDnd(this.dndOptions[index].value)}
            />
          </div>
        </Collapsable>
      </div>
    )
  }

  renderNewChannelModal() {
    if (!this.state.newChannelModal) return null

    return (
      <NewChannelModal
        onClose={() => this.setState({ newChannelModal: false })}
        onCreate={users => {
          this.createPrivateChannel(users)
          this.setState({ newChannelModal: false })
        }}
      />
    )
  }

  renderHeader() {
    return (
      <Popup
        handleDismiss={this.closeUserMenu}
        visible={this.state.accountMenu}
        width={300}
        direction="left-bottom"
        containerClassName="w-100"
        content={
          <div className="w-100">
            <PopupHeader className="w-100 p-20 border-bottom column align-items-center">
              <Avatar
                size="x-large"
                image={this.props.user.image}
                presence={this.props.user.presence || 'online'}
                title={this.props.user.name}
              />
              <UserName>{this.props.user.name}</UserName>
              <UserRole>{this.props.team.position}</UserRole>
            </PopupHeader>

            <div className="w-100 p-20 column align-items-start border-bottom">
              <div className="row w-100">
                <CollapseTitleText>Presence</CollapseTitleText>
                <IconComponent
                  icon={this.state.presenceCollapsableOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#acb5bd"
                  className="button"
                  onClick={() => {
                    this.setState({
                      presenceCollapsableOpen: !this.state.presenceCollapsableOpen,
                    })
                  }}
                />
              </div>
              <Collapsable className={this.state.presenceCollapsableOpen ? 'open' : ''}>
                <div className="row w-100 mt-10">
                  <Menu
                    items={[
                      {
                        icon: <span style={{ fontSize: 14, color: '#36C5AB' }}>&#9679;</span>,
                        text: 'Online (default)',
                        onClick: () => this.updateUserPresence(null),
                      },
                      {
                        icon: <span style={{ fontSize: 14, color: '#FD9A00' }}>&#9679;</span>,
                        text: 'Away',
                        onClick: () => this.updateUserPresence('away'),
                      },
                      {
                        icon: <span style={{ fontSize: 14, color: '#FC1449' }}>&#9679;</span>,
                        text: 'Busy',
                        onClick: () => this.updateUserPresence('busy'),
                      },
                      {
                        icon: <span style={{ fontSize: 14, color: '#EAEDEF' }}>&#9679;</span>,
                        text: 'Invisible',
                        onClick: () => this.updateUserPresence('invisible'),
                      },
                    ]}
                  />
                </div>
              </Collapsable>
            </div>

            <div className="w-100 p-20 column align-items-start border-bottom">
              <div className="row w-100">
                <CollapseTitleText>Status</CollapseTitleText>
                <IconComponent
                  icon={this.state.statusCollapsableOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#acb5bd"
                  className="button"
                  onClick={() => {
                    this.setState({
                      statusCollapsableOpen: !this.state.statusCollapsableOpen,
                      statusCollapsableInput: this.props.user.status,
                    })
                  }}
                />
              </div>
              <Collapsable className={this.state.statusCollapsableOpen ? 'open' : ''}>
                <div className="row w-100 mt-10">
                  <Input
                    placeholder="Update your status"
                    value={this.state.statusCollapsableInput}
                    onChange={e =>
                      this.setState({
                        statusCollapsableInput: e.target.value,
                      })
                    }
                  />
                  <Button
                    size="small"
                    className="ml-10"
                    text="Ok"
                    theme="muted"
                    onClick={() => {
                      this.updateUserStatus(this.props.user.id, this.props.team.id, this.state.statusCollapsableInput)
                      this.setState({ statusCollapsableOpen: false })
                    }}
                  />
                </div>
              </Collapsable>
            </div>

            <div className="w-100 p-20 column align-items-start border-bottom">
              <div className="row w-100">
                <CollapseTitleText>Team role</CollapseTitleText>
                <IconComponent
                  icon={this.state.positionCollapsableOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#acb5bd"
                  className="button"
                  onClick={() => {
                    this.setState({
                      positionCollapsableOpen: !this.state.positionCollapsableOpen,
                      positionCollapsableInput: this.props.team.position,
                    })
                  }}
                />
              </div>
              <Collapsable className={this.state.positionCollapsableOpen ? 'open' : ''}>
                <div className="row w-100 mt-10">
                  <Input
                    placeholder="Update your role"
                    value={this.state.positionCollapsableInput}
                    onChange={e =>
                      this.setState({
                        positionCollapsableInput: e.target.value,
                      })
                    }
                  />
                  <Button
                    size="small"
                    className="ml-10"
                    text="Ok"
                    theme="muted"
                    onClick={() => {
                      this.handleTeamMemberPositionChange(this.state.positionCollapsableInput)
                      this.setState({ positionCollapsableOpen: false })
                    }}
                  />
                </div>
              </Collapsable>
            </div>

            {this.renderDnd()}

            <Menu
              items={[
                {
                  icon: <IconComponent icon="profile" size={18} color="#11161c" />,
                  text: 'Account settings',
                  onClick: this.openAccountSettings,
                },
                {
                  icon: <IconComponent icon="settings" size={18} color="#11161c" />,
                  text: 'Team settings',
                  onClick: this.openTeamSettings,
                },
                {
                  icon: <IconComponent icon="users" size={18} color="#11161c" />,
                  text: 'Team directory',
                  onClick: this.openTeamDirectory,
                },
                {
                  hide: true,
                  icon: <IconComponent icon="flag" size={18} color="#11161c" />,
                  text: 'Team subscription',
                  onClick: this.openTeamSubscription,
                },
                {
                  icon: <IconComponent icon="logout" size={18} color="#11161c" />,
                  text: 'Signout',
                  onClick: this.signout,
                },
              ]}
            />

            <div className="small regular color-d0 p-20 border-top">Build {version}</div>
          </div>
        }
      >
        <HeaderContainer>
          <Header>
            <HeaderInner onClick={this.openUserMenu}>
              <div className="column flexer">
                <TeamName>{this.props.team.name}</TeamName>
                <TeamRole>{this.props.team.position}</TeamRole>
              </div>

              <Avatar
                size="medium"
                presence={this.props.user.presence || 'online'}
                image={this.props.user.image}
                title={this.props.user.name}
                userId={this.props.user.id}
              />
            </HeaderInner>
          </Header>
        </HeaderContainer>
      </Popup>
    )
  }

  renderHeaderButtons() {
    const blankChannel = {
      ...this.props.channel,
      messages: [],
      id: null,
      color: null,
    }
    const location = window.location.href
    const locationParts = location.split('/')
    const tasksActive = locationParts[locationParts.length - 1] == 'tasks' && !this.props.channel.id
    const calendarActive = locationParts[locationParts.length - 1] == 'calendar' && !this.props.channel.id

    return (
      <React.Fragment>
        <div className="w-100">
          <ChannelContainer
            onClick={() => {
              this.props.hydrateChannel(blankChannel)
              this.props.history.push(`/app/team/${this.props.team.id}/calendar`)
            }}
          >
            <ChannelContainerPadding active={calendarActive}>
              <IconComponent icon="calendar-empty" size={20} color={calendarActive ? '#21262A' : '#485056'} />
              <ChannelContents>
                <ChannelInnerContents>
                  <ChannelTitleRow>
                    <ChannelTitleSmall active={calendarActive}>Calendar</ChannelTitleSmall>
                  </ChannelTitleRow>
                </ChannelInnerContents>
              </ChannelContents>
            </ChannelContainerPadding>
          </ChannelContainer>

          <ChannelContainer
            onClick={() => {
              this.props.hydrateChannel(blankChannel)
              this.props.history.push(`/app/team/${this.props.team.id}/tasks`)
            }}
          >
            <ChannelContainerPadding active={tasksActive}>
              <IconComponent icon="check-circle" size={20} color={tasksActive ? '#21262A' : '#485056'} />
              <ChannelContents>
                <ChannelInnerContents>
                  <ChannelTitleRow>
                    <ChannelTitleSmall active={tasksActive}>Tasks</ChannelTitleSmall>
                  </ChannelTitleRow>
                </ChannelInnerContents>
              </ChannelContents>
            </ChannelContainerPadding>
          </ChannelContainer>
        </div>
      </React.Fragment>
    )
  }

  renderStarred() {
    if (this.state.starred.length == 0) return null

    const { pathname } = this.props.history.location

    return (
      <React.Fragment>
        <HeadingRow>
          <CollapseGroupIcon onClick={() => this.setState({ starredCollapsed: !this.state.starredCollapsed })}>
            <IconComponent
              icon={this.state.starredCollapsed ? 'chevron-down' : 'chevron-right'}
              color="#CFD4D9"
              size={14}
              className="button"
            />
          </CollapseGroupIcon>
          <Heading>
            <Label bold={this.state.starredChannelsUnread}>Favourites</Label>
          </Heading>
        </HeadingRow>

        {this.state.starredCollapsed && (
          <React.Fragment>
            {this.state.starred.map((channel, index) => {
              const muted = this.props.user.muted.indexOf(channel.id) != -1
              const archived = this.props.user.archived.indexOf(channel.id) != -1
              const type = 'favourites'

              return (
                <Channel
                  key={index}
                  id={channel.id}
                  color={channel.color}
                  icon={channel.icon}
                  unread={channel.unread}
                  name={channel.name}
                  image={channel.image}
                  excerpt={channel.excerpt}
                  public={channel.public}
                  private={channel.private}
                  readonly={channel.readonly}
                  members={channel.members}
                  muted={muted}
                  archived={archived}
                  onNavigate={() => this.navigate(channel.id, type)}
                />
              )
            })}
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }

  renderPublic() {
    // Not this one - we want to always show this one
    // if (this.state.public.length == 0) return null
    const { pathname } = this.props.history.location
    const userId = this.props.user.id
    const teamId = this.props.team.id
    const unserializedOrder = StorageService.getStorage(CHANNELS_ORDER)
    let serializedOrder = unserializedOrder ? JSON.parse(unserializedOrder) : {}
    const type = 'public'
    const channels = this.state.public.map((channel, index) => {
      const muted = this.props.user.muted.indexOf(channel.id) != -1
      const archived = this.props.user.archived.indexOf(channel.id) != -1

      return {
        ...channel,
        muted,
        archived,
      }
    })

    return (
      <React.Fragment>
        <HeadingRow>
          <CollapseGroupIcon onClick={() => this.setState({ publicCollapsed: !this.state.publicCollapsed })}>
            <IconComponent
              icon={this.state.publicCollapsed ? 'chevron-down' : 'chevron-right'}
              color="#CFD4D9"
              size={14}
              className="button"
            />
          </CollapseGroupIcon>
          <Heading>
            <Label bold={this.state.publicChannelsUnread}>Channels</Label>
          </Heading>

          {this.props.team.role != 'GUEST' && (
            <QuickInputComponent
              visible={this.state.channelPublicPopup}
              width={200}
              direction="right-bottom"
              handleDismiss={() => this.setState({ channelPublicPopup: false })}
              handleAccept={name => this.setState({ channelPublicPopup: false }, () => this.createPublicChannel(name))}
              placeholder="New channel name"
            >
              <IconComponent
                icon="plus-circle"
                size={15}
                color="#CFD4D9"
                className="button"
                onClick={() => this.setState({ channelPublicPopup: true })}
              />
            </QuickInputComponent>
          )}
        </HeadingRow>

        {this.state.publicCollapsed && (
          <SortableList
            helperClass="sortableHelper"
            pressDelay={200}
            pathname={pathname}
            channels={channels}
            onSortEnd={({ oldIndex, newIndex }) => {
              arrayMove(channels, oldIndex, newIndex).map((channel, index) => {
                serializedOrder[channel.id] = index
              })

              // Save our new order
              StorageService.setStorage(CHANNELS_ORDER, JSON.stringify(serializedOrder))

              // Force update state
              this.setState({ hash: uuidv4() })
            }}
            onNavigate={channelId => this.navigate(channelId, type)}
          />
        )}

        {/*

        ⚠️
        --------------------------------------------------------------------------------------
        I'm keeping this here for reference in case something happens and we need to roll back
        --------------------------------------------------------------------------------------

        const { pathname } = this.props.history.location
        const userId = this.props.user.id
        const teamId = this.props.team.id

        {this.state.public.map((channel, index) => {
          const unread = this.props.common.unread.filter(row => channel.id == row.doc.channel).flatten()
          const unreadCount = unread ? unread.doc.count : 0
          const muted = this.props.user.muted.indexOf(channel.id) != -1
          const archived = this.props.user.archived.indexOf(channel.id) != -1

          return (
            <Channel
              key={index}
              id={channel.id}
              color={channel.color}
              icon={channel.icon}
              unread={muted ? 0 : unreadCount}
              name={channel.name}
              image={channel.image}
              excerpt={channel.excerpt}
              public={channel.public}
              private={channel.private}
              readonly={channel.readonly}
              muted={muted}
              archived={archived}
              onNavigate={() => this.navigate(channel.id)}
            />
          )
        })}

        */}
      </React.Fragment>
    )
  }

  renderPrivate() {
    const { pathname } = this.props.history.location

    return (
      <React.Fragment>
        <HeadingRow>
          <CollapseGroupIcon onClick={() => this.setState({ privateCollapsed: !this.state.privateCollapsed })}>
            <IconComponent
              icon={this.state.privateCollapsed ? 'chevron-down' : 'chevron-right'}
              color="#CFD4D9"
              size={14}
              className="button"
            />
          </CollapseGroupIcon>

          <Heading>
            <Label bold={this.state.privateChannelsUnread}>Private Conversations</Label>
          </Heading>

          <IconComponent
            icon="plus-circle"
            size={15}
            color="#CFD4D9"
            className="button"
            onClick={() => this.setState({ newChannelModal: true })}
          />
        </HeadingRow>

        {this.state.privateCollapsed && (
          <React.Fragment>
            {this.state.private.map((channel, index) => {
              if (this.props.user.starred.indexOf(channel.id) != -1) return

              const muted = this.props.user.muted.indexOf(channel.id) != -1
              const archived = this.props.user.archived.indexOf(channel.id) != -1
              const type = 'private'

              return (
                <Channel
                  key={index}
                  id={channel.id}
                  color={channel.color}
                  icon={channel.icon}
                  unread={channel.unread}
                  name={channel.name}
                  image={channel.image}
                  excerpt={channel.excerpt}
                  public={channel.public}
                  private={channel.private}
                  readonly={channel.readonly}
                  members={channel.members}
                  muted={muted}
                  archived={archived}
                  onNavigate={() => this.navigate(channel.id, type)}
                />
              )
            })}
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }

  renderArchived() {
    if (this.state.archived.length == 0) return null

    const { pathname } = this.props.history.location

    return (
      <React.Fragment>
        <HeadingRow>
          <CollapseGroupIcon onClick={() => this.setState({ archivedCollapsed: !this.state.archivedCollapsed })}>
            <IconComponent
              icon={this.state.archivedCollapsed ? 'chevron-down' : 'chevron-right'}
              color="#CFD4D9"
              size={14}
              className="button"
            />
          </CollapseGroupIcon>
          <Heading>
            <Label bold={this.state.archivedChannelsUnread}>Archived</Label>
          </Heading>
        </HeadingRow>

        {this.state.archivedCollapsed && (
          <React.Fragment>
            {this.state.archived.map((channel, index) => {
              const muted = this.props.user.muted.indexOf(channel.id) != -1
              const archived = this.props.user.archived.indexOf(channel.id) != -1
              const type = 'archived'

              return (
                <Channel
                  key={index}
                  id={channel.id}
                  color={channel.color}
                  icon={channel.icon}
                  name={channel.name}
                  image={channel.image}
                  excerpt={channel.excerpt}
                  members={channel.members}
                  public={channel.public}
                  private={channel.private}
                  readonly={channel.readonly}
                  muted={muted}
                  archived={archived}
                  onNavigate={() => this.navigate(channel.id, type)}
                />
              )
            })}
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }

  renderAccountModal() {
    if (!this.state.accountModal) return null

    return <AccountModal id={this.props.user.id} onClose={() => this.setState({ accountModal: false })} />
  }

  renderTeamModal() {
    if (!this.state.teamModal) return null

    return (
      <TeamModal
        id={this.props.team.id}
        start={this.state.teamModalStart}
        createPrivateChannel={this.createPrivateChannel}
        onClose={() => this.setState({ teamModal: false })}
      />
    )
  }

  // These unbounded functions
  // So we haven't bound these to THIS
  // Just is easier/quicker for now
  openAccountSettings() {
    this.setState({ accountMenu: false, accountModal: true })
  }

  openTeamSubscription() {
    this.setState({ accountMenu: false, teamModal: true, teamModalStart: 4 })
  }

  openTeamSettings() {
    this.setState({ accountMenu: false, teamModal: true, teamModalStart: 0 })
  }

  openTeamDirectory() {
    this.setState({ accountMenu: false, teamModal: true, teamModalStart: 1 })
  }

  signout() {
    this.setState({ accountMenu: false }, async () => {
      await AuthService.signout()
      await GraphqlService.signout()

      this.props.history.push('/auth')
    })
  }

  openUserMenu() {
    this.setState({ accountMenu: true })
  }

  closeUserMenu() {
    this.setState({ accountMenu: false })
  }

  render() {
    return (
      <Channels hideChannels={this.state.hideChannels} color={this.props.channel.color}>
        {this.renderNewChannelModal()}
        {this.renderAccountModal()}
        {this.renderTeamModal()}
        {this.renderHeader()}
        {this.renderHeaderButtons()}

        <ChannelsContainer>
          {this.renderStarred()}
          {this.renderPublic()}
          {this.renderPrivate()}
          {this.renderArchived()}
        </ChannelsContainer>
      </Channels>
    )
  }
}

ChannelsComponent.propTypes = {
  starred: PropTypes.bool,
  team: PropTypes.any,
  channel: PropTypes.any,
  channels: PropTypes.array,
  common: PropTypes.any,
  user: PropTypes.any,
  teams: PropTypes.array,
  createChannel: PropTypes.func,
  hydrateChannels: PropTypes.func,
  hydrateThreads: PropTypes.func,
  hydrateTeam: PropTypes.func,
  updateUserStatus: PropTypes.func,
  toggleDrawer: PropTypes.func,
  hydrateChannelUnreads: PropTypes.func,
  extensionLayout: PropTypes.string,
}

const mapDispatchToProps = {
  updateTeamMemberPosition: position => updateTeamMemberPosition(position),
  updateUserDnd: dnd => updateUserDnd(dnd),
  updateUserStatus: status => updateUserStatus(status),
  updateUserPresence: presence => updateUserPresence(presence),
  createChannel: channel => createChannel(channel),
  hydrateChannels: channels => hydrateChannels(channels),
  hydrateChannel: channel => hydrateChannel(channel),
  hydrateTeam: team => hydrateTeam(team),
  hydrateThreads: threads => hydrateThreads(threads),
  hydrateChannelUnreads: channelUnreads => hydrateChannelUnreads(channelUnreads),
}

const mapStateToProps = state => {
  return {
    common: state.common,
    user: state.user,
    team: state.team,
    channels: state.channels,
    channel: state.channel,
    channelUnreads: state.channelUnreads,
    teams: state.teams,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChannelsComponent)

const Channels = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
  width: 250px;
  height: 100%;
  position: relative;
  z-index: 6;
  background: #18181d;
  border-right: 1px solid #1f2d3d;
  border-right: 1px solid #eaedef;
  background: ${props => props.color};
  background: #0b1729;
  background: #f8f9fa;
  background: white;
  display: ${props => (props.hideChannels ? 'none' : 'flex')};

  @media only screen and (max-width: 768px) {
    width: 70vw;
  }
`

const ChannelsContainer = styled.div`
  flex: 1;
  overflow: scroll;
  width: 100%;
`

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: flex-start;
  width: 100%;
  width: 250px;
  margin: 0px;
`

const Header = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  align-content: stretch;
  align-items: center;
  justify-content: center;
  width: 100%;
`

const HeaderInner = styled.div`
  background-color: transparent;
  cursor: pointer;
  border-radius: 5px;
  width: 100%;
  padding 10px 15px 10px 15px;
  margin: 10px;
  transition: background-color 0.5s;
  flex: 1;
  display: flex;
  flex-direction: row;
  align-content: stretch;
  align-items: center;
  justify-content: center;

  :hover {
    background: #F8F9FA;
  }

  @media only screen and (max-width: 768px) {
    padding 20px;
    margin: 0px;
  }
`

const PopupHeader = styled.div`
  @media only screen and (max-width: 768px) {
    display: none;
  }
`

const Heading = styled.div`
  padding: 10px 25px 10px 25px;
  flex: 1;

  @media only screen and (max-width: 768px) {
    padding-left: 20px;
  }
`

const HeadingRow = styled.div`
  padding-right: 20px;
  display: flex;
  margin-top: 10px;
  flex-direction: row;
  align-content: center;
  align-items: center;
  justify-content: center;
  position: relative;

  @media only screen and (max-width: 768px) {
    padding-right: 20px;
  }
`

const Collapsable = styled.div`
  width: 100%;
  max-height: 0;
  transition: max-height 0.15s ease-out;
  overflow: hidden;

  &.open {
    max-height: 500px;
    overflow: visible;
    transition: max-height 0.25s ease-in;
  }
`

const CollapseGroupIcon = styled.div`
  position: absolute;
  top: 8px;
  left: 4px;
  width: 17px;
  height: 15px;
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;
  z-index: 10;
  border-radius: 3px;

  :hover {
    background-color: #f0f3f5;
  }
`
