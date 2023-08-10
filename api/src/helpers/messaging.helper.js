require('dotenv').config()

import { NotificationModel } from '../models/notification.model'
import { MessageModel } from '../models/message.model'
import { syncUserAppState, createReduxActionObject } from './mqtt.helper'

export const createMessageFromSystem = async (channelId, teamId, messageText) => {
  // Create a system message
  // System has no USER here
  const messageObject = await MessageModel.create({
    channel: channelId,
    team: teamId,
    system: true,
    body: messageText,
    attachments: [],
    user: null,
  })

  // We have to manually add the id because it's not a .find
  let message = messageObject.toJSON()
  message.id = messageObject._id

  console.log('messaging.helper', message, channelId, teamId)

  // Type & hen payload
  const reduxAction = createReduxActionObject('CREATE_MESSAGES', {
    message,
    channelId,
    teamId,
  })

  // A redux action
  syncUserAppState(channelId, reduxAction)
}
