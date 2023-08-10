import './tasks.component.css'
import { useSelector, useDispatch, ReactReduxContext } from 'react-redux'
import React, { useState, useEffect, useRef, memo } from 'react'
import { Avatar, Tooltip, Button, Input, Spinner, Error, Notification, Popup, Menu } from '../../../../elements'
import TaskComponent from '../task/task.component'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import {
  sortTasksByDueDate,
  classNames,
  isTaskHeading,
  getNextTaskOrder,
  getHighestTaskOrder,
  getPreviousTaskOrder,
} from '../../../../helpers/util'
import EventService from '../../../../services/event.service'
import { MOMENT_TODAY, ONTOP, OVER, UNDER, WEEKDAY_DRAGGED_TASK_ID, SORT } from '../../../../constants'
import {
  sortTasksByOrder,
  logger,
  getMentions,
  findChildTasks,
  deleteDraggableElement,
  createDraggableElement,
} from '../../../../helpers/util'
import moment from 'moment'
import { IconComponent } from '../../../../components/icon.component'

const L = memo(props => {
  const {
    base,
    sort,
    hideChildren,
    collapsed,
    processDrop,
    showCompletedTasks,
    deleteTask,
    updateTask,
    shareToChannel,
    disableTools,
    displayChannelName,
  } = props
  const [tasks, setTasks] = useState([])
  let labelCache

  useEffect(() => {
    let sortedTasks = sort == SORT.DATE ? sortTasksByDueDate(props.tasks) : sortTasksByOrder(props.tasks)

    if (sort == SORT.DATE) {
      sortedTasks = sortedTasks.map((task, index) => {
        let showDate = false
        let currentDate = moment(task.dueDate)
        let dateLabel = 'Later'

        // If it's valid
        // And if it's in the last week
        // Then add the date descriptor
        if (currentDate.isValid() && currentDate.isAfter(moment().subtract(1, 'weeks')))
          dateLabel = currentDate.format('dddd')

        // Check for today
        if (currentDate.isSame(MOMENT_TODAY, 'd')) dateLabel = 'Today'

        // Decide whether to show the label or not
        // ONLY if it's different to the cached label
        if (dateLabel != labelCache) {
          showDate = true
          labelCache = dateLabel
        }

        return {
          ...task,
          showDate,
          dateLabel,
        }
      })
    }

    setTasks(sortedTasks)
  }, [props.tasks, props.sort])

  return (
    <div style={{ display: collapsed ? 'none' : 'block' }}>
      {tasks.map((task, index) => {
        return (
          <div style={{ paddingLeft: base ? 0 : 20 }} key={index}>
            {task.showDate && (
              <div className="date-divider">
                <div className="date-divider-text">{task.dateLabel}</div>
              </div>
            )}

            <T
              sort={sort}
              task={task}
              hideChildren={hideChildren}
              processDrop={processDrop}
              index={index}
              showCompletedTasks={showCompletedTasks}
              deleteTask={deleteTask}
              updateTask={updateTask}
              shareToChannel={shareToChannel}
              disableTools={disableTools}
              displayChannelName={displayChannelName}
            />
          </div>
        )
      })}
    </div>
  )
})

