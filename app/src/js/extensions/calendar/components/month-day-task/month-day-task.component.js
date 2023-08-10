import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import './month-day-task.component.css'
import { CheckboxComponent } from '../../../tasks/components/checkbox/checkbox.component'
import { Avatar } from '../../../../elements'
import { updateTasks, updateTask } from '../../../../actions'
import GraphqlService from '../../../../services/graphql.service'
import { logger, deleteDraggableElement, createDraggableElement } from '../../../../helpers/util'
import { WEEKDAY_DRAGGED_TASK_ID } from '../../../../constants'
import { IconComponent } from '../../../../components/icon.component'

export const MonthDayTaskComponent = ({
  id,
  channelId,
  displayChannelName,
  done,
  channel,
  title,
  user,
  onClick,
  subtaskCount,
  parentId,
}) => {
  const dispatch = useDispatch()

  const handleUpdateTaskDone = async () => {
    try {
      const updatedDone = !done
      const taskId = id
      const task = { id, done: updatedDone }

      // Update the API
      await GraphqlService.getInstance().updateTask(id, { done: updatedDone })

      // Update the task list
      dispatch(updateTasks(channelId, task))
      dispatch(updateTask(taskId, task, channelId))
    } catch (e) {
      logger(e)
    }
  }

  const handleDragEnd = e => {
    deleteDraggableElement(id)
  }

  const handleDragStart = e => {
    window[WEEKDAY_DRAGGED_TASK_ID] = id

    // Create teh draggable element
    createDraggableElement(e, id)
  }

  const handleDrag = e => {}

  return (
    <div
      draggable
      id={id}
      onDrag={handleDrag}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="month-day-task"
    >
      <div className="checkbox">
        <CheckboxComponent done={done} onClick={handleUpdateTaskDone} />
      </div>
      {!!user && (
        <div className="task-avatar" onClick={onClick}>
          <Avatar size="x-small" image={user.image} title={user.name} />
        </div>
      )}
      <div className="task-row">
        <div className="column flexer" onClick={onClick}>
          <div className="task-title">
            {!!parentId && (
              <IconComponent icon="corner-down-right" color="#11171d" size={11} style={{ marginRight: 3 }} />
            )}
            <div style={{ color: displayChannelName ? channel.color : '#11171d' }} className="task-title-text">
              {title}
            </div>
          </div>
          {displayChannelName && (
            <div className="task-channel" style={{ color: displayChannelName ? channel.color : '#adb5bd' }}>
              {channel.name}
            </div>
          )}
        </div>
        {!!subtaskCount && (
          <div className="subtask-count">
            <IconComponent icon="check" color="#adb5bd" size={11} />
            <IconComponent icon="check" color="#adb5bd" size={11} style={{ position: 'relative', left: -8 }} />
            <div className="text">{subtaskCount}</div>
          </div>
        )}
      </div>
    </div>
  )
}
