import React, { useState, useEffect, memo, useRef } from 'react'
import ReactDOM from 'react-dom'
import moment from 'moment'
import styled from 'styled-components'
import { Picker, Emoji } from 'emoji-mart'
import { browserHistory } from '../services/browser-history.service'
import chroma from 'chroma-js'
import ReactMarkdown from 'react-markdown'
import ModalPortal from '../portals/modal.portal'
import PropTypes from 'prop-types'
import ReactDOMServer from 'react-dom/server'
import ConfirmModal from '../modals/confirm.modal'
import marked from 'marked'
import { useSelector, useDispatch } from 'react-redux'
import {
  createMessagesReaction,
  deleteMessagesReaction,
  createMessagesLike,
  deleteMessagesLike,
  deleteMessages,
  updateMessages,
  createMessages,
  createMessageMessagesReaction,
  deleteMessageMessagesReaction,
  createMessageMessagesLike,
  deleteMessageMessagesLike,
  deleteMessageMessages,
  openApp,
  updateChannel,
  updateChannelCreateMessagePin,
  updateChannelDeleteMessagePin,
  updateMessagesTaskAttachment,
  hydrateTask,
  hydrateMessage,
  createTasks,
  createThread,
} from '../actions'
import { Attachment, Popup, Avatar, Menu, Tooltip, Button } from '../elements'
import {
  getHighestTaskOrder,
  getMentions,
  urlParser,
  youtubeUrlParser,
  vimeoUrlParser,
  imageUrlParser,
  logger,
  decimalToMinutes,
  parseMessageMarkdown,
} from '../helpers/util'
import GraphqlService from '../services/graphql.service'
import MessagingService from '../services/messaging.service'
import OpengraphService from '../services/opengraph.service'
import { IconComponent } from './icon.component'
import EventService from '../services/event.service'
import uuidv1 from 'uuid/v1'
import PreviewComponent from './preview.component'
import { MIME_TYPES, SYNC_MESSAGE_HEIGHT } from '../constants'
import { CheckboxComponent } from '../extensions/tasks/components/checkbox/checkbox.component'
import { useParams } from 'react-router-dom'
import ToastService from '../services/toast.service'

