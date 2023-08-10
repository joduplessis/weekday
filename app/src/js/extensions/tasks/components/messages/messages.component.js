import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { IconComponent } from '../../../../components/icon.component'
import { classNames, logger, getMentions } from '../../../../helpers/util'
import {
  Popup,
  Input,
  Textarea,
  Modal,
  Tabbed,
  Notification,
  Spinner,
  Error,
  User,
  Menu,
  Avatar,
  Button,
  Range,
} from '../../../../elements'
import marked from 'marked'
import { TextareaComponent } from '../../../../components/textarea.component'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import './messages.component.css'
import * as moment from 'moment'
import dayjs from 'dayjs'
import Keg from '@joduplessis/keg'
import UploadService from '../../../../services/upload.service'
import { EditorComponent } from '../../../../components/editor/editor.component'

class MessagesComponent extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      error: null,
      loading: false,
      notification: null,
      manualScrolling: false,
      loaded: false,
    }

    this.scrollInterval = null
    this.scrollRef = React.createRef()
    this.messagesRef = React.createRef()
    this.scrollToBottom = this.scrollToBottom.bind(this)
    this.handleScrollEvent = this.handleScrollEvent.bind(this)
  }

  scrollToBottom() {
    // If there is no scroll ref
    if (!this.scrollRef) return

    // If the user is scrolling
    if (this.state.manualScrolling) return

    // Move it right down
    this.scrollRef.scrollTop = this.scrollRef.scrollHeight
  }

  handleScrollEvent(e) {
    // If there is no scroll ref
    if (!this.scrollRef) return

    // If the user scvrolls up - then fetch more messages
    // 0 = the top of the container
    // if (this.messages.nativeElement.scrollTop == 0) this.fetchCourseMessages()

    // Calculate the difference between the bottom & where the user is
    const offsetHeight = this.scrollRef.scrollHeight - this.scrollRef.scrollTop

    // If they are at the bottom: this.scrollRef.offsetHeight >= offsetHeight
    // Toggle whether the user is scrolling or not
    // If not, then we handle the scrolling
    if (this.scrollRef.offsetHeight >= offsetHeight) {
      this.setState({ manualScrolling: false })
    } else {
      this.setState({ manualScrolling: true })
    }

    // If the user scvrolls up - then fetch more messages
    // 0 = the top of the container
    if (this.scrollRef.scrollTop == 0) this.props.handleFetchMoreMessages()
  }

  componentDidUpdate(prevProps) {
    this.scrollToBottom()
  }

  componentWillUnmount() {
    clearInterval(this.scrollInterval)
  }

  componentDidMount() {
    this.scrollRef.addEventListener('scroll', this.handleScrollEvent)

    // Just need to wait for the DOM to be there
    this.scrollInterval = setInterval(() => this.scrollToBottom(), 100)

    // Make sure the buffer padding gets set
    setTimeout(() => this.setState({ loaded: true }), 0)
  }

  render() {
    const height = this.messagesRef
      ? window.innerHeight - this.messagesRef.offsetHeight < 0
        ? '0px'
        : window.innerHeight - this.messagesRef.offsetHeight + 'px'
      : '100%'

    return (
      <div className="messages-container">
        {this.state.error && <Error message={this.state.error} onDismiss={() => this.setState({ error: null })} />}
        {this.state.loading && <Spinner />}
        {this.state.notification && (
          <Notification text={this.state.notification} onDismiss={() => this.setState({ notification: null })} />
        )}

        <div className="messages">
          <div className="scrolling">
            <div className="inner" ref={ref => (this.scrollRef = ref)}>
              <div style={{ height }} />

              <div className="w-100" ref={ref => (this.messagesRef = ref)}>
                {this.props.messages.map((message, index) => {
                  return (
                    <Message
                      key={index}
                      files={message.files}
                      user={message.user}
                      body={message.body}
                      createdAt={message.createdAt}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', width: '100%' }}>
          <EditorComponent
            messageMode={true}
            editorId="task-messages"
            initialValue=""
            submit="Send"
            hidden={[]}
            emojiDirection="right-top"
            channelId={this.props.channel.id}
            onSubmit={({ html, markdown, attachments }) => {
              const body = markdown
              const files = attachments.map((attachment, _) => {
                return {
                  url: attachment.uri,
                  filename: attachment.name,
                }
              })
              this.props.handleCreateMessage(files, body)
            }}
            onBlur={({ html, markdown, attachments }) => console.log('BLUR::DONOTHING')}
          />
        </div>
      </div>
    )
  }
}

const Message = ({ user, body, files, createdAt }) => {
  const hasFiles = !!files ? files.length > 0 : false

  return (
    <div className="message">
      <Avatar size="small-medium" image={user.image} title={user.name} className="mb-5 mr-5" />
      <div className="column">
        <div className="row">
          <div className="user">{user.name}</div>
          <div className="date">{moment(createdAt).fromNow()}</div>
        </div>
        <div className="text" dangerouslySetInnerHTML={{ __html: marked(body) }}></div>
        {hasFiles && (
          <div className="message-files">
            <div className="files">
              {files.map((file, index) => {
                return <File borderless key={index} filename={file.filename} url={file.url} />
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const File = ({ filename, url, onDelete, borderless }) => {
  const [over, setOver] = useState(false)
  const classes = classNames({
    file: true,
    borderless: borderless,
  })

  return (
    <div onMouseEnter={() => setOver(true)} onMouseLeave={() => setOver(false)} className={classes}>
      <IconComponent icon="attachment" color="#adb5bd" size="12" />
      <a href={url} className="filename" target="_blank">
        {filename}
      </a>
      {over && !!onDelete && (
        <IconComponent icon="x" color="#ec224b" size="12" className="button" onClick={() => onDelete(url)} />
      )}
    </div>
  )
}

MessagesComponent.propTypes = {
  messages: PropTypes.array,
  handleCreateMessage: PropTypes.func,
  handleFetchMoreMessages: PropTypes.func,
}

const mapDispatchToProps = {}

const mapStateToProps = state => {
  return {
    channel: state.channel,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessagesComponent)
