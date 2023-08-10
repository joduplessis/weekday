export function hydrateNotifications(notifications) {
  return {
    type: 'NOTIFICATIONS',
    payload: notifications,
  }
}

export function updateNotificationRead(notificationId, read) {
  return {
    type: 'UPDATE_NOTIFICATION_READ',
    payload: { notificationId, read },
  }
}
