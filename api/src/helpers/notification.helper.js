require('dotenv').config()

import { NotificationModel } from '../models/notification.model'
import { syncUserAppState, createReduxActionObject } from './mqtt.helper'

export const createNotificationForUser = async (title, body, teamId, channelId, userId) => {
  let notificationObject = await NotificationModel.create({
    title,
    body,
    read: false,
    user: userId,
    team: teamId,
    channel: channelId,
  })

  // Get the channel/team details
  notificationObject = await notificationObject.populate([{ path: 'team', model: 'Team', select: 'name image _id' }, { path: 'channel', model: 'Channel', select: 'name image _id' }]).execPopulate()

  // We have to manually add the id because it's not a .find
  let notification = notificationObject.toJSON()

  // Add the normal ID
  notification = {
    id: notificationObject._id,
    ...notification,
    channel: {
      ...notification.channel,
      id: notification.channel ? notification.channel._id : null,
    },
    team: {
      ...notification.team,
      id: notification.team._id,
    }
  }

  console.log('notification.helper', notification)

  syncUserAppState(userId, createReduxActionObject('ADD_NOTIFICATION', notification))
}
