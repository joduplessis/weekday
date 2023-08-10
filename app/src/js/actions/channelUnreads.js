// Gets called from the channels.component
export function hydrateChannelUnreads(channelUnreads) {
  return {
    type: 'CHANNEL_UNREADS',
    payload: channelUnreads,
  }
}

// Gets called from common (actions)
export function createChannelUnread(unread) {
  return {
    type: 'CHANNEL_CREATE_UNREAD',
    payload: unread,
  }
}

// Gets called from the channel.component (when mounting)
export function deleteChannelUnread(channelId, parentId, threaded) {
  return {
    type: 'CHANNEL_DELETE_UNREAD',
    payload: { channelId, parentId, threaded },
  }
}
