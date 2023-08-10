require('dotenv').config()

import { ChannelModel } from '../models/channel.model'
import { MessageModel } from '../models/message.model'
import { AppModel } from '../models/app.model'
import { syncUserAppState } from '../helpers/mqtt.helper'
import { logger } from '../helpers/logging.helper'
import { UserModel } from '../models/user.model'
import { isUuid } from 'uuidv4'

const getAuthHeader = (headers) => {
  const { weekdayapp, authorization } = headers
  let authHeader

  // If there is a weekday header or auth bearer
  if (weekdayapp || authorization) {
    if (weekdayapp) {
      if (isUuid(weekdayapp)) authHeader = weekdayapp
    } else {
      const authParts = authorization.split(' ')
      if (authParts.length == 2) authHeader = authParts[1]
    }
  }

  return authHeader
}

// Legacy Zapier v1.0 app ⚠️
const zapierAppVersion1 = async (req, res) => {
  const appToken = getAuthHeader(req.headers)
  if (!appToken) return res.status(401).send({ message: 'No valid header' })

  try {
    const {
      body,
      attachments,
      resourceId,
      userId,
      channelToken,
    } = req.body

    // Find app
    const app = await AppModel.findOne({ token: appToken }).exec()
    const channel = await ChannelModel.findOne({
      'apps.token': channelToken,
    }).exec()
    const appId = app._id
    const channelId = channel._id
    const teamId = channel.team

    // Create message
    const newMessage = await MessageModel.create({
      body,
      attachments,
      user: userId,
      channel: channelId,
      team: teamId,
      app: {
        app: appId,
        token: channelToken,
        resourceId
      },
    })

    // Add the username
    const user = await UserModel.findOne({ _id: userId }, '_id name')

    // Populate the core message object
    // newMessage = await newMessage.populate('app.app').execPopulate()
    // Add the actual app object - we just want the message child part here
    // Because the rest if irrelevant
    // TODO: Manually delete other child objects still
    const formattedMessageObject = {
      ...newMessage.toJSON(),
      user,
      excerpt: `${app.name}: ${body}`,
      id: newMessage._id,
      app: {
        resourceId,
        app: {
          ...app.toJSON(),
          id: app._id,
        },
      },
    }

    // Send this to the socket server for processing (sending to channel)
    syncUserAppState(channelId, {
      type: 'CREATE_MESSAGES',
      payload: {
        message: formattedMessageObject,
        channelId,
        teamId,
      },
    })

    // Return normal return vqlue
    res.status(200).send({ messageId: newMessage._id })
  } catch (e) {
    res.status(500).send({ error: 'Please use a valid app key or channel token.' })
  }
}

