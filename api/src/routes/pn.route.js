require('dotenv').config()

import { SECRET } from '../constants'
import { UserModel } from '../models/user.model'
import bcrypt from 'bcrypt'
import os from 'os'
import * as JwtHelper from '../helpers/jwt.helper'
import { authenticator } from 'otplib'
import uuid from 'uuid'
import { logger } from '../helpers/logging.helper'
import webPush from 'web-push'

export const PnRoute = app => {
  app.post('/v1/pn/subscribe/mobile', async (req, res) => {
    try {
      const { token, userId } = req.body

      // Update our token - if it's there
      const device = await UserModel.findOneAndUpdate({ '_id': userId, 'devices.type': 'mobile' }, { $set: { 'devices.$.token': token } }).exec()

      // If it's not there, then add it
      if (!device) await UserModel.findOneAndUpdate({ _id: userId }, { $push: { devices: [{ type: 'mobile', token }] } }).exec()

      res.send({ success: true })
    } catch (e) {
      console.log(e)
      res.status(500).send({ message: err.message || ERROR })
    }
  })

  app.post('/v1/pn/subscribe', async (req, res) => {
    try {
      const { subscription, userId } = req.body
      const base64Subscription = Buffer.from(JSON.stringify(subscription)).toString('base64')
      const device = await UserModel.findOneAndUpdate({ '_id': userId, 'devices.type': 'web' }, { $set: { 'devices.$.token': base64Subscription } }).exec()

      if (!device) await UserModel.findOneAndUpdate({ _id: userId }, { $push: { devices: [{ type: 'web', token: base64Subscription }] } }).exec()

      res.send({ success: true })
    } catch (e) {
      console.log(e)
      res.status(500).send({ message: err.message || ERROR })
    }
  })
}