class T extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      over: false,
      ontop: false,
      under: false,
      draggable: true,
      collapsed: true,
    }

    this.handleDrag = this.handleDrag.bind(this)
    this.handleDragLeave = this.handleDragLeave.bind(this)
    this.handleDrop = this.handleDrop.bind(this)
    this.handleDragOver = this.handleDragOver.bind(this)
    this.handleDragStart = this.handleDragStart.bind(this)
    this.handleUpdateDraggable = this.handleUpdateDraggable.bind(this)
    this.handleDragEnd = this.handleDragEnd.bind(this)
  }

  handleUpdateDraggable(draggable) {
    const { disableDrag } = this.props

    // Update the draggable (when the task is being edited)
    // But accommodate this task being told not be draggable by the parent
    this.setState({
      draggable: disableDrag ? false : draggable,
    })
  }

  handleDragStart(e) {
    // Save this for the drop so we have the ID
    window[WEEKDAY_DRAGGED_TASK_ID] = this.props.task.id

    // Create teh draggable element
    createDraggableElement(e, this.props.task.id)
  }

  handleDragEnd(e) {
    deleteDraggableElement(this.props.task.id)
  }

  handleDragLeave(e) {
    e.stopPropagation()
    e.preventDefault()

    this.setState({
      over: false,
      under: false,
      ontop: false,
    })
  }

  handleDragOver(e) {
    e.stopPropagation()
    e.preventDefault()

    const { target } = e
    const relativePosition = (target.getBoundingClientRect().top - e.pageY) * -1
    const ontop = relativePosition < 5
    const over = relativePosition >= 5 && relativePosition < 28
    const under = relativePosition >= 28

    this.setState({
      ontop,
      over,
      under,
    })
  }

  handleDrop(e) {
    const taskIdDragged = window[WEEKDAY_DRAGGED_TASK_ID]
    const type = this.state.ontop ? ONTOP : this.state.under ? UNDER : this.state.over ? OVER : null

    if (!type) return

    // We get the outer ID on the parent of this task
    // Not all DIVs have this - so recursively find it
    let count = 0
    let el = e.target
    let taskIdDraggedOnto

    while (!taskIdDraggedOnto && count < 50) {
      if (el.id) taskIdDraggedOnto = el.id
      el = el.parentElement
      count++
    }

    e.preventDefault()

    this.setState({
      over: false,
      under: false,
      ontop: false,
    })

    if (!taskIdDraggedOnto) return
    if (taskIdDraggedOnto == '') return

    this.props.processDrop(taskIdDragged, taskIdDraggedOnto, type)
  }

  handleDrag(e) {}

  render() {
    const {
      task,
      sort,
      hideChildren,
      processDrop,
      index,
      showCompletedTasks,
      deleteTask,
      updateTask,
      shareToChannel,
      disableTools,
      displayChannelName,
    } = this.props

    return (
      <React.Fragment>
        <div
          id={task.id}
          style={{
            position: 'relative',
            padding: 0,
            margin: 0,
            background: this.state.over ? '#F0F3F5' : 'transparent',
            boxShadow: this.state.ontop
              ? 'inset 0px 5px 0px 0px #F0F3F5'
              : this.state.under
              ? 'inset 0px -5px 0px 0px #F0F3F5'
              : 'none',
          }}
          onDrop={this.handleDrop}
          onDrag={this.handleDrag}
          onDragLeave={this.handleDragLeave}
          onDragOver={this.handleDragOver}
          onDragStart={this.handleDragStart}
          onDragEnd={this.handleDragEnd}
          draggable={sort == SORT.DATE ? false : this.state.draggable}
        >
          {/* Sort index is null */}
          <TaskComponent
            index={index}
            id={task.id}
            assignedChannel={task.channel}
            assignedUser={task.user}
            subtaskCount={!!task.subtaskCount ? task.subtaskCount : task.children ? task.children.length : 0}
            dueDate={task.dueDate}
            title={task.title}
            description={task.description}
            done={task.done}
            hide={task.hide}
            shareToChannel={shareToChannel}
            new={false}
            showCompletedTasks={showCompletedTasks}
            deleteTask={deleteTask}
            updateTask={updateTask}
            updateDraggable={this.handleUpdateDraggable}
            toggleTasksBelowHeadings={() => this.setState({ collapsed: !this.state.collapsed })}
            disableTools={disableTools}
            displayChannelName={displayChannelName}
          />
        </div>

        {/* sublists */}
        {!hideChildren && (
          <L
            sort={SORT.NONE}
            hideChildren={!!hideChildren}
            tasks={task.children}
            collapsed={this.state.collapsed}
            processDrop={processDrop}
            showCompletedTasks={showCompletedTasks}
            deleteTask={deleteTask}
            updateTask={updateTask}
            shareToChannel={shareToChannel}
            disableTools={disableTools}
            displayChannelName={displayChannelName}
          />
        )}
      </React.Fragment>
    )
  }
}

/**
 * mastTaskList is all the tasks
 * tasks = nested tasks
 */
