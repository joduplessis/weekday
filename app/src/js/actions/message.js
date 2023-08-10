export function hydrateMessage(message) {
  return {
    type: 'MESSAGE',
    payload: message,
  }
}

export function createMessageMessages(channelId, channelMessage) {
  return {
    type: 'CREATE_MESSAGE_MESSAGES',
    payload: channelMessage,
    sync: channelId,
  }
}

export function updateMessageMessages(channelId, channelMessage) {
  return {
    type: 'UPDATE_MESSAGE_MESSAGES',
    payload: channelMessage,
    sync: channelId,
  }
}

export function deleteMessageMessages(channelId, messageId, parentMessageId) {
  return {
    type: 'DELETE_MESSAGE_MESSAGES',
    payload: {
      channelId,
      messageId,
      parentMessageId,
    },
    sync: channelId,
  }
}

export function createMessageMessagesReaction(channelId, messageId, reaction) {
  return {
    type: 'CREATE_MESSAGE_MESSAGES_REACTION',
    payload: {
      channelId,
      messageId,
      reaction,
    },
    sync: channelId,
  }
}

export function deleteMessageMessagesReaction(channelId, messageId, reaction) {
  return {
    type: 'DELETE_MESSAGE_MESSAGES_REACTION',
    payload: {
      channelId,
      messageId,
      reaction,
    },
    sync: channelId,
  }
}

export function createMessageMessagesLike(channelId, messageId, userId) {
  return {
    type: 'CREATE_MESSAGE_MESSAGES_LIKE',
    payload: {
      channelId,
      messageId,
      userId,
    },
    sync: channelId,
  }
}

export function deleteMessageMessagesLike(channelId, messageId, userId) {
  return {
    type: 'DELETE_MESSAGE_MESSAGES_LIKE',
    payload: {
      channelId,
      messageId,
      userId,
    },
    sync: channelId,
  }
}
