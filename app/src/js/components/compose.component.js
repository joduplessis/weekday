import React from 'react'
import { connect } from 'react-redux'
import { Picker } from 'emoji-mart'
import styled from 'styled-components'
import moment from 'moment'
import PropTypes from 'prop-types'
import marked from 'marked'
import {
  openApp,
  updateLoading,
  updateError,
  updateChannelUpdateMessagePin,
  updateChannel,
  createMessages,
  createMessageMessages,
  updateMessages,
  updateMessageMessages,
} from '../actions'
import UploadService from '../services/upload.service'
import GraphqlService from '../services/graphql.service'
import MessagingService from '../services/messaging.service'
import Keg from '@joduplessis/keg'
import {
  Attachment,
  Popup,
  User,
  Members,
  Spinner,
  Error,
  Notification,
  Button,
  MessageMedia,
  Avatar,
  Menu,
} from '../elements'
import {
  parseMessageMarkdown,
  notifyChannelOfTyping,
  getMentions,
  logger,
  getUsersThatAreStillTyping,
} from '../helpers/util'
import { IconComponent } from './icon.component'
import EventService from '../services/event.service'
import { DEVICE } from '../environment'
import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { FOCUS_COMPOSE_INPUT, SET_EDITOR_CONTENT, TOAST } from '../constants'
import { EditorComponent } from './editor/editor.component'
import ToastService from '../services/toast.service'

