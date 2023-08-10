import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { IconComponent } from '../components/icon.component'
import { classNames, logger, getMentions, sortMessagesByCreatedAt } from '../helpers/util'
import ModalPortal from '../portals/modal.portal'
import { Modal, Notification, Spinner, Error } from '../elements'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import GraphqlService from '../services/graphql.service'
import './message.modal.css'
import { deleteChannelUnread, hydrateMessage } from '../actions'
import ComposeComponent from '../components/compose.component'
import MessagesComponent from '../components/messages.component'
import { Avatar } from '../elements'

class MessageModal extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      error: null,
      notification: null,
      manualScrolling: false,
      messages: [],
      compose: '',
      message: null,
      reply: false,
      update: false,
    }

    this.scrollInterval = null

    this.scrollRef = React.createRef()
    this.messagesRef = React.createRef()

    this.fetchMessage = this.fetchMessage.bind(this)
    this.scrollToBottom = this.scrollToBottom.bind(this)
    this.handleScrollEvent = this.handleScrollEvent.bind(this)
    this.setUpdateMessage = this.setUpdateMessage.bind(this)
    this.deleteChannelUnread = this.deleteChannelUnread.bind(this)
  }

  async deleteChannelUnread() {
    const channelId = this.props.channel.id
    const userId = this.props.user.id
    const parentId = this.props.messageId
    const threaded = true

    try {
      // parentId is null (so ignore this)
      // threaded is false
      await GraphqlService.getInstance().deleteChannelUnread(userId, channelId, parentId, threaded)

      // Add the new messages to the channel
      this.props.deleteChannelUnread(channelId, parentId, threaded)
    } catch (e) {
      console.log(e)
    }
  }

  async fetchMessage() {
    try {
      this.setState({ loading: true })

      const { messageId } = this.props
      const { data } = await GraphqlService.getInstance().messageMessages(messageId)

      // Update the Redux store
      this.setState({ loading: false })

      // update our store with the sorted messages
      this.props.hydrateMessage({
        ...this.props.message,
        id: this.props.messageId,
        messages: sortMessagesByCreatedAt(data.messageMessages),
      })

      // Remove the unread count
      this.deleteChannelUnread()
    } catch (e) {
      this.setState({
        error: 'Error fetching messages',
        loading: false,
      })
    }
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
  }

  componentDidMount() {
    this.fetchMessage()

    // Event listener for the scroll
    this.scrollRef.addEventListener('scroll', this.handleScrollEvent)

    // Just need to wait for the DOM to be there
    this.scrollInterval = setInterval(() => this.scrollToBottom(), 100)
  }

  componentDidUpdate(prevProps) {
    this.scrollToBottom()
  }

  setUpdateMessage(message) {
    this.setState({ message, update: true, reply: false })
  }

  componentWillUnmount() {
    clearInterval(this.scrollInterval)
  }

  render() {
    const height = this.messagesRef
      ? window.innerHeight - this.messagesRef.offsetHeight < 0
        ? '0px'
        : window.innerHeight - this.messagesRef.offsetHeight + 'px'
      : '100%'

    return (
      <React.Fragment>
        <div className="message-modal-close-icon" onClick={this.props.onClose}>
          <IconComponent icon="x" color="#3F474C" size={15} />
        </div>

        <ModalPortal>
          <Modal
            position="right"
            header={false}
            title="Task"
            width={600}
            height="100%"
            frameless
            onClose={this.props.onClose}
          >
            {this.state.error && <Error message={this.state.error} onDismiss={() => this.setState({ error: null })} />}
            {this.state.loading && <Spinner />}
            {this.state.notification && (
              <Notification text={this.state.notification} onDismiss={() => this.setState({ notification: null })} />
            )}

            <div className="message-modal-container">
              <div className="panels">
                <div className="panel">
                  <div className="title row align-items-start">
                    <Avatar title={this.props.message.user.name} image={this.props.message.user.image} size="medium" />
                    <div className="column flexer pl-20">
                      <div className="user">{this.props.message.user.name}</div>
                      <div
                        className="body"
                        dangerouslySetInnerHTML={{
                          __html: this.props.message.body,
                        }}
                      />
                    </div>
                  </div>
                  <div className="messages">
                    <div className="scrolling">
                      <div className="inner" ref={ref => (this.scrollRef = ref)}>
                        <div style={{ height }} />

                        <div className="w-100" ref={ref => (this.messagesRef = ref)}>
                          <MessagesComponent
                            thread
                            hideParentMessages
                            messages={this.props.message.messages}
                            highlight=""
                            setUpdateMessage={this.setUpdateMessage}
                            setReplyMessage={() => console.log('disabled')}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="compose">
                    <ComposeComponent
                      thread
                      disabled={false}
                      reply={null}
                      update={this.state.update}
                      message={this.state.message}
                      clearMessage={() => {
                        this.setState({
                          message: null,
                          update: false,
                          reply: false,
                        })
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        </ModalPortal>
      </React.Fragment>
    )
  }
}

MessageModal.propTypes = {
  user: PropTypes.any,
  channel: PropTypes.any,
  team: PropTypes.any,
  message: PropTypes.any,
  onClose: PropTypes.func,
  deleteChannelUnread: PropTypes.func,
  hydrateMessage: PropTypes.func,
}

const mapDispatchToProps = {
  hydrateMessage: message => hydrateMessage(message),
  deleteChannelUnread: (channelId, parentId, threaded) => deleteChannelUnread(channelId, parentId, threaded),
}

const mapStateToProps = state => {
  return {
    user: state.user,
    channel: state.channel,
    team: state.team,
    task: state.task,
    message: state.message,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessageModal)
