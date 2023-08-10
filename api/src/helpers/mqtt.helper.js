require('dotenv').config()
import { SECRET } from '../constants'
import uuidv1 from 'uuid/v1'
import mqtt from 'mqtt'
import * as JwtHelper from './jwt.helper'
import os from 'os'
import { logger } from './logging.helper'

export const createReduxActionObject = (type, payload) => {
  return {
    type,
    payload,
  }
}

/**
 * This applies to the server too (see messaging.service.js)
 * Redux (store) action creators gets sent as 'messagePayload':
 * This would look like: messagePayload: { type: 'COOL', payload: 'Dude' }
 * messageType & messagePayload are not Redux type & payload
 * messageType & messagePayload are used for things other than Redux
 */
export const sendMessageToMqttTopic = (topic, messageType, messagePayload) => {
  if (global.mqttClient) {
    logger.info('Sending to ' + topic + ': ', {
      messageType,
      messagePayload,
    })

    // Force it to be a string
    global.mqttClient.publish(
      convertToString(topic),
      JSON.stringify({
        messageType,
        messagePayload,
      }),
      {
        qos: 2,
      },
      err => {
        if (err) {
          logger.info('Error: ', err)
        }
      }
    )
  }
}

export const syncUserAppState = (topic, action) => {
  sendMessageToMqttTopic(topic, 'SYNC', action)
}

export const subscribeToMqttTopic = (client, topic) => {
  client.subscribe(topic, { qos: 2 }, err => {
    if (err) logger.info('Error: ', err)
  })
}

export const connectToMqttBroker = () => {
  const clientId = uuidv1()
  const host = os.hostname()

  const token = JwtHelper.encode(
    {
      iss: host,
      sub: clientId,
      userId: clientId,
      exp: Date.now() / 1000 + 60 * 60 * 24 * 14,
    },
    SECRET
  )

  const client = mqtt.connect(process.env.MQTT_HOST, {
    clientId,
    username: clientId,
    password: token,
    clean: false,
    queueQoSZero: true,
    useSSL: false,
  })

  // Set up MQTT
  client.on('disconnect', e => logger.info('MQTT disconnect'))
  client.on('connect', () => {
    logger.info('Connected to MQTT broker here: ' + process.env.MQTT_HOST)
    subscribeToMqttTopic(client, clientId)
  })
  client.on('close', e => {
    logger.info('MQTT close:')
    logger.info(e)
  })

  global.mqttClient = client

  return client
}

export const convertToString = str => {
  return '' + str + ''
}
