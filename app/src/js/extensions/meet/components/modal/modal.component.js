import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { IconComponent } from '../../../../components/icon.component'
import { classNames, logger, getMentions, sortMessagesByCreatedAt } from '../../../../helpers/util'
import ModalPortal from '../../../../portals/modal.portal'
import * as chroma from 'chroma-js'
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
import QuickUserComponent from '../../../../components/quick-user.component'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import GraphqlService from '../../../../services/graphql.service'
import arrayMove from 'array-move'
import MessagesComponent from '../../../tasks/components/messages/messages.component'
import { TASK_ORDER_INDEX, TASKS_ORDER, DEVICE, MIME_TYPES } from '../../../../constants'
import './modal.component.css'
import EventService from '../../../../services/event.service'
import { hydrateMeet, updateMeetAddMessage, hydrateMeetMessages } from '../../../../actions'
import DayPicker from 'react-day-picker'
import * as moment from 'moment'
import dayjs from 'dayjs'
import Keg from '@joduplessis/keg'
import UploadService from '../../../../services/upload.service'

class ModalComponent extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      page: 0,
      ready: true,
    }

    this.handleCreateMessage = this.handleCreateMessage.bind(this)
    this.handleFetchMoreMessages = this.handleFetchMoreMessages.bind(this)
  }

  componentDidMount() {}

  async handleCreateMessage(files, body) {
    try {
      this.setState({
        loading: true,
        error: false,
      })

      const { user } = this.props
      const userId = user.id
      const channelId = this.props.channel.id
      const meetId = this.props.meet.id

      if (!meetId) return this.setState({ loading: false, error: 'No meet loaded' })

      // Add the message
      await GraphqlService.getInstance().createMeetMessage(meetId, body, userId, files)

      // Consturct this manually because the document is actually
      // Part of the TaskDocument - so we don't rely on the GQL resolvers
      // to construct the return document for us
      // ie: { new: true } <- won't work for MOngoose
      const createdAt = new Date()
      const message = { body, user, createdAt, files }

      // Add the new subtask to the store
      this.props.updateMeetAddMessage(meetId, message, channelId)
      this.setState({ loading: false })
    } catch (e) {
      this.setState({ loading: false, error: 'Error creating message' })
    }
  }

  async handleFetchMoreMessages() {
    try {
      if (!this.state.ready) return
      this.setState({ ready: false, loading: true }, async () => {
        const meetId = this.props.meet.id
        const page = this.state.page + 1
        const {
          data: { meetMessages },
        } = await GraphqlService.getInstance().meetMessages(meetId, page)
        this.props.hydrateMeetMessages(meetMessages)
        this.setState({ page, ready: true, loading: false })
      })
    } catch (e) {
      this.setState({ ready: true, loading: false, error: 'Error fetching meet messages' })
    }
  }

  render() {
    return (
      <ModalPortal>
        <div className="meet-modal-close-icon" onClick={this.props.onClose}>
          <IconComponent icon="x" color="#3F474C" size={15} />
        </div>
        <Modal
          position="right"
          header={false}
          title="Meet"
          width={400}
          height="100%"
          frameless
          onClose={this.props.onClose}
        >
          {this.state.error && <Error message={this.state.error} onDismiss={() => this.setState({ error: null })} />}
          {this.state.loading && <Spinner />}
          {this.state.notification && (
            <Notification text={this.state.notification} onDismiss={() => this.setState({ notification: null })} />
          )}

          <div className="meet-modal-container">
            <div className="panels">
              <div className="panel">
                <MessagesComponent
                  messages={this.props.meet.messages}
                  handleFetchMoreMessages={this.handleFetchMoreMessages}
                  handleCreateMessage={this.handleCreateMessage}
                />
              </div>
            </div>
          </div>
        </Modal>
      </ModalPortal>
    )
  }
}

ModalComponent.propTypes = {
  meet: PropTypes.any,
  user: PropTypes.any,
  channel: PropTypes.any,
  onClose: PropTypes.func,
  hydrateMeet: PropTypes.func,
  updateMeetAddMessage: PropTypes.func,
  hydrateMeetMessages: PropTypes.func,
}

const mapDispatchToProps = {
  hydrateMeetMessages: messages => hydrateMeetMessages(messages),
  hydrateMeet: meet => hydrateMeet(meet),
  updateMeetAddMessage: (meetId, message, channelId) => updateMeetAddMessage(meetId, message, channelId),
}

const mapStateToProps = state => {
  return {
    user: state.user,
    channel: state.channel,
    meet: state.meet,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModalComponent)