export const TasksComponent = memo(
  ({
    tasks,
    masterTaskList,
    hideChildren,
    deleteTask,
    updateTaskOrder,
    updateTask,
    shareToChannel,
    createTask,
    disableTools,
    displayChannelName,
  }) => {
    const [sort, setSort] = useState(SORT.NONE)
    const [sortPopup, setSortPopup] = useState(false)
    const [showCompletedTasks, setShowCompletedTasks] = useState(true)
    const [completed, setCompleted] = useState(0)

    useEffect(() => {
      if (!masterTaskList) return
      setCompleted(masterTaskList.filter(task => task.done).length)
    }, [masterTaskList, showCompletedTasks])

    const processDropOver = (taskIdDragged, taskIdDraggedOnto) => {
      console.log(OVER, taskIdDragged, taskIdDraggedOnto)

      // New parent
      const parent = taskIdDraggedOnto
      const id = taskIdDragged

      // Get the parent's childrren (so we can calculate order)
      const children = sortTasksByOrder(masterTaskList.filter(task => task.parentId == taskIdDraggedOnto))
      const order = children.length == 0 ? 1 : getHighestTaskOrder(children)

      // Update it
      return {
        parent,
        id,
        order,
      }
    }

    const processDropUnder = (taskIdDragged, taskIdDraggedOnto) => {
      console.log(UNDER, taskIdDragged, taskIdDraggedOnto)

      const taskDraggedOnto = masterTaskList.filter(task => task.id == taskIdDraggedOnto)[0]
      const { parentId } = taskDraggedOnto
      const siblings = sortTasksByOrder(masterTaskList.filter(task => task.parentId == parentId))

      // Return the updated task to update
      return {
        id: taskIdDragged,
        parent: parentId,
        order: getNextTaskOrder(siblings, taskIdDraggedOnto),
      }
    }

    const processDropOntop = (taskIdDragged, taskIdDraggedOnto) => {
      console.log(ONTOP, taskIdDragged, taskIdDraggedOnto)

      const taskDraggedOnto = masterTaskList.filter(task => task.id == taskIdDraggedOnto)[0]
      const { parentId } = taskDraggedOnto
      const siblings = sortTasksByOrder(masterTaskList.filter(task => task.parentId == parentId))

      // Return the updated task to update
      return {
        id: taskIdDragged,
        parent: parentId,
        order: getPreviousTaskOrder(siblings, taskIdDraggedOnto),
      }
    }

    const processDrop = (taskIdDragged, taskIdDraggedOnto, type) => {
      if (taskIdDragged == taskIdDraggedOnto) return

      let updatedTask = null

      switch (type) {
        case OVER:
          updatedTask = processDropOver(taskIdDragged, taskIdDraggedOnto)
          break
        case UNDER:
          updatedTask = processDropUnder(taskIdDragged, taskIdDraggedOnto)
          break
        case ONTOP:
          updatedTask = processDropOntop(taskIdDragged, taskIdDraggedOnto)
          break
      }

      if (updatedTask) updateTaskOrder(updatedTask)
    }

    return (
      <React.Fragment>
        <div className="tasks-header">
          <div className="tasks-title">Tasks</div>
          <div className="tasks-progress">
            {completed} / {masterTaskList.length}
          </div>

          <Popup
            handleDismiss={() => setSortPopup(false)}
            visible={sortPopup}
            width={250}
            direction="right-bottom"
            content={
              <Menu
                items={[
                  {
                    text: 'Custom order tasks',
                    onClick: e => {
                      setSortPopup(false)
                      setSort(SORT.NONE)
                    },
                  },
                  {
                    text: 'Order tasks by date',
                    onClick: e => {
                      setSortPopup(false)
                      setSort(SORT.DATE)
                    },
                  },
                  {
                    icon: <IconComponent icon={showCompletedTasks ? 'eye-off' : 'eye'} size={18} color="#11161c" />,
                    text: showCompletedTasks ? 'Hide completed tasks' : 'Show completed tasks',
                    onClick: e => {
                      setSortPopup(false)
                      setShowCompletedTasks(!showCompletedTasks)
                    },
                  },
                ]}
              />
            }
          >
            <div className="icon-button" onClick={() => setSortPopup(true)}>
              <IconComponent icon="more-v" size={16} color="#798898" />
            </div>
          </Popup>
        </div>

        <div className="tasks-container">
          <div className="tasks">
            <div className="task-list">
              <L
                base
                sort={sort}
                hideChildren={hideChildren}
                tasks={tasks}
                collapsed={false}
                processDrop={processDrop}
                showCompletedTasks={showCompletedTasks}
                deleteTask={deleteTask}
                updateTask={updateTask}
                shareToChannel={shareToChannel}
                disableTools={disableTools}
                displayChannelName={displayChannelName}
              />

              <TaskComponent
                id=""
                title=""
                hide={false}
                done={false}
                new={true}
                createTask={createTask}
                showCompletedTasks={true}
              />
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }
)
