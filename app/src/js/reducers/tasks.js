import produce from 'immer'
import { getChannelIdFromUrl } from '../helpers/util'

const initialState = []

export default (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case 'TASKS':
        return action.payload

      case 'UPDATE_TASKS':
        return state.map(task => {
          if (task.id != action.payload.task.id) return task

          return {
            ...task,
            ...action.payload.task,
          }
        })

      case 'DELETE_TASKS':
        return state.filter(task => task.id != action.payload.taskId)

      case 'CREATE_TASKS':
        const channelId = getChannelIdFromUrl()

        // If it's null - then add it anyways, because they're likely not
        // on the tasks view or in the master task list (so it makes sense)
        if (!channelId) draft.push(action.payload.task)

        // Otherwise only add it if the task is for this channel
        if (channelId == action.payload.channelId) draft.push(action.payload.task)
        break

      // These are from the task reducer
      // But we use them here to adjust the subtaskCount
      // -------------------------------

      case 'UPDATE_TASK_ADD_SUBTASK':
        return state.map(task => {
          if (task.id != action.payload.taskId) return task

          return {
            ...task,
            subtaskCount: Number(task.subtaskCount) + 1,
          }
        })

      case 'UPDATE_TASK_DELETE_SUBTASK':
        return state.map(task => {
          if (task.id != action.payload.currentTaskId) return task

          return {
            ...task,
            subtaskCount: Number(task.subtaskCount) - 1,
          }
        })
    }
  })