const MessageAttachment = memo(props => {
  const [preview, setPreview] = useState(null)
  const [attachments, setAttachments] = useState([])
  const dispatch = useDispatch()

  const fetchMessageAttachments = async (messageId, channelId) => {
    try {
      const {
        data: {
          message: { id, attachments },
        },
      } = await GraphqlService.getInstance().messageAttachments(messageId)
      const message = { id, attachments }

      // Only update attachments that are there
      if (!attachments) return
      if (attachments.length == 0) return

      // Update our attachments
      dispatch(
        updateMessages(channelId, {
          messageId,
          channelId,
          message,
        })
      )

      // See if there are any extensions attached to them
      // uri = resource ID in mongo
      attachments.map(attachment => {
        if (attachment.mime == MIME_TYPES.TASK) {
          const taskId = attachment.uri

          fetchTaskExtensionMetaData(taskId, channelId)
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  const fetchTaskExtensionMetaData = async (taskId, channelId) => {
    try {
      const { data } = await GraphqlService.getInstance().channelTask(taskId)
      let task = data.channelTask

      // Probably deleted - so display DELETED on the frontend
      if (!task) task = { id: taskId, done: false, title: '', deleted: true }

      // Calling
      dispatch(updateMessagesTaskAttachment(channelId, taskId, task))
    } catch (e) {
      console.log(e)
    }
  }

  const renderPreview = () => {
    if (!preview) return null

    return <PreviewComponent onClose={() => setPreview(null)} image={preview} />
  }

  // Set the attachments after redux updates
  useEffect(() => {
    if (!props.attachments) return
    if (!props.attachments.length) return
    if (props.attachments.length == 0) return

    setAttachments(props.attachments)
  }, [props.attachments])

  // Do an API call to get the attachments
  useEffect(() => {
    if (!props.messageId) return
    if (!props.channelId) return
    if (!props.hasAttachments) return

    fetchMessageAttachments(props.messageId, props.channelId)
  }, [props.messageId])

  return (
    <React.Fragment>
      {renderPreview()}

      <Attachments>
        {attachments.map((attachment, index) => {
          const { mime, name, uri, meta } = attachment

          switch (mime) {
            case MIME_TYPES.MEET:
              // We don't really need the URI here because we're just navigating to the list
              // Bu tthe URI here will be the room ID if we ever need better integration
              return (
                <Button
                  key={index}
                  text="Join the call"
                  className="mt-10 mb-5"
                  onClick={() => browserHistory.push(`/app/team/${props.teamId}/channel/${props.channelId}/meets`)}
                  icon={<IconComponent icon="video" size={14} color="white" />}
                />
              )

            case MIME_TYPES.TASK:
              // This is the actual task details
              // ⚠️ Meta does no exist in the DB schema
              // Gets created with a hook above
              if (!meta) return null
              if (!meta.id) return null
              if (meta.deleted)
                return (
                  <div className="small color-d3 bold" key={index}>
                    Deleted
                  </div>
                )

              // Return a nice looking display
              return (
                <div key={index} className="row mb-10">
                  {!meta.deleted && (
                    <div className="row align-items-start mb-10 mt-10">
                      <div className="mr-10">
                        <CheckboxComponent done={meta.done} />
                      </div>
                      <div className="column">
                        <div className="h5 color-d3 bold">{meta.title}</div>
                        <div
                          className="small color-d2 button bold mt-5"
                          onClick={() => dispatch(hydrateTask({ id: meta.id }))}
                        >
                          Open task
                        </div>
                      </div>
                    </div>
                  )}

                  {meta.deleted && <div className="h5 color-d0 small bold">This task was deleted</div>}
                </div>
              )

            default:
              return (
                <Attachment
                  key={index}
                  size={attachment.size}
                  mime={attachment.mime}
                  preview={attachment.preview}
                  uri={attachment.uri}
                  name={attachment.name}
                  createdAt={attachment.createdAt}
                  onPreviewClick={mime.split('/')[0] == 'image' ? () => setPreview(attachment.uri) : null}
                />
              )
          }
        })}
      </Attachments>
    </React.Fragment>
  )
})

export default props => {
  const [body, setBody] = useState('')
  const [parent, setParent] = useState(null)
  const [over, setOver] = useState(false)
  const [forwardMenu, setForwardMenu] = useState(false)
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false)
  const [emoticonMenu, setEmoticonMenu] = useState(false)
  const dispatch = useDispatch()
  const channel = useSelector(state => state.channel)
  const team = useSelector(state => state.team)
  const channels = useSelector(state => state.channels)
  const user = useSelector(state => state.user)
  const parentMessage = useSelector(state => state.message)
  const [youtubeVideos, setYoutubeVideos] = useState([])
  const [vimeoVideos, setVimeoVideos] = useState([])
  const [threadAvatars, setThreadAvatars] = useState([])
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [senderId, setSenderId] = useState(null)
  const [senderName, setSenderName] = useState(null)
  const [senderImage, setSenderImage] = useState(null)
  const [senderTimezone, setSenderTimezone] = useState('')
  const [senderTimezoneOffset, setSenderTimezoneOffset] = useState(null)
  const [appButtons, setAppButtons] = useState([])
  const [appUrl, setAppUrl] = useState(null)
  const [appHeight, setAppHeight] = useState(100)
  const [appWidth, setAppWidth] = useState(200)
  const [resizeId, setResizeId] = useState(null)
  const [ogTitle, setOgTitle] = useState(null)
  const [ogDescription, setOgDescription] = useState(null)
  const [ogImages, setOgImages] = useState(null)
  const [ogUrl, setOgUrl] = useState(null)
  const [priority, setPriority] = useState(null)
  const iframeRef = useRef(null)
  const { teamId } = useParams()
  const [attachments, setAttachments] = useState([])

  const getMessagePriorityLevel = messageBody => {
    if (!messageBody) return null
    if (messageBody.substring(0, 3) == '!!!') return 3
    if (messageBody.substring(0, 2) == '!!') return 2
    if (messageBody.substring(0, 1) == '!') return 1
    return null
  }

  const stripPriorityLevelFromText = (messageBody, priorityLevel) => {
    if (priorityLevel) return messageBody.substring(priorityLevel)

    return messageBody
  }

  const handleMessagePin = async () => {
    try {
      const messageId = props.message.id
      const channelId = channel.id
      const pinned = !(props.message.pinned || props.pinned)

      // Create our base message object
      let channelMessage = { ...props.message, pinned }

      // We don't want a parent
      // delete channelMessage.parent

      // Make the GQL call
      await GraphqlService.getInstance().updateChannelMessage(messageId, {
        pinned,
      })

      // Update the pinned list with our message
      // This also syncs across clients
      if (pinned) dispatch(updateChannelCreateMessagePin(channelId, channelMessage))
      if (!pinned) dispatch(updateChannelDeleteMessagePin(channelId, messageId))

      // Also update this message in the channel messages list
      // NOTE First channelId tell it to SYNC
      // Second one makes sure this message only gets asent ot this channel
      dispatch(
        updateMessages(channelId, {
          channelId,
          messageId,
          message: { pinned },
        })
      )

      // Show a toast
      ToastService.show(pinned ? 'Message pinned' : 'Message unpinned')
    } catch (e) {
      logger(e)
    }
  }

  const handleForwardMessage = async channelId => {
    setForwardMenu(false)

    const userName = user.name
    const userId = user.id
    const excerpt = userName.toString().split(' ')[0] + ': ' + props.message.body || props.message.body
    const teamId = team.id
    const forwardedMessageContents = props.message.body
    const forwardingOriginalTime = props.message.createdAt
    const forwardedMessageUser = props.message.user.id
    const forwardedMessageAttachments = props.message.attachments
    const mentions = getMentions(forwardedMessageContents)

    try {
      const { data } = await GraphqlService.getInstance().createChannelMessage({
        channel: channelId,
        user: forwardedMessageUser,
        forwardingUser: userId,
        forwardingOriginalTime,
        team: teamId,
        body: forwardedMessageContents,
        attachments: forwardedMessageAttachments,
        mentions,
      })

      // The extra values are used for processing other info
      const channelMessage = {
        message: data.createChannelMessage,
        channelId,
        teamId,
      }

      // Create the message
      dispatch(createMessages(channelId, channelMessage))
      dispatch(updateChannel(channelId, { excerpt }))
    } catch (e) {
      logger(e)
    }
  }

  const handleActionClick = async action => {
    dispatch(openApp(action))
  }

  const handleDeleteChannelMessage = async () => {
    try {
      const isModalOpen = !!parentMessage.id
      const messageId = props.message.id
      const channelId = channel.id

      // Update our API
      await GraphqlService.getInstance().deleteChannelMessage(messageId)

      // If the modal is open:
      // Then use the STORE's message Id becuase that would be the parent
      // Otherwise use the message prop's parent (if theer is one)
      const parentMessageId = isModalOpen ? parentMessage.id : parent ? parent.id : null

      // If there is none, then NULL is what we want here
      if (!props.thread) dispatch(deleteMessages(channelId, messageId, parentMessageId))
      if (props.thread) dispatch(deleteMessageMessages(channelId, messageId, parentMessageId))

      // Delete the pin as well
      dispatch(updateChannelDeleteMessagePin(channelId, messageId))
      setConfirmDeleteModal(false)
    } catch (e) {
      logger(e)
    }
  }

  const handleDeleteChannelMessageReaction = async reaction => {
    // Only this user can do this
    if (reaction.split('__')[1] != user.id) return

    try {
      await GraphqlService.getInstance().deleteChannelMessageReaction(props.message.id, reaction)

      setEmoticonMenu(false)

      if (!props.thread) dispatch(deleteMessagesReaction(channel.id, props.message.id, reaction))
      if (props.thread) dispatch(deleteMessageMessagesReaction(channel.id, props.message.id, reaction))
    } catch (e) {
      logger(e)
    }
  }

  const handleCreateChannelMessageReaction = async emoticon => {
    try {
      const reaction = `${emoticon}__${user.id}__${user.name.split(' ')[0]}`
      const exisitingReactions = props.message.reactions.filter(r => r == reaction)

      if (exisitingReactions.length != 0) return setEmoticonMenu(false)

      await GraphqlService.getInstance().createChannelMessageReaction(props.message.id, reaction)

      setEmoticonMenu(false)

      if (!props.thread) dispatch(createMessagesReaction(channel.id, props.message.id, reaction))
      if (props.thread) dispatch(createMessageMessagesReaction(channel.id, props.message.id, reaction))
    } catch (e) {
      logger(e)
    }
  }

  const handleDeleteChannelMessageLike = async () => {
    try {
      await GraphqlService.getInstance().deleteChannelMessageLike(props.message.id, user.id)

      if (!props.thread) dispatch(deleteMessagesLike(channel.id, props.message.id, user.id))
      if (props.thread) dispatch(deleteMessageMessagesLike(channel.id, props.message.id, user.id))
    } catch (e) {
      logger(e)
    }
  }

  const handleCreateChannelMessageLike = async () => {
    try {
      await GraphqlService.getInstance().createChannelMessageLike(props.message.id, user.id)

      if (!props.thread) dispatch(createMessagesLike(channel.id, props.message.id, user.id))
      if (props.thread) dispatch(createMessageMessagesLike(channel.id, props.message.id, user.id))
    } catch (e) {
      logger(e)
    }
  }

  const createTask = async () => {
    try {
      const words = props.message.body
        .split(' ')
        .splice(0, 10)
        .join(' ')
      const title = words + '...'
      const channelId = channel.id
      const teamId = team.id
      const userId = user.id
      const order = 100 // Random
      const { data } = await GraphqlService.getInstance().createTask({
        channel: channelId,
        title,
        order,
        user: userId,
        team: teamId,
        description: body,
      })
      const task = data.createTask

      // Create the task
      dispatch(createTasks(channelId, task))

      // Show a toast
      ToastService.show('Task created')
    } catch (e) {
      setError('Erro creating task')
    }
  }

  const handleChannelLikeOrUnlike = () => {
    const likes = props.message.likes || []
    const userLikes = likes.filter(like => like == user.id)
    const userLikedAlready = userLikes.length >= 1

    if (userLikedAlready) {
      handleDeleteChannelMessageLike()
    } else {
      handleCreateChannelMessageLike()
    }
  }

  const handleMessageModalOpen = async messageId => {
    const {
      data: { message },
    } = await GraphqlService.getInstance().message(messageId)
    if (!message) return
    dispatch(hydrateMessage(message))
  }

  const handleMessageThreadConvert = async messageId => {
    try {
      const message = { thread: true }
      const channelId = channel.id
      const teamId = team.id
      const {
        data: {
          updateChannelMessage: { id, body },
        },
      } = await GraphqlService.getInstance().updateChannelMessage(messageId, message)
      const updatedAt = moment()
        .toDate()
        .getTime()
      const channelMessage = {
        message,
        messageId,
        channelId,
        teamId,
      }
      const thread = {
        id,
        body,
        updatedAt,
      }

      dispatch(updateMessages(channelId, channelMessage))
      dispatch(createThread(channelId, thread))
    } catch (e) {
      console.log(e)
      logger(e)
    }
  }

  const fetchOpengraphData = async url => {
    try {
      const response = await OpengraphService.fetchUrl(url)
      const res = await response.json()

      if (!res) return

      const { data } = res

      if (!data) return

      // We prefer the OG url where possible
      const processedUrl = data.ogUrl ? data.ogUrl : url

      // We don't explode everything because we use this on the state
      if (data.ogUrl) setOgUrl(processedUrl)
      if (data.ogTitle) setOgTitle(data.ogTitle)
      if (data.ogDescription) setOgDescription(data.ogDescription)

      // If it's valid
      if (data.ogImage) {
        let images = []
        const isImageArray = !!data.ogImage.length

        // Array-rise everything
        if (!isImageArray) images = [data.ogImage]
        if (isImageArray) images = data.ogImage

        // Set up an array of images
        // Also check for vailidity
        setOgImages(
          images.map(image => {
            const { url } = image
            const isValid = url.substring(0, 4).toLowerCase() == 'http'

            // This is an assumption on what Google Drive returns
            // often leaves off the protocol with simply a //url....
            // Thanks Google
            if (isValid) return url
            if (!isValid) return 'https:' + url
          })
        )
      }
    } catch (e) {
      logger(e)
    }
  }

  const constructParentMessageData = message => {
    if (!message) return null

    const { id, body, channel, app, user, childMessageCount, thread, createdAt } = message
    const words = body
      .split(' ')
      .splice(0, 10)
      .join(' ')
    const bodyExcerpt = app ? words : words + '...'

    return {
      id,
      body: bodyExcerpt,
      channel,
      app,
      user,
      childMessageCount,
      thread,
      createdAt: moment(createdAt).fromNow(),
    }
  }

  const fetchThreadAvatars = async () => {
    try {
      const { data } = await GraphqlService.getInstance().messageMessages(props.message.id)

      // Dedupe avatars
      const avatars = data.messageMessages
        .map(message => message.user)
        .reduce((users, user) => {
          const userIds = users.map(user => user.id)
          const userId = user.id

          if (userIds.indexOf(userId) == -1) return [...users, user]
          if (userIds.indexOf(userId) != -1) return users
        }, [])

      setThreadAvatars(avatars)
    } catch (e) {
      setError('Error fetching message avatars')
    }
  }

  // General app & send info setup
  // We also handle our message reads here
  useEffect(() => {
    const parseUrls = urlParser(props.message.body)
    const firstUrl = parseUrls ? parseUrls[0] : null

    // Just fetch the first URL
    // Processs popular media types that are not supported in OG necessarily
    // Don't do anything if there is an app attached to the message
    if (firstUrl && !props.message.app) fetchOpengraphData(firstUrl)

    // Display all images
    setImages(
      props.message.body
        .split(' ')
        .filter(p => imageUrlParser(p))
        .map(p => imageUrlParser(p))
    )

    // All Youtube videos
    setYoutubeVideos(
      props.message.body
        .split(' ')
        .filter(p => youtubeUrlParser(p))
        .map(p => youtubeUrlParser(p))
    )

    // All vimeo videos
    setVimeoVideos(
      props.message.body
        .split(' ')
        .filter(p => vimeoUrlParser(p))
        .map(p => vimeoUrlParser(p))
    )

    // Set sender details - and accommodate SYSTEM messages & APP messages
    setSenderImage(
      props.message.system ? '' : props.message.app ? props.message.app.app.image : props.message.user.image
    )
    setSenderName(props.message.system ? '' : props.message.user ? props.message.user.name : 'Autobot')
    setSenderId(props.message.system ? null : props.message.user ? props.message.user.id : null)
    setSenderTimezone(
      props.message.user
        ? props.message.user.timezone
          ? props.message.user.timezone
          : 'Your timezone'
        : 'Your timezone'
    )

    // Only set this for non apps & valid timezones
    if (!props.message.app && props.message.user) {
      if (props.message.user.timezone) {
        const offsetMinutes =
          moment()
            .tz(props.message.user.timezone)
            .utcOffset() / 60

        if (offsetMinutes < 0) setSenderTimezoneOffset(` -${decimalToMinutes(offsetMinutes * -1)}`)
        if (offsetMinutes >= 0) setSenderTimezoneOffset(` +${decimalToMinutes(offsetMinutes)}`)
      }
    }

    // Only update our state if there are any
    if (props.message.app && channel.apps) {
      // Find the corresponding app ont he channel (needs to be active)
      const channelApp = channel.apps.filter(app => app.app.id == props.message.app.app.id && app.active).flatten()

      // Only if there is an app
      if (!channelApp) return

      // Otherwise carry on
      const channelAppToken = channelApp.token

      // This might be null
      const channelAppMessageButtons = props.message.app.app.message.buttons || []
      const appResourceId = props.message.app.resourceId
      const messageId = props.message.id

      // resourceId is what we use to ID the resource on the app's server
      // This could be an ID - when a user creates a message they add this
      // so we can just feed it back to them
      if (props.message.app.app.message) {
        // We don't set the height because the user needs to call the resizeService
        // If there is a size here
        if (props.message.app.app.message.height != '0' && !!props.message.app.app.message.height)
          setAppHeight(props.message.app.app.message.height)

        // Always take the apps width
        setAppWidth(props.message.app.app.message.width)

        // Important that we add the channel token to the appAction.payload
        // This action is attached to all buttons - so we can assume this structure:
        setAppButtons(
          channelAppMessageButtons.map(button => {
            return {
              ...button,
              action: {
                ...button.action,
                token: channelApp.token,
              },
            }
          })
        )

        // Set the resize ID
        setResizeId(messageId)

        // URL for the message view
        const { url } = props.message.app.app.message

        // If the user has already added a query string or not
        if (url) {
          if (url != '') {
            if (url.indexOf('?') == -1) {
              setAppUrl(
                `${url}?token=${channelAppToken}&userId=${user.id}&resourceId=${appResourceId}&resizeId=${messageId}`
              )
            } else {
              setAppUrl(
                `${url}&token=${channelAppToken}&userId=${user.id}&resourceId=${appResourceId}&resizeId=${messageId}`
              )
            }
          }
        }
      }
    }

    // Manage the message reads
    // We set this on a timeout so all other variables have time to propagate
    setTimeout(() => {
      const { read, reads } = props.message
      const { id, isMember, totalMembers } = channel
      const channelId = id
      const userId = user.id
      const messageId = props.message.id

      // Don't do anything if they're not a member
      // And don't do anything if it's already read
      if (!teamId) return
      if (!channelId) return
      if (!isMember) return
      if (read) return

      // If the total members of this channel is less that or equal to the reads
      // Then don't do anything
      if (totalMembers <= reads) {
        // We don't bother with syncing the READ property
        // here because users will already be checking for the read count
        GraphqlService.getInstance().updateChannelMessageRead(messageId)

        // Redux expects this shape
        const channelMessage = {
          message: { read: true },
          messageId,
          channelId,
          teamId,
        }

        // update our redux state
        dispatch(updateMessages(channelId, channelMessage))
      } else {
        // If not and not everyone has read this yet, then add our read
        GraphqlService.getInstance().createChannelMessageRead(messageId, userId, channelId, teamId)

        // Redux expects this shape
        const channelMessage = {
          message: { reads: reads + 1 },
          messageId,
          channelId,
          teamId,
        }

        // Bump this in the store
        dispatch(updateMessages(channelId, channelMessage))
      }
    }, 500)
  }, [props.message])

  // Specifically watch our resizeId
  useEffect(() => {
    if (!resizeId) return
    if (!props.message.id) return

    EventService.getInstance().on(SYNC_MESSAGE_HEIGHT, data => {
      // AUTO_ADJUST_MESSAGE_HEIGHT will be received by ALL MESSAGE COMPONENTS
      // resizeId is auto generated to identify THIS SPECIFIC MESSAGE COMPONENT
      // Only adjust this specific height when received
      if (data.resizeId == resizeId) {
        logger(SYNC_MESSAGE_HEIGHT, data.resizeId, resizeId, data.resizeId == resizeId)

        // Only set this if the user has not specified a height
        if (data.resizeHeight) {
          if (!props.message.app.app.message.height || props.message.app.app.message.height == '0') {
            setAppHeight(data.resizeHeight)
          }
        }
      }
    })
  }, [props.message.id, resizeId])

  // Here we start processing the markdown & text highighting
  useEffect(() => {
    let messageBody = props.message.body || ''
    const priorityLevel = getMessagePriorityLevel(messageBody)

    if (priorityLevel) messageBody = stripPriorityLevelFromText(messageBody, priorityLevel)

    setPriority(priorityLevel)
    setParent(constructParentMessageData(props.message.parent))
    setBody(parseMessageMarkdown(messageBody, props.highlight))
  }, [props.highlight, props.message])

  // Get thread avatars
  useEffect(() => {
    if (!props.message.childMessageCount) return
    if (!props.message.thread) return

    fetchThreadAvatars(props.message.id)
  }, [props.message])

  // Handle attachments
  useEffect(() => {
    if (!props.message.attachments) return
    if (!props.message.attachments.length) return

    setAttachments(props.message.attachments)
  }, [props.message.attachments])

  const renderDeviceIcons = () => {
    switch (props.message.device) {
      case 'WEB':
        return <IconComponent icon="monitor" size={13} color="#aeb5bc" className="ml-5" />
      case 'DESKTOP':
        return <IconComponent icon="monitor" size={13} color="#aeb5bc" className="ml-5" />
      case 'MOBILE':
        return <IconComponent icon="smartphone" size={13} color="#aeb5bc" className="ml-5" />
      default:
        return null
    }
  }

  const renderMessageReads = () => {
    return (
      <React.Fragment>
        {!props.message.system && <IconComponent icon="check" size={15} color="#aeb5bc" />}

        {!props.message.system && (channel.totalMembers <= props.message.reads || props.message.read) && (
          <IconComponent icon="check" size={15} color="#aeb5bc" style={{ marginLeft: -11 }} />
        )}
      </React.Fragment>
    )
  }

  // Render functions for the message component
  // To make thigs easier to understand
  const renderName = () => {
    if (props.append) return null

    return (
      <div className="row">
        {!props.message.system && <User priority={priority}>{senderName}</User>}
        {props.message.app && <App>{props.message.app.app.name}</App>}
        <Date>
          {props.message.system && <span>{props.message.body} - </span>}

          {moment(props.message.forwardingOriginalTime ? props.message.forwardingOriginalTime : props.message.createdAt)
            .tz(user.timezone)
            .fromNow()}
        </Date>

        {!props.pinned && (
          <div className="row">
            {renderMessageReads()}
            {renderDeviceIcons()}
          </div>
        )}
      </div>
    )
  }

  const renderAvatar = () => {
    if (!props.append && !props.message.system) {
      return (
        <Tooltip
          text={`${senderTimezone.replace('_', ' ')}${senderTimezoneOffset ? senderTimezoneOffset : ''}`}
          direction="right"
        >
          <Avatar image={senderImage} title={senderName} userId={senderId} size="medium" />
        </Tooltip>
      )
    }

    if (props.append || props.message.system) return <AvatarBlank />

    return null
  }

  const renderTools = () => {
    if (props.message.system) return null
    if (props.pinned) return null

    return (
      <Tools hover={over}>
        {!props.pinned && (
          <Popup
            handleDismiss={() => setEmoticonMenu(false)}
            visible={emoticonMenu}
            width={350}
            direction="right-top"
            content={
              <Picker
                style={{ width: 350 }}
                set="emojione"
                title=""
                emoji=""
                showPreview={false}
                showSkinTones={false}
                onSelect={emoji => handleCreateChannelMessageReaction(emoji.colons)}
              />
            }
          >
            <Tool onClick={() => setEmoticonMenu(true)} first={true}>
              <IconComponent icon="smile" size={15} color="#aeb5bc" />
            </Tool>
          </Popup>
        )}

        {!props.pinned && (
          <Tool onClick={() => handleChannelLikeOrUnlike()}>
            <IconComponent icon="thumbs-up" size={15} color="#aeb5bc" />
          </Tool>
        )}

        {/* Temporarily disabling this: !props.message.app */}
        {/* Check here that there is a user! */}
        {/* And then only for this user - otherwise ALWAYS */}
        {(props.message.user ? props.message.user.id == user.id : true) && !props.pinned && (
          <Tool onClick={() => setConfirmDeleteModal(true)}>
            <IconComponent icon="delete" size={15} color="#aeb5bc" />
          </Tool>
        )}

        {/* only for this user */}
        {!props.message.app && props.message.user.id == user.id && !props.pinned && (
          <Tool onClick={() => props.setUpdateMessage(props.message)}>
            <IconComponent icon="pen" size={15} color="#aeb5bc" />
          </Tool>
        )}

        {!props.pinned && !parentMessage.id && (
          <Tool onClick={() => props.setReplyMessage(props.message)}>
            <IconComponent icon="reply" size={15} color="#aeb5bc" />
          </Tool>
        )}

        <Tool onClick={() => createTask(props.message)}>
          <IconComponent icon="double-check" size={15} color="#aeb5bc" />
        </Tool>

        {!parentMessage.id && (
          <Tool onClick={() => handleMessagePin()}>
            <IconComponent
              icon="pin"
              size={15}
              color={props.message.pinned || props.pinned ? channel.color : '#aeb5bc'}
            />
          </Tool>
        )}

        {!props.pinned && !parentMessage.id && (
          <Popup
            handleDismiss={() => setForwardMenu(false)}
            visible={forwardMenu}
            width={275}
            direction="right-top"
            content={
              <React.Fragment>
                <div className="color-d2 h5 pl-15 pt-15 bold">Forward to channel:</div>
                <Menu
                  items={channels.map(c => {
                    const channelName = c.otherUser ? (c.otherUser.name ? c.otherUser.name : c.name) : c.name
                    return {
                      text: `${channelName} ${c.id == channel.id ? '(this channel)' : ''}`,
                      onClick: e => handleForwardMessage(c.id),
                    }
                  })}
                />
              </React.Fragment>
            }
          >
            <Tool onClick={() => setForwardMenu(true)} last={true}>
              Forward
            </Tool>
          </Popup>
        )}
      </Tools>
    )
  }

  const renderChildMessages = () => {
    if (!props.message.childMessageCount) return null
    if (!props.message.thread) return null

    const messageText = props.message.childMessageCount == 1 ? 'reply' : 'replies'

    return (
      <ChildMessages className="row" onClick={() => handleMessageModalOpen(props.message.id)}>
        {threadAvatars.map((avatar, index) => {
          return (
            <div key={index} style={{ marginRight: -10, height: 20, width: 20 }}>
              <Avatar image={avatar.image} title={avatar.name} style={{ border: '2px solid #afcfdb' }} size="small" />
            </div>
          )
        })}
        <ChildMessagesText>
          {props.message.childMessageCount} {messageText}
        </ChildMessagesText>
      </ChildMessages>
    )
  }

  const renderParent = () => {
    if (props.hideParentMessages) return null
    if (parent) {
      if (parent.channel) {
        return (
          <ParentPadding className="column align-items-stretch flexer">
            <ParentText>{`Replying to:`}</ParentText>
            <ParentContainer className="row justify-content-center">
              <div className="column flexer">
                <ParentMessage>
                  <ReactMarkdown source={parent.body} />
                </ParentMessage>
                <div className="row">
                  <ParentName>by {parent.app ? parent.app.name : parent.user.name}</ParentName>
                  <ParentDate>{parent.createdAt}</ParentDate>
                  {parent && (
                    <ParentUnreadCount
                      color={channel.color}
                      onClick={() => {
                        if (parent.thread) {
                          handleMessageModalOpen(parent.id)
                        } else {
                          handleMessageThreadConvert(parent.id)
                        }
                      }}
                    >
                      {parent.thread ? 'View thread' : 'Create thread'}
                    </ParentUnreadCount>
                  )}
                </div>
              </div>
            </ParentContainer>
          </ParentPadding>
        )
      }
    }

    return null
  }

  const renderMedia = () => {
    return (
      <React.Fragment>
        {images.map((image, index) => {
          const name = image.split('/')[image.split('/').length - 1]
          const extension = image.split('.')[image.split('.').length - 1]
          const mime = `image/${extension}`

          return (
            <Attachment
              key={index}
              size={null}
              mime={mime}
              preview={image}
              uri={image}
              name={name}
              createdAt={props.message.createdAt}
              onPreviewClick={() => setPreview(image)}
            />
          )
        })}

        {youtubeVideos.map((youtubeVideo, index) => {
          return (
            <iframe
              key={index}
              width={560}
              height={300}
              src={`https://www.youtube.com/embed/${youtubeVideo}`}
              frameBorder={0}
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          )
        })}

        {vimeoVideos.map((vimeoVideo, index) => {
          return (
            <iframe
              key={index}
              width={560}
              height={300}
              src={`https://player.vimeo.com/video/${vimeoVideo}`}
              frameBorder={0}
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          )
        })}
      </React.Fragment>
    )
  }

  const renderOpengraph = () => {
    if (!ogTitle) return null

    return (
      <UrlPreview className="button" href={ogUrl} target="_blank">
        {ogImages && (
          <div className="row">
            {ogImages.map((u, i) => (
              <img className="mb-5" src={u} height="100" key={i} />
            ))}
          </div>
        )}
        {ogTitle && <div className="h4 color-d3 mb-5">{ogTitle}</div>}
        {ogDescription && <div className="p color-d0">{ogDescription}</div>}
      </UrlPreview>
    )
  }

  const renderApp = () => {
    if (!appUrl) return null
    if (appUrl == '') return null

    //console.log(iframeRef.current ? iframeRef.current.contentWindow.document.body.scrollHeight + "px" : null)

    return (
      <AppUrl>
        <iframe border="0" ref={iframeRef} src={appUrl} width={appWidth} height={appHeight}></iframe>
      </AppUrl>
    )
  }

  const renderAppButtons = () => {
    if (!appButtons) return null
    if (!appButtons.length) return null
    if (appButtons.length == 0) return null

    return (
      <AppActions className="row">
        {appButtons.map((button, index) => {
          return (
            <AppActionContainer key={index} className="row" onClick={() => handleActionClick(button.action)}>
              <AppActionImage image={button.icon} />
              <AppActionText>{button.text}</AppActionText>
            </AppActionContainer>
          )
        })}
      </AppActions>
    )
  }

  const renderReactionsLikes = () => {
    if (!props.message) return null

    const reactions = props.message.reactions || []
    const likes = props.message.likes || []

    if (reactions.length == 0 && likes.length == 0) return null

    return (
      <div className="row">
        {likes.length != 0 && (
          <Likes className="button row" onClick={() => handleChannelLikeOrUnlike()}>
            <IconComponent icon="thumbs-up" size={15} color="#0083c4" />

            <Like>{likes.length}</Like>
          </Likes>
        )}

        {reactions.length != 0 && (
          <Reactions className="row">
            {reactions.map((reaction, index) => {
              const reactionParts = reaction.split('__')
              const emoticon = reactionParts[0]
              const userName = reactionParts[2]

              return (
                <div
                  key={index}
                  className="row button reaction"
                  onClick={() => handleDeleteChannelMessageReaction(reaction)}
                >
                  <Emoji emoji={emoticon} size={18} set="emojione" />
                </div>
              )
            })}
          </Reactions>
        )}
      </div>
    )
  }

  const renderMessage = () => {
    // Do not render the message text if it's a system message
    if (props.message.system) return null

    return <Text priority={priority} dangerouslySetInnerHTML={{ __html: body }} />
  }

  const renderForwardingUser = () => {
    if (!props.message) return null
    if (!props.message.forwardingUser) return null

    return (
      <ForwardingUserContainer className="row">
        <ForwardingUser>
          Forwarded from {props.message.forwardingUser.name}{' '}
          {moment(props.message.createdAt)
            .tz(user.timezone)
            .fromNow()}
        </ForwardingUser>
      </ForwardingUserContainer>
    )
  }

  return (
    <Message
      className="column"
      onMouseEnter={() => setOver(true)}
      onMouseLeave={() => {
        setOver(false)
        setForwardMenu(false)
        setEmoticonMenu(false)
      }}
    >
      {confirmDeleteModal && (
        <ConfirmModal
          onOkay={handleDeleteChannelMessage}
          onCancel={() => setConfirmDeleteModal(false)}
          text="Are you sure you want to delete this?"
          title="Are you sure?"
        />
      )}

      {renderForwardingUser()}
      <div className="row align-items-start w-100">
        {renderAvatar()}

        <div className="column flexer pl-15">
          <Bubble className="column">
            <HeaderRow>
              {renderName()}
              {renderTools()}
            </HeaderRow>

            {renderParent()}
            {renderMessage()}
            {renderOpengraph()}

            <MessageAttachment
              teamId={team.id}
              channelId={channel.id}
              messageId={props.message.id}
              attachments={attachments}
              hasAttachments={props.message.hasAttachments}
            />

            {renderMedia()}
            {renderApp()}
            {renderAppButtons()}
            {renderReactionsLikes()}
            {renderChildMessages()}
          </Bubble>
        </div>
      </div>
    </Message>
  )
}

const UrlPreview = styled.a`
  border-left: 3px solid #007af5;
  padding: 0px 0px 0px 15px;
  margin-bottom: 20px;
  margin-top: 5px;
  cursor: pointer;
`

const Message = styled.div`
  margin-bottom: 10px;
  width: 100%;
`

const Bubble = styled.div`
  flex: 1;
  /*min-width: 30%;*/
  width: 100%;
`

const HeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-content: center;
  align-items: center;
  width: 100%;
  position: relative;
`

const Tools = styled.div`
  position: absolute;
  right: 0px;
  top: 0px;
  flex-direction: row;
  justify-content: flex-start;
  align-content: center;
  align-items: center;
  display: ${props => (props.hover ? 'flex' : 'none')};
  z-index: 10;

  @media only screen and (max-width: 768px) {
    display: none;
  }
`

const Tool = styled.div`
  background: white;
  border-left: 1px solid #e9edef;
  border-top: 1px solid #e9edef;
  border-bottom: 1px solid #e9edef;
  border-right: ${props => (props.last ? '1' : '0')}px solid #e9edef;
  border-top-left-radius: ${props => (props.first ? '5' : '0')}px;
  border-bottom-left-radius: ${props => (props.first ? '5' : '0')}px;
  border-top-right-radius: ${props => (props.last ? '5' : '0')}px;
  border-bottom-right-radius: ${props => (props.last ? '5' : '0')}px;
  padding: 5px 7px 5px 7px;
  color: #aeb5bc;
  margin: 0px;
  height: 25px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 9px;
  font-weight: 800;

  &:hover {
    background: #f2f3f5;
  }
`

const Date = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #adb5bd;
  margin-right: 10px;
  margin-left: 5px;
`

const ForwardingUserContainer = styled.div`
  width: 100%;
  padding-bottom: 5px;
  margin-bottom: 10px;
`

const ChildMessages = styled.div`
  cursor: pointer;
  background-color: #def5ff;
  transition: background-color .2s
  border-radius: 8px;
  padding: 5px;
  margin-top: 5px;

  &:hover {
    background-color: #edf0f2;
  }
`

const ChildMessagesText = styled.div`
  color: #0083c4;
  font-weight: 700;
  font-style: normal;
  font-size: 11px;
  padding-left: 15px;
`

const ForwardingUser = styled.div`
  color: #343a40;
  font-weight: 400;
  font-style: normal;
  font-size: 12px;
  font-style: italic;
  margin-right: 5px;
`

const User = styled.div`
  color: ${props => {
    switch (props.priority) {
      case 1:
        return 'blue'
      case 2:
        return 'orange'
      case 3:
        return 'red'
      default:
        return '#333a40'
    }
  }};
  font-weight: 700;
  font-style: normal;
  font-size: 14px;
  margin-right: 5px;
`

const Text = styled.div`
  font-size: 14px;
  color: ${props => {
    switch (props.priority) {
      case 1:
        return 'blue'
      case 2:
        return 'orange'
      case 3:
        return 'red'
      default:
        return '#333a40'
    }
  }};
  font-weight: 500;
  line-height: 1.4;
  padding-top: 5px;
  padding-bottom: 5px;

  blockquote {
    border-left: 5px solid #007af5;
    font-size: 14px;
    margin: 0px;
    padding: 0px;
    padding-left: 1em;
  }

  del {
    text-decoration: line-through;
  }

  i {
    font-weight: bold;
    font-style: italic;
    font-size: 14px;
  }

  b,
  strong {
    font-weight: bold;
    font-size: 14px;
  }

  p {
    padding: 0px;
    margin: 0px;
    font-size: 14px;
  }

  code {
    color: #495057;
    font-weight: 600;
    font-family: monospace;
  }

  pre {
    background: white;
    border: 1px solid #eaeaea;
    border-left: 5px solid #007af5;
    color: #495057;
    border-radius: 2px;
    page-break-inside: avoid;
    font-size: 12px;
    margin-top: 0px;
    line-height: 1.6;
    max-width: 100%;
    overflow: auto;
    padding: 1em 1.5em;
    display: inline-block;
    word-wrap: break-word;
  }
`

const Likes = styled.div`
  padding: 5px;
  border-radius: 10px;
  margin-right: 5px;
  background-color: #def5ff;
`

const Like = styled.div`
  color: #0083c4;
  margin-left: 5px;
  position: relative;
  font-size: 10px;
  font-weight: 800;
`

const Reactions = styled.div`
  padding-top: 10px;
  padding-bottom: 10px;

  .reaction {
    padding: 3px;
    margin-right: 2px;
  }
`

const Attachments = styled.div`
  padding-top: 5px;
`

const ParentPadding = styled.div`
  padding: 0px;
`

const ParentContainer = styled.div`
  border-left: 3px solid #007af5;
  padding: 0px 0px 0px 15px;
  margin-bottom: 5px;
  margin-top: 5px;
`

const ParentMessage = styled.div`
  font-weight: 500;
  font-size: 14px;
  font-style: normal;
  color: #868e95;
  display: inline-block;
  margin-bottom: 5px;

  strong {
    font-weight: bold;
  }

  p {
    padding: 0px;
    margin: 0px;
  }

  code {
    display: none;
  }

  pre {
    display: none;
  }
`

const ParentName = styled.div`
  color: #adb5bd;
  font-weight: 600;
  font-style: normal;
  font-size: 10px;
`

const ParentDate = styled.div`
  margin-left: 10px;
  font-size: 10px;
  font-weight: 700;
  color: #adb5bd;
  font-weight: regular;
`

const ParentUnreadCount = styled.div`
  margin-left: 10px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  color: ${props => (props.color ? props.color : '#adb5bd')};
  font-weight: regular;

  &:hover {
    font-weight: 600;
  }
`

const ParentText = styled.div`
  font-size: 13px;
  font-weight: 400;
  color: #adb5bd;
  font-weight: regular;
  margin-bottom: 10px;
  margin-top: 10px;
  display: inline-block;
  display: none;
`

const App = styled.div`
  background: #f0f3f5;
  border-radius: 3px;
  padding: 3px 6px 3px 6px;
  color: #b8c4ce;
  margin-right: 10px;
  font-size: 10px;
  font-weight: 600;
`

const AppUrl = styled.div`
  width: 100%;
  height: fit-content;
  margin-bottom: 10px;
  padding-lefT: 10px;
  border:
  overflow: hidden;
  border-left: 5px solid #007af5;

  iframe {
    border: none;
  }
`

const AppActions = styled.div``

const AppActionContainer = styled.div`
  padding: 5px;
  margin-right: 5px;
  cursor: pointer;
  opacity: 1;
  transition: opacity 0.25s;

  &:hover {
    opacity: 0.8;
  }
`

const AppActionText = styled.div`
  font-weight: 600;
  color: #b8c4ce;
  font-size: 10px;
`

const AppActionImage = styled.div`
  width: 15px;
  height: 15px;
  overflow: hidden;
  margin-right: 5px;
  background-size: contain;
  background-position: center center;
  background-color: transparent;
  background-repeat: no-repeat;
  background-image: url(${props => props.image});
`

const AvatarBlank = styled.div`
  width: 30px;
  height: 30px;
`
