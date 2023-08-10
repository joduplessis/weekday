import React from 'react'
import { connect } from 'react-redux'
import { Picker } from 'emoji-mart'
import styled from 'styled-components'
import moment from 'moment'
import PropTypes from 'prop-types'
import {
  openApp,
  updateLoading,
  updateError,
  updateChannelUpdateMessagePin,
  updateChannel,
  createChannelMessage,
  updateChannelMessage,
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
import { FOCUS_COMPOSE_INPUT } from '../constants'
import { EditorComponent } from './editor/editor.component'

class ComposeComponent extends React.Component {
  constructor(props) {
    super(props)

    /*
    Placeholder attachment for testing:
    {
      uri: "https://weekday-user-assets.s3-us-west-2.amazonaws.com/20-12-2020/4d7e8b30-42fd-11eb-abe5-7dc762bdb7d3.zapier.png?AWSAccessKeyId=AKIASVCBLB7GH6JHCIWJ&Expires=1608498254&Signature=6gJfBrP7qwIhGsgtCQefZpdAN1o%3D",
      mime: "image/jpeg",
      size: 17361,
      name: "tester.jpg",
    }
    */
    this.state = {
      id: null,
      emoticonMenu: false,
      appsMenu: false,
      scrollHeight: 0,
      attachments: [],
      typing: [],
      parent: [],
      text: '',
      mention: null,
      position: 0,
      members: [],
      commands: [],
      shift: false,
      error: null,
      loading: null,
      notification: null,
      isDragging: false,
    }

    this.onSearch$ = new Subject()
    this.subscription = null

    this.composeRef = React.createRef()
    this.fileRef = React.createRef()

    this.createChannelMessage = this.createChannelMessage.bind(this)
    this.updateChannelMessage = this.updateChannelMessage.bind(this)
    this.handleFileChange = this.handleFileChange.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.insertAtCursor = this.insertAtCursor.bind(this)
    this.handleComposeChange = this.handleComposeChange.bind(this)
    this.replaceWordAtCursor = this.replaceWordAtCursor.bind(this)
    this.onSend = this.onSend.bind(this)
    this.handleActionClick = this.handleActionClick.bind(this)
    this.clearMessage = this.clearMessage.bind(this)
    this.focusComposeInput = this.focusComposeInput.bind(this)
    this.fetchResults = this.fetchResults.bind(this)
    this.populateCommands = this.populateCommands.bind(this)
    this.getAppsForAppsMenu = this.getAppsForAppsMenu.bind(this)
    this.joinChannel = this.joinChannel.bind(this)

    this.renderMembers = this.renderMembers.bind(this)
    this.renderUpdate = this.renderUpdate.bind(this)
    this.renderAttachments = this.renderAttachments.bind(this)
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

  onSend() {
    if (this.state.text == '') return

    // If this message is a general (any) app command
    if (this.state.text[0] == '/') {
      // Remove the / from processing the command (1st character)
      // Only make the 1st 2 pieces of text lowercase
      // those are:
      // - app slug
      // - app command
      const commandTextParts = this.state.text.slice(1).split(' ')

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

      // Reset our view
      // Members is just to be sure here - no other reason
      this.clearMessage()

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
          }
        })
      })
    } else {
      const id = this.props.message ? this.props.message.id : null
      const text = this.state.text
      const attachments = this.state.attachments
      const parent = this.props.parentMessage.id
        ? this.props.parentMessage.id
        : this.props.reply
        ? this.props.message
          ? this.props.message.id
          : null
        : null

      // If it's a reply OR create
      if (!this.props.update) this.createChannelMessage(this.props.channel.id, text, attachments, parent)

      // If it's an update
      if (this.props.update) this.updateChannelMessage(this.props.channel.id, id, text, attachments)

      // Reset the message
      this.clearMessage()

      // And then resize our input textarea to default
      this.composeRef.style.height = '25px'
    }
  }

  async createChannelMessage(channelId, body, attachments, parentId) {
    try {
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
      this.props.createChannelMessage(channelId, channelMessage)
      this.props.updateChannel(channelId, { excerpt })
    } catch (e) {
      console.log(e)
    }
  }

  async updateChannelMessage(channelId, messageId, body, attachments) {
    const userName = this.props.user.name
    const userId = this.props.user.id
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
      this.props.updateChannelMessage(channelId, channelMessage)
      this.props.updateChannel(channelId, { excerpt })
    } catch (e) {
      console.log(e)
      logger(e)
    }
  }

  clearMessage() {
    // Clear the parent/update message
    this.props.clearMessage()

    // Reset our state
    this.setState({
      id: null,
      text: '',
      members: [],
      attachments: [],
      commands: [],
    })
  }

  async handleFileChange(e) {
    const files = e.target.files || []

    if (files.length == 0) return

    for (let file of files) {
      Keg.keg('compose').refill('uploads', file)
    }
  }

  insertAtCursor(text) {
    const { selectionStart } = this.composeRef
    const updatedText = [this.state.text.slice(0, selectionStart), text, this.state.text.slice(selectionStart)].join('')

    // Update the text & clos the menu
    // If it was an emoji, close it
    this.setState(
      {
        text: updatedText,
        emoticonMenu: false,
      },
      () => {
        this.composeRef.focus()
      }
    )
  }

  // Fires 1st
  handleKeyDown(e) {
    if (!this.props.channel.isMember) return

    const { keyCode } = e
    const channelId = this.props.channel.id
    const userName = this.props.user.username

    // Enter
    if (keyCode == 13) e.preventDefault()

    // Shift
    if (keyCode == 16) this.setState({ shift: true })

    // Enter & Shift & no member popup
    if (keyCode == 13 && !this.state.shift && this.state.members.length == 0) this.onSend()

    // Enter & Shift
    // TODO ⚠️ - this might be redudant
    if (keyCode == 13 && this.state.shift) this.insertAtCursor('\n')

    // Update typing only with alpha numeric - not the following (can change)
    if (
      (keyCode > 47 && keyCode < 58) || // number keys
      (keyCode == 32 || keyCode == 13) || // spacebar & return key(s)
      (keyCode > 64 && keyCode < 91) // letter keys
    ) {
      notifyChannelOfTyping(channelId, userName)
    }
  }

  // Fires 2nd
  handleComposeChange(e) {
    if (!this.props.channel.isMember) return

    const text = e.target.value

    this.setState({ text, commands: [] }, () => {
      // If the first word is the command shorthand
      // Then pass only the first word to look for available commands
      // First also remove the slash
      if (text[0] == '/') return this.populateCommands(text)

      const { selectionStart } = this.composeRef
      const wordArray = this.composeRef.value.slice(0, selectionStart).split(' ').length
      const word = this.composeRef.value.split(' ')[wordArray - 1]
      const firstLetter = word[0]

      // If the user is NOT searching for someone
      // Then remove the timeout &
      if (firstLetter != '@') this.setState({ members: [] })

      // If the user is searching, then delay the search to accommodate typing
      if (firstLetter == '@') this.filterMembers(word.replace('@', ''))
    })
  }

  // Fires 3rd
  handleKeyUp(e) {
    if (!this.props.channel.isMember) return

    // Right Shift
    if (e.keyCode == 16) this.setState({ shift: false })
  }

  populateCommands(text) {
    const commands = []

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

  filterMembers(username) {
    this.onSearch$.next(username)

    if (username == '') this.setState({ members: [] })
  }

  replaceWordAtCursor(word) {
    const { selectionStart } = this.composeRef
    const wordArray = this.composeRef.value.slice(0, selectionStart).split(' ').length
    const mention = this.composeRef.value.split(' ')[wordArray - 1]
    let startingPosition = selectionStart
    let nextChar

    while (nextChar != '@') {
      nextChar = this.state.text[startingPosition]

      if (nextChar != '@') startingPosition--
    }

    // Remove the whole word - do not use the current selectionStart
    const endPosition = startingPosition + word.length

    // Replace & move the cursor forward
    this.setState({
      text: this.state.text.splice(startingPosition, endPosition, word),
      members: [],
    })

    // Refocus the input
    this.composeRef.focus()
  }

  focusComposeInput() {
    if (this.composeRef) this.composeRef.focus()
  }

  async componentDidMount() {
    this.focusComposeInput()

    // Listen for file changes in attachments
    Keg.keg('compose').tap(
      'uploads',
      (file, pour) => {
        this.setState({ error: null, loading: true })

        const { name, type, size } = file
        const secured = true

        UploadService.getUploadUrl(name, type, secured)
          .then(raw => raw.json())
          .then(res => {
            const { url } = res

            UploadService.uploadFile(url, file, type)
              .then(upload => {
                const mime = type
                const urlParts = upload.url.split('?')
                const rawUri = urlParts[0]
                let uriParts = rawUri.replace('https://', '').split('/')

                // Remove the first index value (AWS URL)
                uriParts.shift()

                // Combine the KEY for aws
                const uri = uriParts.join('/')

                // Get the signed URL for this key
                UploadService.getSignedGetUrl(uri)
                  .then(raw => raw.json())
                  .then(res1 => {
                    // Add the new files & increase the index
                    // And pour again to process the next file
                    this.setState(
                      {
                        attachments: [...this.state.attachments, { uri: res1.url, mime, size, name }],
                      },
                      () => pour()
                    )
                  })
                  .catch(err => {
                    this.setState({
                      error: 'Error getting URL',
                      loading: false,
                    })
                  })
              })
              .catch(err => {
                this.setState({ error: 'Error getting URL', loading: false })
              })
          })
          .catch(err => {
            this.setState({ error: 'Error getting URL', loading: false })
          })
      },
      () => {
        // This is the empty() callback
        // Stop loading when all is done
        this.setState({ loading: false })
      }
    )

    // Listen for focus messages (from message.component)
    EventService.getInstance().on(FOCUS_COMPOSE_INPUT, data => {
      this.focusComposeInput()
    })

    // Here we handle the delay for the yser typing in the mentions
    this.subscription = this.onSearch$.pipe(debounceTime(1000)).subscribe(username => this.fetchResults(username))
  }

  componentWillUnmount() {
    // Remove the search filter
    if (this.subscription) this.subscription.unsubscribe()
  }

  async fetchResults(username) {
    if (username == '') return

    this.setState({
      loading: true,
      error: null,
    })

    try {
      const channelId = this.props.channel.id
      const teamId = this.props.team.id
      const page = 0
      let members

      // If it's a public channel, then we want to search team members
      if (this.props.channel.public && !this.props.channel.private) {
        const searchTeamMembers = await GraphqlService.getInstance().searchTeamMembers(teamId, username, page)
        members = searchTeamMembers.data.searchTeamMembers ? searchTeamMembers.data.searchTeamMembers : []
      } else {
        const searchChannelMembers = await GraphqlService.getInstance().searchChannelMembers(channelId, username, page)
        members = searchChannelMembers.data.searchChannelMembers ? searchChannelMembers.data.searchChannelMembers : []
      }

      // Remove ourselves / cap at 5
      const filteredMembers = members
        .filter((member, index) => member.user.username != this.props.user.username)
        .filter((member, index) => index < 5)

      // Update our users & bump the page
      this.setState({
        loading: false,
        members: filteredMembers,
      })
    } catch (e) {
      this.setState({
        loading: false,
        error: 'Error searching members',
      })
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (!props.update) return null

    // Only update one
    // We update the state here so the state gets set onlly once
    if (props.message.id != state.id && props.update) {
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
    if (this.props.update) {
      return (
        <UpdateContainer className="row">
          <UpdateText>
            Updating message
            {this.props.message.parent && <span> - replying to {this.props.message.parent.user.name}</span>}
          </UpdateText>
          <div className="flexer"></div>
          <UpdateCancel className="button" onClick={this.clearMessage}>
            Cancel
          </UpdateCancel>
        </UpdateContainer>
      )
    }

    return null
  }

  renderAttachments() {
    if (!this.state.attachments) return null
    if (!this.state.attachments.length) return null
    if (this.state.attachments.length == 0) return null

    return (
      <Attachments className="row">
        {this.state.attachments.map((attachment, index) => {
          return (
            <Attachment
              key={index}
              uri={attachment.uri}
              mime={attachment.mime}
              size={attachment.size}
              name={attachment.name}
              createdAt={null}
              onDeleteClick={() =>
                this.setState({
                  attachments: this.state.attachments.filter((a, _) => {
                    return attachment.uri != a.uri
                  }),
                })
              }
            />
          )
        })}
      </Attachments>
    )
  }

  renderMembers() {
    if (this.state.members.length == 0) return null

    return (
      <DrawerContainer>
        <Members
          members={this.state.members}
          handleAccept={member => this.replaceWordAtCursor(`@${member.user.username} `)}
        />
      </DrawerContainer>
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
    if (this.props.message && this.props.reply) {
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

    return null
  }

  getAppsForAppsMenu() {
    const menuItems = []

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

    return menuItems
  }

  renderInput() {
    if (this.composeRef) {
      if (this.composeRef.style) {
        this.composeRef.style.height = '1px'
        this.composeRef.style.height = this.composeRef.scrollHeight + 'px'
      }
    }

    const appMenuItems = this.getAppsForAppsMenu()

    return (
      <React.Fragment>
        {!this.props.channel.isMember && (
          <JoinContainer>
            <Button text="Join Channel" theme="muted" onClick={() => this.joinChannel(this.props.channel.id)} />
          </JoinContainer>
        )}

        <InputContainer>
          <input
            className="hide"
            ref={ref => (this.fileRef = ref)}
            type="file"
            multiple
            onChange={this.handleFileChange}
          />

          <Input
            ref={ref => (this.composeRef = ref)}
            placeholder="Say something"
            value={this.state.text}
            onKeyUp={this.handleKeyUp}
            onKeyDown={this.handleKeyDown}
            onChange={this.handleComposeChange}
          />

          <InputContainerIcons>
            {appMenuItems.length > 0 && (
              <Popup
                handleDismiss={() => this.setState({ appsMenu: false })}
                visible={this.state.appsMenu}
                width={275}
                direction="right-top"
                content={<Menu items={appMenuItems} />}
              >
                <IconComponent
                  icon="more-v"
                  size={19}
                  color="#565456"
                  className="button"
                  onClick={() => this.setState({ appsMenu: true })}
                />
              </Popup>
            )}

            <div style={{ width: 10 }} />

            <Popup
              handleDismiss={() => this.setState({ emoticonMenu: false })}
              visible={this.state.emoticonMenu}
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
                  onSelect={emoji => this.insertAtCursor(emoji.colons)}
                />
              }
            >
              <IconComponent
                icon="smile"
                size={19}
                color="#565456"
                className="button"
                onClick={() => this.setState({ emoticonMenu: true })}
              />
            </Popup>

            <IconComponent
              icon="attachment"
              size={20}
              color="#565456"
              className="ml-10 button"
              onClick={() => this.fileRef.click()}
            />

            <IconComponent
              icon="at"
              size={18}
              color="#565456"
              className="ml-10 button"
              onClick={() => {
                this.insertAtCursor('@')
                this.filterMembers('')
              }}
            />

            <IconComponent icon="send" size={18} color="#565456" className="ml-10 button" onClick={this.onSend} />
          </InputContainerIcons>
        </InputContainer>
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

        <EditorComponent
          messageMode={true}
          editorId="compose"
          initialValue=""
          submit="Send"
          hidden={[]}
          emojiDirection="right-top"
          channelId={this.props.channel.id}
          onSubmit={({ html, attachments }) => {
            const body = html
            const files = attachments.map((attachment, _) => {
              return {
                url: attachment.uri,
                filename: attachment.name,
              }
            })
            console.log(files, body)
            //this.props.handleCreateMessage(files, body)
          }}
          onBlur={({ html, attachments }) => console.log('BLUR::DONOTHING')}
        />

        {this.renderAttachments()}
        {this.renderUpdate()}
        {this.renderMembers()}
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
  message: PropTypes.any,
  teams: PropTypes.any,
  user: PropTypes.any,
  message: PropTypes.any,
  typing: PropTypes.string,
  reply: PropTypes.bool,
  update: PropTypes.bool,
  disabled: PropTypes.bool,
  clearMessage: PropTypes.any,
  createChannelMessage: PropTypes.func,
  updateChannel: PropTypes.func,
  updateChannelMessage: PropTypes.func,
  openApp: PropTypes.func,
}

const mapDispatchToProps = {
  createChannelMessage: (channelId, channelMessage) => createChannelMessage(channelId, channelMessage),
  updateChannelMessage: (channelId, channelMessage) => updateChannelMessage(channelId, channelMessage),
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
  z-index: 10;
  display: flex;
  flex-direction: center;
  justify-content: center;
  align-content: center;
  align-items: center;
`

const UpdateContainer = styled.div`
  /*transform: translateY(-100%);*/
  position: relative; /* absolute */
  background: #f8f9fa;
  border-top: 1px solid #e1e7eb;
  border-bottom: 1px solid #e1e7eb;
  width: 100%;
`

const UpdateText = styled.div`
  padding: 5px 10px 5px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #adb5bd;
  font-weight: regular;
`

const UpdateCancel = styled.div`
  padding: 5px 10px 5px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #007af5;
  font-weight: regular;
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

const InputContainer = styled.div`
  flex: 1;
  padding: 25px;
  padding-bottom: 0px;
  display: flex;
  flex-direction: row;
  align-content: center;
  align-items: center;
  justify-content: center;

  @media only screen and (max-width: 768px) {
    padding: 15px;
    flex-direction: column;
    align-items: stretch;
  }
`

const InputContainerIcons = styled.div`
  display: flex;
  flex-direction: row;
  align-content: center;
  align-items: center;
  justify-content: flex-start;
  wqidth: 100%;

  @media only screen and (max-width: 768px) {
    margin-left: -10px;
    margin-top: 10px;
  }
`

const Attachments = styled.div`
  width: 100%;
  padding: 20px;
  background: #ffffff;
  border-top: 1px solid #ecf0f2;
  position: relative; /* absolute */
  top: -1px;
  left: 0px;
  /*transform: translateY(-100%);*/
  z-index: 4;
`

const Footer = styled.div`
  padding-top: 0px;
  padding: 25px;
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

const Input = styled.textarea`
  width: 100%;
  word-wrap: break-word;
  border: none;
  resize: none;
  overflow: none;
  display: block;
  background: transparent;
  color: #212123;
  font-size: 16px;
  font-weight: 400;
  height: auto;

  &::placeholder {
    color: #cfd4d9;
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

const AppIconContainer = styled.div`
  margin-left: 15px;
  cursor: pointer;
  opacity: 1;
  transition: opacity 0.25s;

  &:hover {
    opacity: 0.8;
  }
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