class ComposeComponent extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      id: null,
      typing: [],
      parent: [],
      commands: [],
      error: null,
      loading: null,
      notification: null,
    }

    this.joinChannel = this.joinChannel.bind(this)
    this.handleActionClick = this.handleActionClick.bind(this)
    this.onSend = this.onSend.bind(this)
    this.createChannelMessage = this.createChannelMessage.bind(this)
    this.updateChannelMessage = this.updateChannelMessage.bind(this)
    this.populateCommands = this.populateCommands.bind(this)
    this.getAppsForAppsMenu = this.getAppsForAppsMenu.bind(this)

    this.renderUpdate = this.renderUpdate.bind(this)
    this.renderCommands = this.renderCommands.bind(this)
    this.renderReply = this.renderReply.bind(this)
    this.renderInput = this.renderInput.bind(this)
    this.renderFooter = this.renderFooter.bind(this)
  }

  async joinChannel() {
    try {
      const channelId = this.props.channel.id
      const teamId = this.props.team.id
      const { name, username, id } = this.props.user
      const members = [{ user: { name, username, id } }]

      // Add this user as a member of the channel
      await GraphqlService.getInstance().createChannelMembers(channelId, teamId, members)

      // Update the channel as being a member
      this.props.updateChannel(channelId, { isMember: true })
    } catch (e) {
      console.log(e)
    }
  }

  handleActionClick(action) {
    this.props.openApp(action)
  }

  onSend(text, attachments) {
    if (text == '') return

    // If this message is a general (any) app command
    if (text[0] == '/') {
      // Remove the / from processing the command (1st character)
      // Only make the 1st 2 pieces of text lowercase
      // those are:
      // - app slug
      // - app command
      const commandTextParts = text.slice(1).split(' ')

      // Don't process this if it's not complete
      if (commandTextParts.length <= 2) return

      // If there are more than 2 parts, carry on
      const commandText = commandTextParts
        .map((t, i) => {
          if (i == 0 || i == 1) {
            return t.toLowerCase()
          } else {
            return t
          }
        })
        .join(' ')

      // Take the very first word which is the app slug (unique accross apps)
      const slug = commandText.split(' ')[0]

      // Iterate over all the apps that have these action commands
      this.props.channel.apps.map(app => {
        // Dont use apps that aren't active
        // Or if the app slug isn't the one the user entered
        if (!app.active || app.app.slug.toLowerCase() != slug) return

        // The only app left is the correct one
        // Now iterate over all the commands (there could be a few)
        app.app.commands.map(command => {
          const commandName = commandText.split(' ')[1]
          const commandQuery = commandText
            .split(' ')
            .splice(2, commandText.split(' ').length - 1)
            .join(' ')

          // If there is a match of a command
          // DO NOT USE REGEX HERE
          // We want to match the whole word
          if (command.name.toLowerCase() == commandName) {
            // And call our action creator
            // If the user has add a WEB action type, then they can
            // get the text part as part of the body JSON pacakge
            this.handleActionClick({
              ...command.action,
              token: app.token,
              userCommand: {
                commandName,
                commandQuery,
              },
            })

            // Show a toast
            ToastService.show('Success!')
          }
        })
      })
    } else {
      const id = this.props.message ? this.props.message.id : null
      const parent = this.props.parentMessage.id
        ? this.props.parentMessage.id
        : this.props.reply
        ? this.props.message
          ? this.props.message.id
          : null
        : null

      // If it's a reply OR create
      if (!this.props.update) this.createChannelMessage(text, attachments, parent)

      // If it's an update
      if (this.props.update) this.updateChannelMessage(id, text, attachments)
    }
  }

  async createChannelMessage(body, attachments, parentId) {
    try {
      const channelId = this.props.channel.id
      const userName = this.props.user.name
      const userId = this.props.user.id
      const excerpt = userName.toString().split(' ')[0] + ': ' + body || body
      const teamId = this.props.team.id
      const device = DEVICE
      const mentions = getMentions(body)

      // If they aree replying within the modal: THREADED
      // If the messagee they are replying to is a thread: THREADED
      // Otherwise not threaded
      const threaded = this.props.parentMessage.id
        ? true
        : this.props.message
        ? this.props.message.thread
          ? true
          : false
        : false

      // Create the message
      const { data } = await GraphqlService.getInstance().createChannelMessage({
        device,
        mentions,
        channel: channelId,
        user: userId,
        team: teamId,
        parent: parentId,
        threaded,
        body,
        // ⚠️ Strip the query string
        attachments: attachments.map(attachment => {
          return {
            ...attachment,
            uri: attachment.uri.split('?')[0],
          }
        }),
      })

      // Catch it
      if (!data.createChannelMessage) return logger('data.createChannelMessage is null')

      // The extra values are used for processing other info
      // ⚠️ We are adding the getObject URL from the server in the resolvers
      const channelMessage = {
        message: data.createChannelMessage,
        channelId,
        teamId,
      }

      // Create the message
      if (!this.props.thread) this.props.createMessages(channelId, channelMessage)
      if (this.props.thread) this.props.createMessageMessages(channelId, channelMessage)

      // Update the channel & carry on
      this.props.updateChannel(channelId, { excerpt })
      this.props.clearMessage()
    } catch (e) {
      console.log(e)
    }
  }

  async updateChannelMessage(messageId, body, attachments) {
    const userName = this.props.user.name
    const userId = this.props.user.id
    const channelId = this.props.channel.id
    const excerpt = userName.toString().split(' ')[0] + ': ' + body || body
    const teamId = this.props.team.id

    // Get a list of mentions
    // but also strip punctuation
    const mentions = body
      .replace('/./g', ' ')
      .replace('/,/g', ' ')
      .split(' ')
      .filter(part => part[0] == '@')

    try {
      const { data } = await GraphqlService.getInstance().updateChannelMessage(messageId, {
        mentions,
        body,
        // ⚠️ Strip the query string
        attachments: attachments.map(attachment => {
          return {
            ...attachment,
            uri: attachment.uri.split('?')[0],
          }
        }),
      })

      // ⚠️ DO NOT STRIP THE QUERY STRING OFF HERE
      // We keep it so other people can get the getObject access code
      const { updateChannelMessage } = data
      const channelMessage = {
        message: {
          body,
          attachments: updateChannelMessage.attachments,
        },
        messageId,
        channelId,
        teamId,
      }

      // There might be no message pins - but just in case
      this.props.updateChannelUpdateMessagePin(channelId, channelMessage)

      // Now update everything else
      if (!this.props.thread) this.props.updateMessages(channelId, channelMessage)
      if (this.props.thread) this.props.updateMessageMessages(channelId, channelMessage)

      // Update the channel & carry on
      this.props.updateChannel(channelId, { excerpt })
      this.props.clearMessage()
    } catch (e) {
      logger(e)
    }
  }

  populateCommands(text) {
    const commands = []

    // If it's blank then don't do anything
    if (text == '' || text[0] != '/') return this.setState({ commands })

    // This removes the first letter from the string ('/')
    // Takes the first word (app shortcode)
    const appShortcodeToMatch = text
      .slice(1)
      .split(' ')[0]
      .toLowerCase()

    // Find all active apps
    this.props.channel.apps.map(app => {
      if (!app.active) return

      // and see if they have commands to list for the user
      app.app.commands.map(command => {
        const matchCommandName = command.name.toLowerCase().match(new RegExp(appShortcodeToMatch + '.*'))
        const matchAppSlug = app.app.slug.toLowerCase().match(new RegExp(appShortcodeToMatch + '.*'))

        if (matchCommandName || matchAppSlug) {
          commands.push({
            id: app.app.id,
            slug: app.app.slug,
            ...command,
          })
        }
      })
    })

    this.setState({ commands })
  }

  getAppsForAppsMenu() {
    const menuItems = []

    if (this.props.channel.apps) {
      this.props.channel.apps
        .filter(app => app.active)
        .map((app, index) => {
          if (!app.active) return
          if (!app.app.attachments) return
          if (app.app.attachments.length == 0) return

          app.app.attachments.map((button, i) => {
            menuItems.push({
              hide: false,
              icon: <AppIconImage image={button.icon} />,
              text: button.text,
              label: button.action.name,
              onClick: e =>
                this.handleActionClick({
                  ...button.action,
                  token: app.token,
                }),
            })
          })
        })
    }

    return menuItems
  }

  static getDerivedStateFromProps(props, state) {
    if (!props.update) return null

    // Only update one
    // We update the state ID here so the state gets set onlly once
    if (props.message.id != state.id && props.update) {
      // Set the contents of the editor
      EventService.getInstance().emit(SET_EDITOR_CONTENT, parseMessageMarkdown(props.message.body))

      // Update our state here to we know what we're editing
      return {
        id: props.message.id,
        attachments: props.message.attachments,
        text: props.message.body,
        parent: props.message.parent,
      }
    }

    return null
  }

  // Render functions for the compose.component
  // Readability
  renderUpdate() {
    if (!this.props.update) return null

    return (
      <UpdateContainer>
        <UpdateContainerInner className="row">
          <UpdateText>
            Updating message
            {this.props.message.parent && <span> - replying to {this.props.message.parent.user.name}</span>}
          </UpdateText>
          <div className="flexer"></div>
          <UpdateCancel className="button" onClick={this.props.clearMessage}>
            <IconComponent icon="x" color="white" size={15} />
          </UpdateCancel>
        </UpdateContainerInner>
      </UpdateContainer>
    )
  }

  renderCommands() {
    if (this.state.commands.length == 0) return null

    return (
      <DrawerContainer>
        <CommandContainer>
          {this.state.commands.map((command, index) => {
            return (
              <CommandRow key={index}>
                <CommandName>
                  /{command.slug} {command.name}
                </CommandName>
                <CommandDescription>{command.description}</CommandDescription>
              </CommandRow>
            )
          })}
        </CommandContainer>
      </DrawerContainer>
    )
  }

  renderReply() {
    if (!this.props.message || !this.props.reply) return null

    return (
      <ReplyPadding className="column align-items-stretch flexer">
        <ReplyText>Replying to:</ReplyText>
        <ReplyContainer className="row justify-content-center">
          <div className="pl-10 column flexer">
            <div className="row">
              <ReplyName>
                {this.props.message.app ? this.props.message.app.name : this.props.message.user.name}
              </ReplyName>
              <ReplyMeta>{moment(this.props.message.createdAt).fromNow()}</ReplyMeta>
            </div>
            <ReplyMessage
              dangerouslySetInnerHTML={{
                __html: parseMessageMarkdown(this.props.message.body),
              }}
            />
          </div>
          <IconComponent
            icon="x"
            size={20}
            color="#565456"
            className="ml-15 button"
            onClick={this.props.clearMessage}
          />
        </ReplyContainer>
      </ReplyPadding>
    )
  }

  renderInput() {
    return (
      <React.Fragment>
        {!this.props.channel.isMember && (
          <JoinContainer>
            <Button text="Join Channel" theme="muted" onClick={() => this.joinChannel(this.props.channel.id)} />
          </JoinContainer>
        )}

        <EditorComponent
          messageMode={true}
          editorId="compose"
          initialValue=""
          submit={this.props.update ? 'Update' : 'Send'}
          hidden={[]}
          emojiDirection="right-top"
          appsMenu={this.getAppsForAppsMenu()}
          channelId={this.props.channel.id}
          userName={this.props.user.username}
          populateCommands={text => this.populateCommands(text)}
          onBlur={({ html, markdown, attachments }) => console.log('BLUR::DONOTHING')}
          onSubmit={({ html, markdown, attachments }) => {
            this.onSend(markdown, attachments)
          }}
        />
      </React.Fragment>
    )
  }

  renderFooter() {
    return (
      <Footer className="row">
        <div className="row flexer">{!!this.props.typing && <span>{this.props.typing} is typing</span>}</div>
        <IconComponent icon="markdown" size={20} color="#cfd4d9" className="mr-10" />
        <span>
          <strong>**bold**</strong> <i>*italic*</i> <code>`code`</code> <del>~~strikeout~~</del> !!! priority
          &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
          <strong>/</strong> for available commands
        </span>
      </Footer>
    )
  }

  render() {
    if (this.props.disabled) return null

    return (
      <Compose className="column align-items-stretch">
        {this.state.error && <Error message={this.state.error} onDismiss={() => this.setState({ error: null })} />}
        {this.state.loading && <Spinner />}
        {this.state.notification && (
          <Notification text={this.state.notification} onDismiss={() => this.setState({ notification: null })} />
        )}

        {this.renderUpdate()}
        {this.renderCommands()}
        {this.renderReply()}
        {this.renderInput()}
        {this.renderFooter()}
      </Compose>
    )
  }
}

