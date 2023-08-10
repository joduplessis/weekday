export function hydrateChannelNotifications(channelNotifications) {
  return {
    type: 'CHANNEL_NOTIFICATIONS',
    payload: channelNotifications,
  }
}

export function createChannelNotification(channelNotification) {
  return {
    type: 'CREATE_CHANNEL_NOTIFICATION',
    payload: channelNotification,
  }
}

export function updateChannelNotification(channelNotificationId, every) {
  return {
    type: 'UPDATE_CHANNEL_NOTIFICATION',
    payload: { channelNotificationId, every },
  }
}

export function deleteChannelNotification(channelNotificationId) {
  return {
    type: 'DELETE_CHANNEL_NOTIFICATION',
    payload: { channelNotificationId },
  }
}
