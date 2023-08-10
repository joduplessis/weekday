export function hydrateTasks(tasks) {
  return {
    type: 'TASKS',
    payload: tasks,
  }
}

export function createTasks(channelId, task) {
  return {
    type: 'CREATE_TASKS',
    payload: {
      channelId,
      task,
    },
    sync: channelId,
  }
}

export function updateTasks(channelId, task) {
  return {
    type: 'UPDATE_TASKS',
    payload: {
      channelId,
      task,
    },
    sync: channelId,
  }
}

export function deleteTasks(channelId, taskId) {
  return {
    type: 'DELETE_TASKS',
    payload: {
      channelId,
      taskId,
    },
    sync: channelId,
  }
}