ComposeComponent.propTypes = {
  channel: PropTypes.any,
  team: PropTypes.any,
  teams: PropTypes.any,
  thread: PropTypes.bool,
  user: PropTypes.any,
  message: PropTypes.any,
  typing: PropTypes.string,
  reply: PropTypes.bool,
  update: PropTypes.bool,
  disabled: PropTypes.bool,
  clearMessage: PropTypes.any,
  createMessages: PropTypes.func,
  updateChannel: PropTypes.func,
  updateMessages: PropTypes.func,
  openApp: PropTypes.func,
}

const mapDispatchToProps = {
  createMessages: (channelId, channelMessage) => createMessages(channelId, channelMessage),
  updateMessages: (channelId, channelMessage) => updateMessages(channelId, channelMessage),
  createMessageMessages: (channelId, channelMessage) => createMessageMessages(channelId, channelMessage),
  updateMessageMessages: (channelId, channelMessage) => updateMessageMessages(channelId, channelMessage),
  updateChannelUpdateMessagePin: (channelId, channelMessage) =>
    updateChannelUpdateMessagePin(channelId, channelMessage),
  updateChannel: (channelId, updatedChannel) => updateChannel(channelId, updatedChannel),
  openApp: action => openApp(action),
}

const mapStateToProps = state => {
  return {
    channel: state.channel,
    user: state.user,
    team: state.team,
    message: state.message,
    teams: state.teams,
    parentMessage: state.message,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ComposeComponent)

const JoinContainer = styled.div`
  width: 100%;
  height: 100%;
  background: white;
  position: absolute;
  z-index: 1000;
  display: flex;
  flex-direction: center;
  justify-content: center;
  align-content: center;
  align-items: center;
`

const UpdateContainer = styled.div`
  position: relative;
  width: 100%;
`

const UpdateContainerInner = styled.div`
  flex: 1;
  margin: 3px;
  border-radius: 5px;
  background: #00aeff;
  padding: 5px;
`

const UpdateText = styled.div`
  font-size: 10px;
  color: white;
  font-weight: 700;
`

const UpdateCancel = styled.div`
  display: flex;
  flex-direction: center;
  justify-content: center;
  align-content: center;
  align-items: center;
`

const ReplyPadding = styled.div`
  padding: 25px;
`

const ReplyContainer = styled.div`
  border: 1px solid #cbd4db;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 5px;
  margin-right: 5px;
`

const ReplyMessage = styled.div`
  font-weight: 500;
  font-size: 16px;
  font-style: normal;
  color: #151b26;
  display: inline-block;
`

const ReplyText = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #adb5bd;
  font-weight: regular;
  margin-bottom: 10px;
  display: inline-block;
`

const ReplyName = styled.div`
  font-weight: 700;
  font-style: normal;
  font-size: 12px;
  color: #151b26;
  display: inline-block;
`

const ReplyMeta = styled.div`
  margin-left: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #adb5bd;
  font-weight: regular;
`

const Compose = styled.div`
  width: 100%;
  padding: 0px;
  border-sizing: box-border;
  z-index: 4;
`

const Footer = styled.div`
  padding: 25px;
  padding-top: 0px;
  font-size: 11px;
  font-weight: 700;
  color: #cfd4d9;

  * {
    font-size: 11px;
  }

  del {
    text-decoration: line-through;
  }

  strong {
    font-weight: 800;
  }

  @media only screen and (max-width: 768px) {
    display: none;
  }
`

const DrawerContainer = styled.div`
  width: 100%;
  position: absolute;
  background: white;
  top: 0px;
  right: 0px;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  transform: translateY(-100%);
  border-top: 1px solid #ebedef;
  overflow: hidden;
  z-index: 100000;
`

const AppIconImage = styled.div`
  width: 15px;
  height: 15px;
  margin-left: 5px;
  margin-right: 5px;
  overflow: hidden;
  background-size: contain;
  background-position: center center;
  background-repeat: no-repeat;
  background-color: transparent;
  background-image: url(${props => props.image});
`

const CommandContainer = styled.div`
  width: 100%;
  padding-top: 10px;
  padding-bottom: 10px;
`

const CommandRow = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: stretch;
  align-content: center;
  justify-content: center;
  padding-right: 25px;
  padding-left: 25px;
  padding-top: 5px;
  padding-bottom: 5px;
`

const CommandDescription = styled.div`
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: #adb5bd;
  font-weight: regular;
`

const CommandName = styled.div`
  font-weight: 500;
  font-style: normal;
  font-size: 12px;
  color: #151b26;
  padding-right: 10px;
`
