import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { IconComponent } from '../../../../components/icon.component'
import {
  classNames,
  logger,
  getMentions,
  sortMessagesByCreatedAt,
  sortTasksByOrder,
  findChildTasks,
  getHighestTaskOrder,
} from '../../../../helpers/util'
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
import MessageComponent from '../../../../components/message.component'
import GraphqlService from '../../../../services/graphql.service'
import { CheckboxComponent } from '../checkbox/checkbox.component'
import arrayMove from 'array-move'
import { TasksComponent } from '../tasks/tasks.component'
import MessagesComponent from '../messages/messages.component'
import { TASK_ORDER_INDEX, TASKS_ORDER, DEVICE, MIME_TYPES, SORT, SET_EDITOR_CONTENT } from '../../../../constants'
import './modal.component.css'
import EventService from '../../../../services/event.service'
import {
  updateChannel,
  createMessages,
  updateMessagesTaskAttachment,
  deleteMessagesTaskAttachment,
  createTasks,
  updateTasks,
  deleteTasks,
  hydrateTask,
  updateTask,
  updateTaskAddMessage,
  updateTaskAddSubtask,
  updateTaskDeleteSubtask,
  updateTaskUpdateSubtask,
  hydrateTaskMessages,
} from '../../../../actions'
import DayPicker from 'react-day-picker'
import * as moment from 'moment'
import dayjs from 'dayjs'
import Keg from '@joduplessis/keg'
import UploadService from '../../../../services/upload.service'
import { EditorComponent } from '../../../../components/editor/editor.component'

