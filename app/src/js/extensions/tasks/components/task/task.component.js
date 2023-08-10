import React from 'react'
import { connect } from 'react-redux'
import './task.component.css'
import { Popup, Menu, Avatar } from '../../../../elements'
import { IconComponent } from '../../../../components/icon.component'
import PropTypes from 'prop-types'
import ConfirmModal from '../../../../modals/confirm.modal'
import { logger } from '../../../../helpers/util'
import GraphqlService from '../../../../services/graphql.service'
import { CheckboxComponent } from '../checkbox/checkbox.component'
import { classNames, isTaskHeading } from '../../../../helpers/util'
import marked from 'marked'
import { hydrateTask, updateTasks } from '../../../../actions'
import QuickUserComponent from '../../../../components/quick-user.component'
import DayPicker from 'react-day-picker'
import * as moment from 'moment'
import dayjs from 'dayjs'
import EventService from '../../../../services/event.service'
import { TASK_ORDER_INDEX, TASKS_ORDER, DEVICE, MIME_TYPES, TASK_DRAGSTART_RESET_CHEVRON } from '../../../../constants'

class TaskComponent extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      id: props.id,
      done: props.done,
      title: props.title,
      user: props.assignedUser, // Because props.user is the redux store
      dueDate: props.dueDate,
      dueDatePretty: props.dueDate ? moment(props.dueDate).fromNow() : '',
      heading: isTaskHeading(props.title),
      text: props.new ? '' : props.title,
      new: props.new,
      menu: false,
      deleteModal: false,
      over: false,
      compose: false,
      childTasksHidden: true,
      userPopup: false,
      dueDatePopup: false,
    }

    this.composeRef = React.createRef()

    this.handleDoneIconClick = this.handleDoneIconClick.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.insertAtCursor = this.insertAtCursor.bind(this)
    this.handleComposeChange = this.handleComposeChange.bind(this)
    this.updateOrCreateTask = this.updateOrCreateTask.bind(this)
    this.adjustHeight = this.adjustHeight.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
    this.handleUpdateTaskUser = this.handleUpdateTaskUser.bind(this)
    this.handleUpdateTaskDueDate = this.handleUpdateTaskDueDate.bind(this)
    this.updateDraggable = this.updateDraggable.bind(this)
    this.handlePaste = this.handlePaste.bind(this)
  }

  handlePaste(e) {
    setTimeout(() => {
      // Split the text field by new line characters
      // And check it's valid - then crate tasks
      const titles = this.state.text.split('\n').filter(title => !!title)

      // Only if there are more than 1 titles
      if (titles.length > 1) titles.map(title => this.props.createTask({ title }))

      // And then rset the text input
      this.setState({ text: '' })
    }, 100)
  }

  updateDraggable(draggable) {
    if (this.props.updateDraggable) this.props.updateDraggable(draggable)
  }

  async handleUpdateTaskUser(user) {
    try {
      const { id } = this.state
      const channelId = this.props.channel.id
      const task = { id, user }

      // Update the API
      await GraphqlService.getInstance().updateTask(id, {
        user: user ? user.id : null,
      })

      // Update our UI
      this.setState({ user, userPopup: false })

      // Update the task list
      this.props.updateTasks(channelId, task)
    } catch (e) {
      console.log(e)
      logger(e)
    }
  }

  async handleUpdateTaskDueDate(date) {
    try {
      const { id, title } = this.state
      const dueDate = date
      const channelId = this.props.channel.id
      const task = { id, dueDate }

      // OPTIMISTIC UPDATES
      // Update our UI
      this.setState({
        dueDate: date,
        dueDatePretty: date ? moment(date).fromNow() : null,
        dueDatePopup: false,
      })

      // Update the task list
      this.props.updateTasks(channelId, task)

      // Update the API
      await GraphqlService.getInstance().updateTask(id, { dueDate })
    } catch (e) {
      console.log(e)
      logger(e)
    }
  }

  static getDerivedStateFromProps(props, state) {
    let updatedState = {
      id: props.id,
      user: props.assignedUser,
      dueDate: props.dueDate ? moment(props.dueDate).toDate() : null,
      dueDatePretty: props.dueDate ? moment(props.dueDate).fromNow() : '',
      heading: isTaskHeading(props.title),
    }

    // If the title gets changed from the modal
    // if (props.title != state.text) updatedState['text'] = props.title

    return updatedState
  }

  insertAtCursor(text) {
    const { selectionStart } = this.composeRef
    const updatedText = [this.state.text.slice(0, selectionStart), text, this.state.text.slice(selectionStart)].join('')

    // Update the text & clos the menu
    // If it was an emoji, close it
    this.setState({ text: updatedText }, () => {
      this.composeRef.focus()
    })
  }

  updateOrCreateTask() {
    const { id, done, text } = this.state

    if (this.state.new) {
      this.props.createTask({ title: this.state.text })

      // Reset these
      this.setState({
        compose: false,
        text: '',
        description: '',
      })
    } else {
      this.props.updateTask({
        id,
        done,
        title: text,
      })

      // Update the task here
      this.setState({
        text,
        done,
        compose: false,
      })
    }
  }

  handleBlur(e) {
    this.setState({
      compose: false,
      text: this.state.title,
    })
    this.updateOrCreateTask()
    this.updateDraggable(true)
  }

  // Fires 1st
  handleKeyDown(e) {
    const { keyCode } = e

    // Enter
    if (keyCode == 13) {
      e.preventDefault()
      this.updateOrCreateTask()
      this.updateDraggable(true)
    }

    // Escape
    if (keyCode == 27 && this.state.compose) {
      this.setState({ compose: false, text: this.state.title })
      this.updateDraggable(true)
    }
  }

  // Fires 2nd
  handleComposeChange(e) {
    const text = e.target.value

    this.setState({ text })
  }

  // Handle the shift being released
  handleKeyUp(e) {}

  componentDidUpdate(prevProps) {
    if (prevProps.title != this.props.title) this.setState({ title: this.props.title, text: this.props.title })
    if (prevProps.done != this.props.done) this.setState({ done: this.props.done })
  }

  componentDidMount() {
    EventService.getInstance().on(TASK_DRAGSTART_RESET_CHEVRON, () => this.setState({ childTasksHidden: false }))
  }

  handleDoneIconClick() {
    if (this.state.new) {
      // Create a new task - do nothing here
    } else {
      this.setState({ done: !this.state.done }, () => this.updateOrCreateTask())
    }
  }

  adjustHeight() {
    if (this.composeRef) {
      if (this.composeRef.style) {
        this.composeRef.style.height = '1px'
        this.composeRef.style.height = this.composeRef.scrollHeight + 'px'
      }
    }
  }

  render() {
    const initialUser = { ...this.props.user, name: 'Assign to me' }
    const { id, over, heading, deleteModal, compose, done, user, dueDate } = this.state
    const { description, title } = this.props
    const newTask = this.state.new
    const classes = classNames({
      'tasks-extension-li': true,
      done,
    })
    const containerClasses = classNames({
      row: true,
      task: true,
      hide: (done && !this.props.showCompletedTasks) || this.props.hide,
      done: done,
      heading,
    })
    const titleTextareaClasses = classNames({
      'task-title': true,
      heading,
    })
    const titleClasses = classNames({
      'flexer': true,
      'button': true,
      'task-title': true,
      heading,
    })
    const textareaClasses = classNames({
      row: true,
      flexer: true,
      hide: compose || newTask ? false : true,
    })
    const dueDateClasses = classNames({
      'due-date': true,
      'overdue': dayjs().isAfter(dueDate),
    })

    // Do this every render
    this.adjustHeight()

    return (
      <div className={classes}>
        {deleteModal && (
          <ConfirmModal
            onOkay={() => {
              this.props.deleteTask(id)
              this.setState({ deleteModal: false })
            }}
            onCancel={() => this.setState({ deleteModal: false })}
            text="Are you sure you want to delete this task, it can not be undone?"
            title="Are you sure?"
          />
        )}
        <div
          className={containerClasses}
          onMouseEnter={() => this.setState({ over: true })}
          onMouseLeave={() => {
            this.setState({
              over: false,
              menu: false,
              userPopup: false,
              dueDatePopup: false,
            })
          }}
        >
          {!newTask && !heading && <CheckboxComponent done={done} onClick={() => this.handleDoneIconClick()} />}
          {newTask && <div style={{ width: 30 }} />}
          {heading && <div style={{ width: 20 }} />}
          {!newTask && !heading && <div style={{ width: 10 }} />}

          {!!this.props.subtaskCount && (
            <div
              className="children-hide-icon"
              onClick={() => {
                const childTasksHidden = !this.state.childTasksHidden
                this.setState({ childTasksHidden })
                this.props.toggleTasksBelowHeadings()
              }}
            >
              <IconComponent
                icon={this.state.childTasksHidden ? 'chevron-right' : 'chevron-down'}
                color="#11171d"
                size={14}
                className="button"
              />
            </div>
          )}

          <div className={textareaClasses}>
            <textarea
              placeholder="Add task title & press enter. End the title with ':' for headings."
              value={this.state.text}
              className={titleTextareaClasses}
              onKeyUp={this.handleKeyUp}
              onKeyDown={this.handleKeyDown}
              onChange={this.handleComposeChange}
              onBlur={this.handleBlur}
              onPaste={this.handlePaste}
              ref={ref => (this.composeRef = ref)}
            />
          </div>

          {!compose && !newTask && (
            <div
              className={titleClasses}
              onClick={() => {
                this.setState({ compose: true }, () => {
                  this.adjustHeight()
                  this.updateDraggable(false)
                })
              }}
            >
              {title}
            </div>
          )}

          {!!this.props.subtaskCount && (
            <div className="subtask-count">
              <IconComponent icon="check" color="#adb5bd" size={13} />
              <IconComponent icon="check" color="#adb5bd" size={13} style={{ position: 'relative', left: -8 }} />
              <div className="text">{this.props.subtaskCount}</div>
            </div>
          )}

          {this.props.displayChannelName && (
            <div className="channel-name">{this.props.assignedChannel ? this.props.assignedChannel.name : ''}</div>
          )}

          {/* These are the hovers that happen for the task tools */}
          {/* Don't display them for headings or when they are disbales (inside task modal) */}
          {!heading && !this.props.disableTools && (
            <React.Fragment>
              <div className={dueDateClasses}>{this.state.dueDatePretty}</div>

              {/* Calendar that lets the user select a date */}
              <div className="icon-container">
                {((over && !newTask) || !!this.state.dueDatePretty) && (
                  <Popup
                    handleDismiss={() => this.setState({ dueDatePopup: false })}
                    visible={this.state.dueDatePopup}
                    width={250}
                    direction="right-bottom"
                    content={
                      <DayPicker
                        selectedDays={dueDate}
                        onDayClick={date => this.handleUpdateTaskDueDate(moment(date).toDate())}
                      />
                    }
                  >
                    <IconComponent
                      icon="calendar"
                      color="#CFD4D9"
                      size={15}
                      className="button"
                      onClick={() => this.setState({ dueDatePopup: true })}
                    />
                  </Popup>
                )}
              </div>

              {/* This is the user popup that displays when you click */}
              {/* on the icon or avatar */}
              <QuickUserComponent
                userId={this.props.user.id}
                teamId={this.props.team.id}
                stickyUser={initialUser}
                visible={this.state.userPopup}
                width={250}
                direction="right-bottom"
                handleDismiss={() => this.setState({ userPopup: false })}
                handleAccept={member => this.handleUpdateTaskUser(member.user)}
              >
                <div className="icon-container" onClick={e => this.setState({ userPopup: true })}>
                  {!newTask && !!user && (
                    <Avatar size="x-small" image={user.image} title={user.name} className="mb-5 mr-5" />
                  )}

                  {over && !newTask && !user && (
                    <IconComponent icon="profile" color="#CFD4D9" size={15} className="button" />
                  )}
                </div>
              </QuickUserComponent>

              {/* Always display when there is a description */}
              <div className="icon-container">
                {((over && !newTask) || !!description) && (
                  <IconComponent
                    icon={!!description ? 'file-text' : 'file'}
                    color="#CFD4D9"
                    size={13}
                    className="button"
                    onClick={e => {
                      //this.setState({ showDescription: !this.state.showDescription })
                      this.props.hydrateTask({ id: this.props.id })
                    }}
                  />
                )}
              </div>

              {/* Opens the modal */}
              <div className="icon-container">
                {over && !newTask && (
                  <IconComponent
                    icon="pen"
                    color="#CFD4D9"
                    size={13}
                    className="button"
                    onClick={e => this.props.hydrateTask({ id: this.props.id })}
                  />
                )}
              </div>

              <div className="icon-container">
                {over && !newTask && (
                  <Popup
                    handleDismiss={() => this.setState({ menu: false })}
                    visible={this.state.menu}
                    width={200}
                    direction="right-bottom"
                    content={
                      <Menu
                        items={[
                          {
                            text: 'Delete',
                            onClick: e => this.setState({ deleteModal: true }),
                          },
                          {
                            text: 'Share to channel',
                            onClick: e => this.props.shareToChannel(id),
                          },
                        ]}
                      />
                    }
                  >
                    <IconComponent
                      className="button hide"
                      icon="more-h"
                      color="#CFD4D9"
                      size={15}
                      onClick={e => {
                        e.stopPropagation()
                        this.setState({ menu: true })
                      }}
                    />
                  </Popup>
                )}
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    )
  }
}

TaskComponent.propTypes = {
  title: PropTypes.string,
  id: PropTypes.string,
  done: PropTypes.bool,
  hide: PropTypes.bool,
  level: PropTypes.bool,
  disableTools: PropTypes.bool,
  new: PropTypes.bool,
  createTask: PropTypes.func,
  deleteTask: PropTypes.func,
  updateTask: PropTypes.func,
  user: PropTypes.any,
  dueDate: PropTypes.any,
  showCompletedTasks: PropTypes.bool,
  shareToChannel: PropTypes.func,
  toggleTasksBelowHeadings: PropTypes.func,
  hydrateTask: PropTypes.func,
  user: PropTypes.any,
  team: PropTypes.any,
  task: PropTypes.any,
  channel: PropTypes.any,
  updateTasks: PropTypes.func,
  updateDraggable: PropTypes.func,
  displayChannelName: PropTypes.bool,
  assignedChannel: PropTypes.any,
  subtaskCount: PropTypes.number,
}

const mapDispatchToProps = {
  hydrateTask: task => hydrateTask(task),
  updateTasks: (channelId, task) => updateTasks(channelId, task),
}

const mapStateToProps = state => {
  return {
    task: state.task,
    user: state.user,
    team: state.team,
    channel: state.channel,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskComponent)
