export function updateChannelCreateMessagePin(channelId, channelMessage) {
  return {
    type: 'UPDATE_CHANNEL_CREATE_MESSAGE_PIN',
    payload: {
      channelId,
      channelMessage,
    },
    sync: channelId,
  }
}

export function updateChannelDeleteMessagePin(channelId, messageId) {
  return {
    type: 'UPDATE_CHANNEL_DELETE_MESSAGE_PIN',
    payload: {
      channelId,
      messageId,
    },
    sync: channelId,
  }
}

export function updateChannelUpdateMessagePin(channelId, channelMessage) {
  return {
    type: 'UPDATE_CHANNEL_UPDATE_MESSAGE_PIN',
    payload: {
      channelId,
      channelMessage,
    },
    sync: channelId,
  }
}

export function deleteChannelSection(channelId, sectionId) {
  return {
    type: 'DELETE_CHANNEL_SECTION',
    payload: {
      channelId,
      sectionId,
    },
    sync: channelId,
  }
}

export function createChannelSection(channelId, section) {
  return {
    type: 'CREATE_CHANNEL_SECTION',
    payload: { channelId, section },
    sync: channelId,
  }
}

export function updateChannelSection(channelId, section) {
  return {
    type: 'UPDATE_CHANNEL_SECTION',
    payload: { channelId, section },
    sync: channelId,
  }
}

export function updateChannelSections(channelId, sections) {
  return {
    type: 'UPDATE_CHANNEL_SECTIONS',
    payload: { channelId, sections },
    sync: channelId,
  }
}

export function createChannel(channel) {
  return {
    type: 'CREATE_CHANNEL',
    payload: channel,
  }
}

export function hydrateChannel(channel) {
  return {
    type: 'CHANNEL',
    payload: {
      ...channel,
      typing: [],
    },
  }
}

export function updateChannel(channelId, updatedChannel) {
  return {
    type: 'UPDATE_CHANNEL',
    payload: {
      ...updatedChannel,
      channelId,
    },
    sync: channelId,
  }
}

export function deleteChannel(channelId, sync) {
  return {
    type: 'DELETE_CHANNEL',
    payload: { channelId },
    sync: sync ? channelId : null,
  }
}
