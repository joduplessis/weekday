export function hydrateMessages(channelId, messages) {
  return {
    type: 'MESSAGES',
    payload: {
      channelId,
      messages,
    },
  }
}

export function createMessages(channelId, channelMessage) {
  return {
    type: 'CREATE_MESSAGES',
    payload: channelMessage,
    sync: channelId,
  }
}

export function updateMessages(channelId, channelMessage) {
  return {
    type: 'UPDATE_MESSAGES',
    payload: channelMessage,
    sync: channelId,
  }
}

export function deleteMessages(channelId, messageId, parentMessageId) {
  return {
    type: 'DELETE_MESSAGES',
    payload: {
      channelId,
      messageId,
      parentMessageId,
    },
    sync: channelId,
  }
}

export function createMessagesReaction(channelId, messageId, reaction) {
  return {
    type: 'CREATE_MESSAGES_REACTION',
    payload: {
      channelId,
      messageId,
      reaction,
    },
    sync: channelId,
  }
}

export function deleteMessagesReaction(channelId, messageId, reaction) {
  return {
    type: 'DELETE_MESSAGES_REACTION',
    payload: {
      channelId,
      messageId,
      reaction,
    },
    sync: channelId,
  }
}

export function createMessagesLike(channelId, messageId, userId) {
  return {
    type: 'CREATE_MESSAGES_LIKE',
    payload: {
      channelId,
      messageId,
      userId,
    },
    sync: channelId,
  }
}

export function deleteMessagesLike(channelId, messageId, userId) {
  return {
    type: 'DELETE_MESSAGES_LIKE',
    payload: {
      channelId,
      messageId,
      userId,
    },
    sync: channelId,
  }
}

// These action creators are not present in the message.reducer
// Only for the main channel messages

export function updateMessagesTaskAttachment(channelId, taskId, task) {
  return {
    type: 'UPDATE_MESSAGES_TASK_ATTACHMENT',
    payload: {
      channelId,
      taskId,
      task,
    },
    sync: channelId,
  }
}

export function deleteMessagesTaskAttachment(channelId, taskId) {
  return {
    type: 'DELETE_MESSAGES_TASK_ATTACHMENT',
    payload: {
      channelId,
      taskId,
    },
    sync: channelId,
  }
}
