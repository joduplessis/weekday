import produce from 'immer'
import { v4 as uuidv4 } from 'uuid'

const initialState = {
  id: null,
  tasks: [],
  messages: [],
  description: '',
  title: '',
  done: false,
  order: 0,
}

export default (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case 'TASK':
        return action.payload

      case 'TASK_MESSAGES':
        return {
          ...state,
          messages: [...action.payload.messages, ...state.messages],
        }

      case 'UPDATE_TASKS':
        if (!state.tasks) return
        if (!state.tasks.length) return

        draft.tasks = state.tasks.map(task => {
          if (task.id != action.payload.task.id) return task

          return {
            ...task,
            ...action.payload.task,
          }
        })
        break

      case 'UPDATE_TASK':
        if (action.payload.taskId != state.id) return

        // Copy any updates here
        return {
          ...state,
          ...action.payload,
        }

      case 'UPDATE_TASK_ADD_MESSAGE':
        if (action.payload.taskId != state.id) return

        // Add the message here
        return {
          ...state,
          messages: [...state.messages, action.payload.message],
        }

      case 'UPDATE_TASK_ADD_SUBTASK':
        if (state.id == action.payload.taskId) {
          draft.tasks.push(action.payload.task)
        }
        break

      case 'UPDATE_TASK_DELETE_SUBTASK':
        draft.tasks = state.tasks.filter(task => task.id != action.payload.taskId)
        break

      case 'UPDATE_TASK_UPDATE_SUBTASK':
        draft.tasks = state.tasks.map((task, _) => {
          if (task.id == action.payload.taskId) {
            return {
              ...task,
              ...action.payload.task,
            }
          } else {
            return task
          }
        })
        break
    }
  })
