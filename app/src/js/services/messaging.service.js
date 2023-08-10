import { MQTT_HOST, JWT, MQTT_PREFIX } from '../environment'
import { logger } from '../helpers/util'
import StorageService from './storage.service'
import mqtt from 'mqtt'
import AuthService from './auth.service'
import uuid from 'uuid/v4'

export default class MessagingService {
  static instance
  client

  constructor() {
    const token = StorageService.getStorage(JWT)
    const { userId } = AuthService.parseJwt(token)
    const clientId = MQTT_PREFIX + '-' + uuid() // MQTT_PREFIX + '-' + userId

    logger('MessagingService connecting to broker')

    // This token will be used on the EMQX server to authenticate the client
    this.client = mqtt.connect(MQTT_HOST, {
      clientId: clientId,
      username: userId,
      password: token,
      clean: true,
      keepalive: 60,
      queueQoSZero: true,
      useSSL: false,
      will: {
        topic: 'death',
        payload: userId,
      },
    })
  }

  static getInstance() {
    if (this.instance) return this.instance

    this.instance = new MessagingService()

    return this.instance
  }

  /**
   * This applies to the server too (see sendMessageToMqttTopic & mqtt.helper.js)
   * Redux (store) action creators gets sent as 'messagePayload':
   * This would look like: messagePayload: { type: 'COOL', payload: 'Dude' }
   * messageType & messagePayload are not Redux type & payload
   * messageType & messagePayload are used for things other than Redux
   */
  sendMessageToTopic(topic, messageType, messagePayload) {
    if (this.client) {
      this.client.publish(
        topic,
        JSON.stringify({
          messageType,
          messagePayload,
        }),
        {
          qos: 2,
        },
        err => {
          if (err) {
            logger('Error: ', err)
          }
        }
      )
    }
  }

  joins(topics) {
    if (this.client) {
      topics.map(topic => {
        logger('Subscribing to', topic)

        this.client.subscribe(
          topic,
          {
            qos: 2,
          },
          err => {
            if (err) {
              logger('Error: ', err)
            }
          }
        )
      })
    }
  }

  join(topic) {
    if (this.client) {
      logger('Subscribing to', topic)

      this.client.subscribe(
        topic,
        {
          qos: 2,
        },
        err => {
          if (err) {
            logger('Error: ', err)
          }
        }
      )
    }
  }

  leave(topic) {
    if (this.client) this.client.unsubscribe(topic)
  }

  sync(topic, action) {
    this.sendMessageToTopic(topic, 'SYNC', action)
  }

  // This tell everyone to join this channel if they haven't already
  // Only for public groups - because everyone has access to them
  joinPublicChannel(teamId, channelId) {
    this.sendMessageToTopic(teamId, 'JOIN_PUBLIC_CHANNEL', channelId)
  }

  // This tells users to leave channels they are not a member of
  // This is handled in common.js
  leaveChannelIfNotMember(teamId, channelId) {
    this.sendMessageToTopic(teamId, 'LEAVE_CHANNEL_IF_NOT_MEMBER', channelId)
  }
}