export const AppRoute = app => {
  /**
   * @swagger
   *  /v1/app/message:
   *    post:
   *      summary: Creates a message
   *      tags: [App]
   *      security:
   *        - bearerAuth: []
   *      consumes:
   *        - application/json
   *      description: Creates a new channel message using the channel app token
   *      requestBody:
   *        description: Body request variables
   *        required: true
   *        content:
   *          application/json:
   *      parameters:
   *        - in: body
   *          name: message
   *          description: Message object to post to the channel
   *          schema:
   *            type: object
   *            required:
   *              - body
   *              - attachments
   *              - resourceId
   *              - userId
   *            properties:
   *              body:
   *                type: string
   *                description: The message text content
   *                example:
   *                  Someone has just posted something
   *              attachments:
   *                type: array
   *                description: Message attachments array
   *                schema:
   *                  type: object
   *                  required:
   *                    - uri
   *                    - size
   *                    - mime
   *                    - name
   *                  properties:
   *                    uri:
   *                      type: string
   *                      description: File location URI
   *                    preview:
   *                      type: string
   *                      description: Preview image URI
   *                    mime:
   *                      type: string
   *                      description: Valid mime type of file
   *                    name:
   *                      type: string
   *                      description: Human readable file name
   *                    size:
   *                      type: integer
   *                      description: Byte size value
   *                example:
   *                  - uri: https://location.to.file
   *                    preview: https://location.to.preview.image
   *                    mime: file/jpeg
   *                    name: Filename.jpg
   *                    size: 345
   *              resourceId:
   *                type: string
   *                description: The remote resource for the app - must be unique
   *                example:
   *                  ab13243
   *        - in: header
   *          name: authorization
   *          description: bearer $token header string - 'bearer xxx'
   *          required: true
   *          type: string
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: OK
   *        401:
   *          description: Not authenticated
   *        403:
   *          description: Access token not properly formatted
   */
  app.post('/v1/app/message', async (req, res) => {
    if (req.headers.weekdayapp) return zapierAppVersion1(req, res)
    if (!req.headers.authorization) return res.status(401).send({ message: 'No valid auth field' })
    if (req.headers.authorization.split(' ').length != 2) return res.status(401).send({ message: 'Invalid token' })

    try {
      const token = req.headers.authorization.split(' ')[1]
      const { body } = req.body
      const attachments = req.body.attachments || []
      const resourceId = req.body.resourceId || null

      // Find app
      const channel = await ChannelModel.findOne({ 'apps.token': token }).exec()
      const { app } = channel.apps.filter(app => app.token == token)[0]
      const channelId = channel._id
      const teamId = channel.team

      // Create message
      let message = await MessageModel.create({
        body,
        attachments,
        channel: channelId,
        team: teamId,
        app: {
          app,
          token,
          resourceId
        },
      })

      // Populate the app objecct
      message = await message.populate('app.app').execPopulate()

      // Serialize (so it's not a Mongoose object)
      // All addd the normal ID fields that the forntend uses
      message = message.toJSON()
      message.id = message._id
      message.app.app.id = message.app.app._id

      // Send this to the socket server for processing (sending to channel)
      syncUserAppState(channelId, {
        type: 'CREATE_MESSAGES',
        payload: {
          message,
          channelId,
          teamId,
        },
      })

      // Return normal return vqlue
      res.status(200).send({ messageId: message.id })
    } catch (e) {
      console.log(e)
      res.status(500).send({ error: 'Please use a valid app key or channel token.' })
    }
  })

  /**
   * @swagger
   *  /v1/app/message/:resourceId:
   *    delete:
   *      summary: Deletes a channel message
   *      tags: [App]
   *      security:
   *        - bearerAuth: []
   *      description: Deletes a channel message using the channel app token
   *      parameters:
   *        - name: resourceId
   *          description: Remote resource Id linked to message
   *          in: path
   *          required: true
   *          type: string
   *        - in: header
   *          name: authorization
   *          description: bearer $token header string - 'bearer xxx'
   *          required: true
   *          type: string
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: OK
   *        401:
   *          description: Not authenticated
   *        403:
   *          description: Access token not properly formatted
   */
  app.delete('/v1/app/message/:resourceId', async (req, res) => {
    if (!req.headers.authorization) return res.status(401).send({ message: 'No valid auth field' })
    if (req.headers.authorization.split(' ').length != 2) return res.status(401).send({ message: 'Invalid token' })

    try {
      const { resourceId } = req.params
      const token = req.headers.authorization.split(' ')[1]

      // Find the channel this app is attached to
      const channel = await ChannelModel.findOne({ 'apps.token': token }).exec()
      const { app } = channel.apps.filter(app => app.token == token)[0]
      const teamId = channel.team
      const channelId = channel._id

      // Delete the messages
      await MessageModel.deleteMany({
        'channel': channelId,
        'team': teamId,
        'app.app': app,
        'app.resourceId': resourceId,
        'app.token': token,
      }).exec()

      // Send this to the socket server for processing (sending to channel)
      // Only send through the message/attachments/app object
      // Don't update the entire message
      syncUserAppState(channelId, {
        type: 'DELETE_CHANNEL_APP_MESSAGES_WITH_RESOURCE_ID',
        payload: {
          channelId,
          teamId,
          resourceId,
        },
      })

      res.status(200).send({ success: true })
    } catch (e) {
      console.log(e)
      res.status(500).send({ message: e.message || ERROR })
    }
  })

  /**
   * @swagger
   *  /v1/app/message/:resourceId:
   *    put:
   *      summary: Updates a message
   *      tags: [App]
   *      security:
   *        - bearerAuth: []
   *      consumes:
   *        - application/json
   *      description: Updates a channel message using the channel app token
   *      requestBody:
   *        description: Body request variables
   *        required: true
   *        content:
   *          application/json:
   *      parameters:
   *        - in: body
   *          name: message
   *          description: Message object to post to the channel
   *          schema:
   *            type: object
   *            required:
   *              - body
   *              - attachments
   *              - resourceId
   *            properties:
   *              body:
   *                type: string
   *                description: The message text content
   *                example:
   *                  Someone has just posted something
   *              attachments:
   *                type: array
   *                description: Message attachments array
   *                schema:
   *                  type: object
   *                  required:
   *                    - uri
   *                    - size
   *                    - mime
   *                    - name
   *                  properties:
   *                    uri:
   *                      type: string
   *                      description: File location URI
   *                    preview:
   *                      type: string
   *                      description: Preview image URI
   *                    mime:
   *                      type: string
   *                      description: Valid mime type of file
   *                    name:
   *                      type: string
   *                      description: Human readable file name
   *                    size:
   *                      type: integer
   *                      description: Byte size value
   *                example:
   *                  - uri: https://location.to.file
   *                    preview: https://location.to.preview.image
   *                    mime: file/jpeg
   *                    name: Filename.jpg
   *                    size: 345
   *              resourceId:
   *                type: string
   *                description: The remote resource for the app
   *                example:
   *                  ab13243
   *        - in: header
   *          name: authorization
   *          description: bearer $token header string - 'bearer xxx'
   *          required: true
   *          type: string
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: OK
   *        401:
   *          description: Not authenticated
   *        403:
   *          description: Access token not properly formatted
   */
  app.put('/v1/app/message/:resourceId', async (req, res) => {
    if (!req.headers.authorization) return res.status(401).send({ message: 'No valid auth field' })
    if (req.headers.authorization.split(' ').length != 2) return res.status(401).send({ message: 'Invalid token' })

    try {
      const token = req.headers.authorization.split(' ')[1]
      const { body, attachments } = req.body
      const { resourceId } = req.params

      // Find the app
      const channel = await ChannelModel.findOne({ 'apps.token': token }).exec()
      const { app } = channel.apps.filter(app => app.token == token)[0]
      const channelId = channel._id
      const teamId = channel.team

      // Bare basic app message object
      // Only use the app Id here - mongoose just needs the ID
      let message = { app: { app, resourceId } }

      // See what else the user is updating
      if (body) message.body = body
      if (attachments) message.attachments = attachments

      // Now updated the messages
      await MessageModel.updateMany({ 'channel': channelId, 'app.app': app, 'app.resourceId': resourceId }, message, { new: true }).exec()

      // Now get all of them
      const messages = await MessageModel.find({ 'channel': channelId, 'app.app': app, 'app.resourceId': resourceId }).exec()

      // Get all of the IDs
      const messageIds = messages.map(m => m._id)

      // Send this to the socket server for processing (sending to channel)
      // Only send through the message/attachments/app object
      // Don't update the entire message
      syncUserAppState(channelId, {
        type: 'UPDATE_CHANNEL_APP_MESSAGES_WITH_RESOURCE_ID',
        payload: {
          message,
          messageIds,
          channelId,
          teamId,
        },
      })

      res.status(200).send({ messageId: newMessage._id })
    } catch (e) {
      console.log(e)
      res.status(500).send({ message: e.message || ERROR })
    }
  })
}