class ModalComponent extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      id: props.taskId,
      deleteBar: false,
      description: '',
      sectionId: '',
      dueDate: null,
      dueDatePretty: '',
      userPopup: false,
      user: null,
      messages: [],
      loading: true,
      error: null,
      notification: null,
      dueDatePopup: false,
      channelPopup: false,
      sectionPopup: false,
      section: {},
      parent: null,
      tasks: [],
      page: 0,
      ready: true,
      compose: false,
      title: '',
    }

    this.composeRef = React.createRef()

    this.fetchTask = this.fetchTask.bind(this)
    this.shareToChannel = this.shareToChannel.bind(this)
    this.handleDeleteTask = this.handleDeleteTask.bind(this)
    this.handleUpdateTask = this.handleUpdateTask.bind(this)
    this.handleUpdateTaskUser = this.handleUpdateTaskUser.bind(this)
    this.handleUpdateTaskDueDate = this.handleUpdateTaskDueDate.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleUpdateTaskDone = this.handleUpdateTaskDone.bind(this)
    this.handleCreateSubtask = this.handleCreateSubtask.bind(this)
    this.handleDeleteSubtask = this.handleDeleteSubtask.bind(this)
    this.handleUpdateSubtask = this.handleUpdateSubtask.bind(this)
    this.handleUpdateTaskOrder = this.handleUpdateTaskOrder.bind(this)
    this.handleCreateMessage = this.handleCreateMessage.bind(this)
    this.handleUpdateTaskChannel = this.handleUpdateTaskChannel.bind(this)
    this.handleUpdateTaskSection = this.handleUpdateTaskSection.bind(this)
    this.handleFetchMoreMessages = this.handleFetchMoreMessages.bind(this)

    this.renderToolbar = this.renderToolbar.bind(this)
    this.renderTitle = this.renderTitle.bind(this)
    this.renderDescription = this.renderDescription.bind(this)
    this.renderDelete = this.renderDelete.bind(this)
    this.renderNotifications = this.renderNotifications.bind(this)
    this.renderTasks = this.renderTasks.bind(this)
  }

  static getDerivedStateFromProps(props, state) {
    if (!props.task.id) return null
    if (!props.task.title) return null

    // Array is frozen from Redux:
    // https://stackoverflow.com/questions/53420055/error-while-sorting-array-of-objects-cannot-assign-to-read-only-property-2-of/53420326
    // This is the basic state
    return {
      section: props.channel.sections.filter(section => section.id == props.task.sectionId)[0],
      done: props.task.done,
      user: props.task.user || null,
      dueDate: props.task.dueDate ? moment(props.task.dueDate).toDate() : null,
      dueDatePretty: props.task.dueDate ? moment(props.task.dueDate).fromNow() : '',
      tasks: sortTasksByOrder(findChildTasks(props.task.id, [...props.task.tasks])),
      messages: props.task.messages,
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.task.id != prevProps.task.id) {
      this.fetchTask(this.props.task.id)
    }
  }

  async handleUpdateTaskUser(user) {
    try {
      const { id } = this.state
      const taskId = id
      const channelId = this.props.channel.id
      const task = { id, user }

      // Update the API
      await GraphqlService.getInstance().updateTask(id, {
        user: user ? user.id : null,
      })

      // Update our UI
      this.setState({ userPopup: false })

      // Update the task list
      this.props.updateTasks(channelId, task)
      this.props.updateTask(taskId, task, channelId)
    } catch (e) {
      logger(e)
    }
  }

  async handleUpdateTaskDueDate(date) {
    try {
      const { id } = this.state
      const taskId = id
      const dueDate = date
      const channelId = this.props.channel.id
      const task = { id, dueDate }

      // Update the API
      await GraphqlService.getInstance().updateTask(id, { dueDate })

      // Update our UI
      this.setState({ dueDatePopup: false })

      // Update the task list
      this.props.updateTasks(channelId, task)
      this.props.updateTask(taskId, task, channelId)
    } catch (e) {
      logger(e)
    }
  }

  async handleUpdateTaskSection(section) {
    try {
      const { id } = this.state
      const taskId = id
      const channelId = this.props.channel.id
      const sectionId = section.id
      const task = { sectionId }

      // Update the API only if it's a different channel
      await GraphqlService.getInstance().updateTask(taskId, task)

      // Update this modal
      this.props.updateTask(taskId, task, channelId)
      this.props.updateTasks(channelId, task)

      // Update the task list
      this.setState({ sectionPopup: false })
    } catch (e) {
      console.log(e)
      logger(e)
    }
  }

  async handleUpdateTaskChannel(channel) {
    try {
      const { id } = this.state
      const taskId = id
      const channelId = channel.id
      const currentChannelId = this.props.channel.id
      const task = { ...this.props.task, channel }

      // Update the API only if it's a different channel
      await GraphqlService.getInstance().updateTask(id, { channel: channelId })

      // Delete it from the list
      // But only if these don't match
      if (channelId != currentChannelId) this.props.deleteTasks(currentChannelId, taskId)

      // Creaete them in the other list
      // currentChannelId will be null if you're viewing the calendar / tasks page
      // So we NEED TO RECREATE THE task in the list
      if (!currentChannelId) this.props.createTasks(channelId, task)

      // Update this modal
      this.props.updateTask(taskId, task, channelId)

      // Update the task list
      this.setState({ channelPopup: false })
    } catch (e) {
      logger(e)
    }
  }

  async handleUpdateTaskDone(done) {
    try {
      const { id } = this.state
      const taskId = id
      const channelId = this.props.channel.id
      const task = { id, done }

      // Update the API
      await GraphqlService.getInstance().updateTask(id, { done })

      // Update the task list
      this.props.updateTasks(channelId, task)
      this.props.updateTask(taskId, task, channelId)
      this.props.updateMessagesTaskAttachment(channelId, taskId, task)
    } catch (e) {
      logger(e)
    }
  }

  async handleUpdateTask() {
    try {
      const { id, title, description } = this.state
      const channelId = this.props.channel.id
      const taskId = id
      const task = {
        id,
        title,
        description,
      }

      // Make the API call
      await GraphqlService.getInstance().updateTask(taskId, { title, description })

      // Update the task if it's been posted on a message
      this.props.updateTask(taskId, task, channelId)
      this.props.updateTasks(channelId, task)
      this.props.updateMessagesTaskAttachment(channelId, taskId, task)

      // Set the contents of the editor
      EventService.getInstance().emit(SET_EDITOR_CONTENT, description)
    } catch (e) {
      logger(e)
    }
  }

  async shareToChannel() {
    const taskId = this.state.id
    const body = `> Task details`
    const userName = this.props.user.name
    const userId = this.props.user.id
    const excerpt = userName.toString().split(' ')[0] + ': ' + body || body
    const teamId = this.props.team.id
    const channelId = this.props.channel.id
    const device = DEVICE
    const parentId = null
    const mentions = getMentions(body)
    const attachments = [
      {
        name: '',
        uri: taskId,
        preview: '',
        mime: MIME_TYPES.TASK,
        size: 0,
      },
    ]

    try {
      const { data } = await GraphqlService.getInstance().createChannelMessage({
        device,
        mentions,
        channel: channelId,
        user: userId,
        team: teamId,
        parent: parentId,
        body,
        excerpt,
        attachments,
      })

      // Catch it
      if (!data.createChannelMessage) {
        logger('data.createChannelMessage is null')
        return this.setState({ error: 'Could not create share' })
      }

      // The extra values are used for processing other info
      const channelMessage = {
        message: data.createChannelMessage,
        channelId,
        teamId,
      }

      // Create the message
      this.props.createMessages(channelId, channelMessage)
      this.props.updateChannel(channelId, { excerpt })
    } catch (e) {
      this.setState({ error: 'Error sharing task' })
    }
  }

  handleKeyDown(e) {
    // On enter
    if (e.keyCode == 13) {
      e.preventDefault()
      this.setState({ compose: false })
      this.handleUpdateTask()
    }
  }

  handleBlur(e) {
    this.setState({ compose: false })
    this.handleUpdateTask()
  }

  async handleCreateMessage(files, body) {
    try {
      const { id } = this.state
      const { user } = this.props
      const userId = user.id
      const channelId = this.props.channel.id
      const taskId = id

      // Add the message
      await GraphqlService.getInstance().createTaskMessage(taskId, body, userId, files)

      // Consturct this manually because the document is actually
      // Part of the TaskDocument - so we don't rely on the GQL resolvers
      // to construct the return document for us
      // ie: { new: true } <- won't work for MOngoose
      const createdAt = new Date()
      const message = { body, user, createdAt, files }

      // Add the new subtask to the store
      this.props.updateTaskAddMessage(taskId, message, channelId)
    } catch (e) {
      this.setState({ error: 'Error creating message' })
    }
  }

  async handleDeleteSubtask(taskId) {
    try {
      const currentTaskId = this.state.id
      const channelId = this.props.channel.id
      await GraphqlService.getInstance().deleteTask(taskId)

      // Delete it from here
      this.props.updateTaskDeleteSubtask(taskId, currentTaskId, channelId)

      // Delete it from the channel
      this.props.deleteMessagesTaskAttachment(channelId, taskId)

      // Delete it from the main task list
      this.props.deleteTasks(channelId, taskId)
    } catch (e) {
      this.setState({ error: 'Error deleting task' })
    }
  }

  async handleCreateSubtask({ title }) {
    if (title.trim() == '') return

    try {
      // To accommodate for "" as ID
      const channelId = this.props.channel.id
        ? this.props.channel.id
        : this.props.task.channel
        ? this.props.task.channel.id
        : null
      const taskId = this.state.id
      const teamId = this.props.team.id
      const userId = this.props.user.id
      const order = getHighestTaskOrder(this.props.task.tasks)
      const { data } = await GraphqlService.getInstance().createTask({
        channel: channelId,
        parent: taskId,
        title,
        order,
        user: userId,
        team: teamId,
      })
      const task = data.createTask

      // Stop the loading
      this.setState({ loading: false })

      // Add the new subtask to the store
      // this.props.updateTask(taskId, { tasks }, channelId)
      this.props.updateTaskAddSubtask(taskId, task, channelId)

      // Add it to the main list
      this.props.createTasks(channelId, task)
    } catch (e) {
      this.setState({ error: 'Error creating task' })
    }
  }

  async handleUpdateSubtask(task) {
    const { id, title } = task
    const taskId = id
    const channelId = this.props.channel.id

    try {
      // If the user is updating the task to nothing
      // Then delete it
      if (title == '') {
        this.handleDeleteSubtask(taskId)
      } else {
        // Update the API
        await GraphqlService.getInstance().updateTask(taskId, task)

        // Update the task
        this.props.updateTaskUpdateSubtask(taskId, task, channelId)

        // Update the task if it's been posted on a message
        this.props.updateTasks(channelId, task)
        this.props.updateMessagesTaskAttachment(channelId, taskId, task)
      }
    } catch (e) {
      this.setState({ error: 'Error udpating task' })
    }
  }

  async handleUpdateTaskOrder({ id, parent, order }) {
    try {
      // Get the task
      const taskId = id
      const task = this.props.task.tasks.filter(task => task.id == taskId)[0]
      const parentId = parent
      const channelId = this.props.channel.id

      // Update the order
      await GraphqlService.getInstance().updateTask(taskId, { order, parent })

      // Update the order on our store (so it reflects)
      // We don't use the parent object anymore here
      // This is taken from the tasks extension
      this.props.updateTasks(channelId, { ...task, parentId, order })
      this.props.updateTaskUpdateSubtask(taskId, { ...task, order, parentId }, channelId)
    } catch (e) {
      logger(e)
    }
  }

  async handleDeleteTask() {
    try {
      const taskId = this.state.id
      const channelId = this.props.channel.id

      // Delete it from the API
      await GraphqlService.getInstance().deleteTask(taskId)

      // Delete it
      this.props.deleteMessagesTaskAttachment(channelId, taskId)
      this.props.deleteTasks(channelId, taskId)

      // Close the modal
      this.props.hydrateTask({ id: null })

      // Remove the task
      this.setState({ loading: false, deleteBar: false })
    } catch (e) {
      this.setState({ error: 'Error deleting task' })
    }
  }

  componentDidMount() {
    const { taskId } = this.props

    this.fetchTask(taskId)
  }

  async fetchTask(taskId) {
    try {
      const { data } = await GraphqlService.getInstance().task(taskId)
      const {
        task: { id, description, title, done, dueDate, tasks, messages, user, channel, parent, sectionId },
      } = data

      // Set up the local state to use
      this.setState({ id, description, title, loading: false })

      // Update the Redux store
      this.props.hydrateTask({
        sectionId,
        id,
        description,
        title,
        done,
        dueDate,
        tasks,
        messages: sortMessagesByCreatedAt(messages),
        channel,
        parent,
        user,
      })
    } catch (e) {
      this.setState({
        error: 'Error fetching task',
        loading: false,
      })
    }
  }

  async handleFetchMoreMessages() {
    try {
      if (!this.state.ready) return
      this.setState({ ready: false, loading: true }, async () => {
        const taskId = this.props.task.id
        const page = this.state.page + 1
        const {
          data: { taskMessages },
        } = await GraphqlService.getInstance().taskMessages(taskId)
        this.props.hydrateTaskMessages(taskMessages)
        this.setState({ page, ready: true, loading: false })
      })
    } catch (e) {
      this.setState({
        ready: true,
        loading: false,
        error: 'Error fetching task messages',
      })
    }
  }

  renderNotifications() {
    return (
      <React.Fragment>
        {this.state.error && <Error message={this.state.error} onDismiss={() => this.setState({ error: null })} />}
        {this.state.loading && <Spinner />}
        {this.state.notification && (
          <Notification text={this.state.notification} onDismiss={() => this.setState({ notification: null })} />
        )}
      </React.Fragment>
    )
  }

  renderToolbar() {
    // Set up the inital user
    // Which in this case is THIS user
    // So add the (You) part
    const initialUser = { ...this.props.user, name: 'Assign to me' }
    const dateClasses = classNames({
      date: true,
      overdue: dayjs().isAfter(this.state.dueDate),
    })

    return (
      <div className="task-modal-toolbar">
        <CheckboxComponent done={this.state.done} onClick={() => this.handleUpdateTaskDone(!this.state.done)} />

        <div style={{ width: 20 }} />

        <QuickUserComponent
          userId={this.props.user.id}
          teamId={this.props.team.id}
          stickyUser={initialUser}
          visible={this.state.userPopup}
          width={250}
          direction="left-bottom"
          handleDismiss={() => this.setState({ userPopup: false })}
          handleAccept={member => this.handleUpdateTaskUser(member.user)}
        >
          <div className="row showclearonhover">
            {this.state.user && (
              <div className="clear assigned" onClick={() => this.handleUpdateTaskUser(null)}>
                <IconComponent icon="x" color="#ec224b" size="12" />
              </div>
            )}

            <div className="icon" onClick={() => this.setState({ userPopup: true })}>
              {!this.state.user && (
                <React.Fragment>
                  <IconComponent icon="profile" color="#524150" size="20" />
                  <div className="user">Unassigned</div>
                </React.Fragment>
              )}

              {this.state.user && (
                <div className="assigned-member">
                  <Avatar
                    size="small-medium"
                    image={this.state.user.image}
                    title={this.state.user.name}
                    className="mb-5 mr-5"
                  />
                  <div className="user">
                    {this.state.user.id == this.props.user.id ? this.props.user.name + ' (you)' : this.state.user.name}
                  </div>
                </div>
              )}
            </div>
          </div>
        </QuickUserComponent>

        <div className="flexer" />

        {!!this.props.channel.id && (
          <Popup
            handleDismiss={() => this.setState({ sectionPopup: false })}
            visible={this.state.sectionPopup}
            width={250}
            direction="right-bottom"
            content={
              <Menu
                items={this.props.channel.sections.map(section => {
                  return {
                    text: section.title,
                    onClick: e => this.handleUpdateTaskSection(section),
                  }
                })}
              />
            }
          >
            <div className="channel-name" onClick={() => this.setState({ sectionPopup: true })}>
              {this.state.section ? this.state.section.title : 'No section'}
            </div>
          </Popup>
        )}

        <Popup
          handleDismiss={() => this.setState({ channelPopup: false })}
          visible={this.state.channelPopup}
          width={250}
          direction="right-bottom"
          content={
            <Menu
              items={this.props.channels.map(channel => {
                const channelName = channel.otherUser
                  ? channel.otherUser.name
                    ? channel.otherUser.name
                    : channel.name
                  : channel.name
                return {
                  text: `${channelName} ${channel.id == this.props.channel.id ? '(this channel)' : ''}`,
                  onClick: e => this.handleUpdateTaskChannel(channel),
                }
              })}
            />
          }
        >
          <div className="channel-name" onClick={() => this.setState({ channelPopup: true })}>
            {!this.props.task.channel && <span>No channel</span>}
            {!!this.props.task.channel && (
              <React.Fragment>
                <IconComponent icon="hash" color="#adb5bd" size="12" className="mr-5" />
                <span>{this.props.task.channel.name}</span>
              </React.Fragment>
            )}
          </div>
        </Popup>

        <div className="row showclearonhover">
          {this.state.dueDate && (
            <div className="clear" onClick={() => this.handleUpdateTaskDueDate(null)}>
              <IconComponent icon="x" color="#ec224b" size="12" />
            </div>
          )}

          <Popup
            handleDismiss={() => this.setState({ dueDatePopup: false })}
            visible={this.state.dueDatePopup}
            width={250}
            direction="right-bottom"
            content={
              <DayPicker
                selectedDays={this.state.dueDate}
                onDayClick={date => this.handleUpdateTaskDueDate(moment(date).toDate())}
              />
            }
          >
            <div className="icon">
              <div className={dateClasses} onClick={() => this.setState({ dueDatePopup: true })}>
                {!!this.state.dueDatePretty ? this.state.dueDatePretty : 'No date'}
              </div>
              <IconComponent
                icon="calendar"
                color="#524150"
                size="18"
                onClick={() => this.setState({ dueDatePopup: true })}
              />
            </div>
          </Popup>
        </div>

        <div className="icon" onClick={this.shareToChannel}>
          <IconComponent icon="share" color="#524150" size="18" />
        </div>

        <div className="icon" onClick={() => this.setState({ deleteBar: true })}>
          <IconComponent icon="delete" color="#524150" size="18" />
        </div>
      </div>
    )
  }

  renderDelete() {
    if (!this.state.deleteBar) return null

    return (
      <div className="delete-bar">
        <div className="text">Are you sure? This cannot be undone.</div>
        <Button text="No" size="small" theme="red" onClick={() => this.setState({ deleteBar: false })} />
        <Button text="Yes" size="small" theme="red" onClick={() => this.handleDeleteTask()} className="ml-5" />
      </div>
    )
  }

  renderTitle() {
    const composeClasses = classNames({
      title: true,
      hide: this.state.compose,
    })
    const titleClasses = classNames({
      title: true,
      hide: !this.state.compose,
    })

    return (
      <React.Fragment>
        {!!this.props.task.parent && (
          <div className="subtitle" onClick={() => this.fetchTask(this.props.task.parent.id)}>
            {this.props.task.parent.title}
          </div>
        )}

        {/* Editing */}
        <div className={composeClasses}>
          <TextareaComponent
            ref={ref => (this.composeRef = ref)}
            onBlur={this.handleBlur}
            onKeyDown={this.handleKeyDown}
            placeholder="Task title"
            value={this.state.title}
            onChange={e => this.setState({ title: e.target.value })}
          />
        </div>

        {/* Viewing */}
        <div
          className={titleClasses}
          onClick={() => {
            // Update the editable title
            this.setState({
              title: this.props.task.title,
              compose: true,
            })

            // Select the textarea
            this.composeRef.select()
          }}
        >
          <div className="title-text">{this.props.task.title}</div>
        </div>
      </React.Fragment>
    )
  }

  renderDescription() {
    return (
      <div className="description">
        <div className="heading row">
          <IconComponent icon="align-left" color="#adb5bd" size="14" onClick={this.props.onClose} />

          <div className="flexer" />
        </div>

        <div className="editor">
          <EditorComponent
            editorId="task-modal"
            initialValue={this.state.description}
            submit="Save"
            hidden={['attachments']}
            emojiDirection="right-bottom"
            channelId={this.props.channel.id}
            onSubmit={({ html, markdown, attachments }) => {
              // We ignore the attachments object here
              // Because we don't use it
              this.setState({ description: html }, () => {
                this.handleUpdateTask()
              })
            }}
            onBlur={({ html, markdown, attachments }) => {
              // We ignore the attachments object here
              // Because we don't use it
              this.setState({ description: html }, () => {
                this.handleUpdateTask()
              })
            }}
          />
        </div>
      </div>
    )
  }

  renderTasks() {
    return (
      <div className="modal-tasks">
        <TasksComponent
          hideChildren={true}
          tasks={this.state.tasks}
          masterTaskList={this.props.task.tasks || []}
          createTask={this.handleCreateSubtask}
          deleteTask={this.handleDeleteSubtask}
          updateTask={this.handleUpdateSubtask}
          updateTaskOrder={this.handleUpdateTaskOrder}
          shareToChannel={() => console.log('NOPE')}
          disableTools={false}
          displayChannelName={false}
        />
      </div>
    )
  }

  render() {
    return (
      <ModalPortal>
        <Modal
          title={null}
          width="80%"
          height="95%"
          toolbar={this.renderToolbar()}
          onClose={() => this.props.hydrateTask({ id: null })}
        >
          {this.renderNotifications()}

          <div className="task-modal-container">
            {this.renderDelete()}

            <div className="panels">
              <div className="panel">
                <div className="content">
                  {this.renderTitle()}
                  {this.renderDescription()}
                  {this.renderTasks()}
                </div>
              </div>
              <div className="panel">
                <MessagesComponent
                  messages={this.state.messages}
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
  user: PropTypes.any,
  channel: PropTypes.any,
  channels: PropTypes.any,
  team: PropTypes.any,
  onClose: PropTypes.func,
  updateChannel: PropTypes.func,
  updateMessagesTaskAttachment: PropTypes.func,
  deleteMessagesTaskAttachment: PropTypes.func,
  createMessages: PropTypes.func,
  createTasks: PropTypes.func,
  updateTasks: PropTypes.func,
  deleteTasks: PropTypes.func,
  hydrateTask: PropTypes.func,
  updateTask: PropTypes.func,
  updateTaskAddMessage: PropTypes.func,
  updateTaskAddSubtask: PropTypes.func,
  updateTaskDeleteSubtask: PropTypes.func,
  updateTaskUpdateSubtask: PropTypes.func,
  hydrateTaskMessages: PropTypes.func,
}

const mapDispatchToProps = {
  hydrateTask: task => hydrateTask(task),
  hydrateTaskMessages: messages => hydrateTaskMessages(messages),
  updateTaskAddMessage: (taskId, message, channelId) => updateTaskAddMessage(taskId, message, channelId),
  createMessages: (channelId, channelMessage) => createMessages(channelId, channelMessage),
  updateChannel: (channelId, channel) => updateChannel(channelId, channel),
  updateMessagesTaskAttachment: (channelId, taskId, channelMessageTaskAttachment) =>
    updateMessagesTaskAttachment(channelId, taskId, channelMessageTaskAttachment),
  deleteMessagesTaskAttachment: (channelId, taskId) => deleteMessagesTaskAttachment(channelId, taskId),
  updateTask: (taskId, updatedTask, channelId) => updateTask(taskId, updatedTask, channelId),
  createTasks: (channelId, task) => createTasks(channelId, task),
  updateTasks: (channelId, task) => updateTasks(channelId, task),
  deleteTasks: (channelId, taskId) => deleteTasks(channelId, taskId),
  updateTaskAddSubtask: (taskId, task, channelId) => updateTaskAddSubtask(taskId, task, channelId),
  updateTaskDeleteSubtask: (taskId, currentTaskId, channelId) =>
    updateTaskDeleteSubtask(taskId, currentTaskId, channelId),
  updateTaskUpdateSubtask: (taskId, task, channelId) => updateTaskUpdateSubtask(taskId, task, channelId),
}

const mapStateToProps = state => {
  return {
    user: state.user,
    channel: state.channel,
    channels: state.channels,
    team: state.team,
    task: state.task,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModalComponent)
