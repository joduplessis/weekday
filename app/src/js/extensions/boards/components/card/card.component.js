import React from 'react'
import { connect } from 'react-redux'
import './card.component.css'
import PropTypes from 'prop-types'
import { Avatar } from '../../../../elements'
import { hydrateTasks, hydrateTask, updateTasks, createTasks } from '../../../../actions'
import arrayMove from 'array-move'
import { WEEKDAY_DRAGGED_TASK_ID } from '../../../../constants'
import {
  isTaskHeading,
  classNames,
  logger,
  deleteDraggableElement,
  createDraggableElement,
} from '../../../../helpers/util'
import { CheckboxComponent } from '../../../tasks/components/checkbox/checkbox.component'
import { TextareaComponent } from '../../../../components/textarea.component'
import * as moment from 'moment'
import dayjs from 'dayjs'
import GraphqlService from '../../../../services/graphql.service'

class CardComponent extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      compose: '',
      ontop: false,
      under: false,
      over: false,
      dueDatePretty: '',
    }

    this.handleKeyDown = this.handleKeyDown.bind(this)

    this.handleDrag = this.handleDrag.bind(this)
    this.handleDragLeave = this.handleDragLeave.bind(this)
    this.handleDrop = this.handleDrop.bind(this)
    this.handleDragOver = this.handleDragOver.bind(this)
    this.draggableIsCard = this.draggableIsCard.bind(this)
    this.handleDragStart = this.handleDragStart.bind(this)
    this.handleDragEnd = this.handleDragEnd.bind(this)
    this.handleUpdateTaskDone = this.handleUpdateTaskDone.bind(this)
    this.handleCreateTask = this.handleCreateTask.bind(this)
  }

  async handleCreateTask() {
    if (this.state.compose.trim() == '') return

    try {
      const { compose } = this.state
      const { channelId, teamId, highestOrder, sectionId } = this.props
      const userId = this.props.user.id
      const { data } = await GraphqlService.getInstance().createTask({
        channel: channelId,
        title: compose,
        order: highestOrder,
        user: userId,
        team: teamId,
        sectionId,
      })

      // Stop the loading
      this.setState({ compose: '' })

      // Add it ot he store
      this.props.createTasks(channelId, data.createTask)
    } catch (e) {
      console.log(e)
      logger(e)
    }
  }

  async handleUpdateTaskDone() {
    try {
      const { id } = this.props
      const done = !this.props.done
      const channelId = this.props.channelId

      // Update the task if it's been posted on a message
      this.props.updateTasks(channelId, { id, done })

      // OPTIMISTIC UPDATES
      await GraphqlService.getInstance().updateTask(id, { done })
    } catch (e) {
      console.log(e)
      logger(e)
    }
  }

  static getDerivedStateFromProps(props, state) {
    return {
      dueDatePretty: props.dueDate ? moment(props.dueDate).fromNow() : '',
    }
  }

  handleDragEnd(e) {
    e.stopPropagation()
    e.preventDefault()
    if (!this.draggableIsCard()) return
    this.setState({ over: false })
    window[WEEKDAY_DRAGGED_TASK_ID] = null
    deleteDraggableElement(this.props.id)
  }

  handleDragStart(e) {
    e.stopPropagation()

    window[WEEKDAY_DRAGGED_TASK_ID] = this.props.id

    // Create teh draggable element
    createDraggableElement(e, this.props.id)
  }

  draggableIsCard() {
    return window[WEEKDAY_DRAGGED_TASK_ID] !== null && window[WEEKDAY_DRAGGED_TASK_ID] !== undefined
  }

  handleKeyDown(e) {
    // On enter
    if (e.keyCode == 13) {
      e.preventDefault()
      this.handleCreateTask()
      this.setState({ compose: '' })
    }
  }

  handleDragLeave(e) {
    e.stopPropagation()
    e.preventDefault()
    if (!this.draggableIsCard()) return
    this.setState({ over: false })
  }

  handleDragOver(e) {
    e.stopPropagation()
    e.preventDefault()
    if (!this.draggableIsCard()) return
    this.setState({ over: true })
  }

  handleDrop(e) {
    e.stopPropagation()
    e.preventDefault()
    if (!this.draggableIsCard()) return

    const draggedTaskId = window[WEEKDAY_DRAGGED_TASK_ID]
    const taskIdDraggedOnto = this.props.id

    this.setState({ over: false })
    this.props.handleUpdateTaskOrder(draggedTaskId, taskIdDraggedOnto)

    window[WEEKDAY_DRAGGED_TASK_ID] = null
  }

  handleDrag(e) {
    e.stopPropagation()
    e.preventDefault()
  }

  render() {
    const columnCardClasses = classNames({
      'column-card': true,
      'dragged-card': window[WEEKDAY_DRAGGED_TASK_ID] == this.props.id,
    })
    const cardDropClasses = classNames({
      'card-drop': true,
      'over': this.state.over,
    })
    const titleClasses = classNames({
      'card-title': true,
      'heading': isTaskHeading(this.props.title),
    })

    return (
      <div
        id={this.props.id}
        onDragStart={this.handleDragStart}
        onDrop={this.handleDrop}
        onDrag={this.handleDrag}
        onDragLeave={this.handleDragLeave}
        onDragOver={this.handleDragOver}
        onDragEnd={this.handleDragEnd}
        draggable={!this.props.new}
        className={columnCardClasses}
      >
        <div className={cardDropClasses}>
          <div className="card-drop-inner"></div>
        </div>

        {!this.props.new && (
          <div className="card-container">
            <div className="inner">
              <CheckboxComponent done={this.props.done} onClick={this.handleUpdateTaskDone} />
              {!!this.props.user && (
                <div className="card-avatar">
                  <Avatar size="x-small" image={this.props.user.image} title={this.props.user.name} />
                </div>
              )}
              <div className="card-details">
                <div className={titleClasses} onClick={() => this.props.hydrateTask({ id: this.props.id })}>
                  {this.props.title}
                </div>
                {/* 
                Debugging
                <div>{this.props.id}</div>
                <div>{this.props.order}</div> 
                */}
                {!!this.state.dueDatePretty && <div className="card-duedate">{this.state.dueDatePretty}</div>}
              </div>
            </div>
          </div>
        )}

        {this.props.new && (
          <div className="card-container-new">
            <TextareaComponent
              value={this.state.compose}
              onChange={e => this.setState({ compose: e.target.value })}
              placeholder="Create new task"
              onKeyDown={this.handleKeyDown}
            />
          </div>
        )}
      </div>
    )
  }
}

CardComponent.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  user: PropTypes.any,
  order: PropTypes.number,
  dueDate: PropTypes.any,
  hydrateTask: PropTypes.func,
  updateTasks: PropTypes.func,
  createTasks: PropTypes.func,
  done: PropTypes.bool,
  highestOrder: PropTypes.number,
  sectionId: PropTypes.string,
  channelId: PropTypes.string,
  teamId: PropTypes.string,
  handleUpdateTaskOrder: PropTypes.func,
}

const mapDispatchToProps = {
  hydrateTask: task => hydrateTask(task),
  updateTasks: (channelId, task) => updateTasks(channelId, task),
  createTasks: (channelId, task) => createTasks(channelId, task),
}

const mapStateToProps = state => {
  return {
    user: state.user,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CardComponent)
