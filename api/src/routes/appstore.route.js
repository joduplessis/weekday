require('dotenv').config()

import { SECRET } from '../constants'
import { UserModel } from '../models/user.model'
import { AppModel } from '../models/app.model'
import bcrypt from 'bcrypt'
import os from 'os'
import * as JwtHelper from '../helpers/jwt.helper'
import { authenticator } from 'otplib'
import sgMail from '@sendgrid/mail'
import uuid from 'uuid'
import { ChannelModel } from '../models/channel.model'
import { MessageModel } from '../models/message.model'
import { syncUserAppState } from '../helpers/mqtt.helper'
import { logger } from '../helpers/logging.helper'

const createUniqueAppSlug = name => {
  return new Promise(async (resolve, reject) => {
    try {
      let exists = true
      let append = 1
      let slug = name
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/&/g, '-and-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')

      while (exists) {
        const team = await AppModel.findOne({ slug }).exec()

        if (team) {
          exists = true
          slug = `${slug}${append}`
          append = append + 1
        } else {
          exists = false
        }
      }

      resolve(slug)
    } catch (e) {
      reject(e)
    }
  })
}

export const AppstoreRoute = app => {

  app.post('/v1/appstore/app', async (req, res) => {
    try {
      const {
        name,
        slug,
        description,
        image,
        token,
        categories,
        published,
        verified,
        featured,
        visibility,
        support,
        team,
        user,
        incoming,
        outgoing,
        commands,
        attachments,
        tools,
        shortcuts,
        message,
      } = req.body

      const app = await AppModel.create({
        name,
        slug,
        description,
        image,
        token,
        categories,
        published,
        verified,
        featured,
        visibility,
        support,
        team,
        user,
        incoming,
        outgoing,
        commands,
        attachments,
        tools,
        shortcuts,
        message,
      })

      res.send({ app })
    } catch (err) {
      logger.info(err)
      res.status(500).send({ message: err.message || ERROR })
    }
  })

  // ⚠️
  app.delete('/v1/appstore/app/:appId', async (req, res) => {
    if (!req.headers.authorization) return res.status(500).send({ message: 'Not allowed' })
    if (!req.headers.authorization.split(' ')[1]) return res.status(501).send({ message: 'Bad token' })

    try {
      //const jwt = JwtHelper.decode(req.headers.authorization.split(' ')[1], SECRET)
      const { appId } = req.params
      const channels = await ChannelModel.find({
        'apps.app': appId,
      }).exec()

      // Make these strings!
      // they are ObjectId
      const channelIds = channels.map(c => c._id + '')

      // Delete the app
      await AppModel.findOne({ _id: appId })
        .remove()
        .exec()

      // Delete the messages
      await MessageModel.deleteMany({ 'app.app': appId }).exec()

      // Send this to the socket server for processing (sending to channel)
      // Send to all
      channelIds.map(channelId => {
        // Delete the app from the channel
        ChannelModel.findOneAndUpdate({ _id: channelId }, { $pull: { apps: { app: appId } } }, { new: true })
          .exec()
          .then(res => {
            // And then tell the frontend to remove it
            syncUserAppState(channelId, {
              type: 'DELETE_CHANNEL_APP',
              payload: {
                appId,
                channelId,
              },
            })
          })
      })

      res.send({ success: true })
    } catch (err) {
      console.log(err)
      res.status(500).send({ message: err.message || ERROR })
    }
  })

  // ⚠️
  app.put('/v1/appstore/app/:appId', async (req, res) => {
    if (!req.headers.authorization) return res.status(500).send({ message: 'Not allowed' })
    if (!req.headers.authorization.split(' ')[1]) return res.status(501).send({ message: 'Bad token' })

    try {
      //const jwt = JwtHelper.decode(req.headers.authorization.split(' ')[1], SECRET)
      const { appId } = req.params
      const partialApp = req.body
      const appObject = await AppModel.findOneAndUpdate({ _id: appId }, { ...partialApp }, { new: true }).exec()

      // Mutable object
      let app = appObject.toJSON()

      // These we don't want to send
      // Because they won't change
      delete app.user
      delete app.team

      // Manually the id that hte fronten uses
      app.id = app._id

      // Get all the chnnals to update
      const channels = await ChannelModel.find({ 'apps.app': appId }).exec()
      const channelIds = channels.map(c => c._id + '')

      // Send this to the socket server for processing (sending to channel)
      channelIds.map(channelId => {
        syncUserAppState(channelId, {
          type: 'UPDATE_CHANNEL_APP_APP',
          payload: {
            app,
            appId,
            channelId,
          },
        })
      })

      res.send({ success: true })
    } catch (err) {
      console.log(err)
      res.status(500).send({ message: err.message || ERROR })
    }
  })

  app.get('/v1/appstore/app/:appId', async (req, res) => {
    if (!req.headers.authorization) return res.status(500).send({ message: 'Not allowed' })
    if (!req.headers.authorization.split(' ')[1]) return res.status(501).send({ message: 'Bad token' })

    try {
      //const jwt = JwtHelper.decode(req.headers.authorization.split(' ')[1], SECRET)
      const { appId } = req.params
      const app = await AppModel.findOne({ _id: appId })
        .populate([
          { path: 'user', model: 'User' },
          { path: 'team', model: 'Team' },
        ])
        .exec()

      res.send({ app })
    } catch (err) {
      console.log(err)
      res.status(500).send({ message: err.message || ERROR })
    }
  })

  app.get('/v1/appstore/user/:userId/apps', async (req, res) => {
    if (!req.headers.authorization) return res.status(500).send({ message: 'Not allowed' })
    if (!req.headers.authorization.split(' ')[1]) return res.status(501).send({ message: 'Bad token' })

    try {
      //const jwt = JwtHelper.decode(req.headers.authorization.split(' ')[1], SECRET)
      const { userId } = req.params
      const apps = await AppModel.find({ user: userId })
        .populate([
          { path: 'user', model: 'User' },
          { path: 'team', model: 'Team' },
        ])
        .exec()

      res.send({ apps })
    } catch (err) {
      console.log(err)
      res.status(500).send({ message: err.message || ERROR })
    }
  })

  app.get('/v1/appstore/team/:teamId/apps', async (req, res) => {
    if (!req.headers.authorization) return res.status(500).send({ message: 'Not allowed' })
    if (!req.headers.authorization.split(' ')[1]) return res.status(501).send({ message: 'Bad token' })

    try {
      //const jwt = JwtHelper.decode(req.headers.authorization.split(' ')[1], SECRET)
      const { teamId } = req.params
      const apps = await AppModel.find({ team: teamId })
        .populate([
          { path: 'user', model: 'User' },
          { path: 'team', model: 'Team' },
        ])
        .exec()

      res.send({ apps })
    } catch (err) {
      console.log(err)
      res.status(500).send({ message: err.message || ERROR })
    }
  })

  app.get('/v1/appstore/category/:categoryName/apps', async (req, res) => {
    if (!req.headers.authorization) return res.status(500).send({ message: 'Not allowed' })
    if (!req.headers.authorization.split(' ')[1]) return res.status(501).send({ message: 'Bad token' })

    try {
      //const jwt = JwtHelper.decode(req.headers.authorization.split(' ')[1], SECRET)
      const { categoryName } = req.params
      const apps = await AppModel.find({ categories: categoryName })
        .populate([
          { path: 'user', model: 'User' },
          { path: 'team', model: 'Team' },
        ])
        .exec()

      res.send({ apps })
    } catch (err) {
      console.log(err)
      res.status(500).send({ message: err.message || ERROR })
    }
  })

  app.get('/v1/appstore/apps', async (req, res) => {
    if (!req.headers.authorization) return res.status(500).send({ message: 'Not allowed' })
    if (!req.headers.authorization.split(' ')[1]) return res.status(501).send({ message: 'Bad token' })

    try {
      //const jwt = JwtHelper.decode(req.headers.authorization.split(' ')[1], SECRET)
      const apps = await AppModel.find({})
        .populate([
          { path: 'user', model: 'User' },
          { path: 'team', model: 'Team' },
        ])
        .exec()

      res.send({ apps })
    } catch (err) {
      console.log(err)
      res.status(500).send({ message: err.message || ERROR })
    }
  })

  app.get('/v1/appstore/channel/:channelId/apps', async (req, res) => {
    if (!req.headers.authorization) return res.status(500).send({ message: 'Not allowed' })
    if (!req.headers.authorization.split(' ')[1]) return res.status(501).send({ message: 'Bad token' })

    try {
      //const jwt = JwtHelper.decode(req.headers.authorization.split(' ')[1], SECRET)
      const { channelId } = req.params
      const channel = await ChannelModel.findOne({ _id: channelId })
        .populate({
          path: 'apps.app',
          model: 'App',
          populate: [
            { path: 'user', model: 'User' },
            { path: 'team', model: 'Team' },
          ],
        })
        .exec()

      res.send({
        apps: channel.apps.map(app => {
          return {
            ...app.app.toJSON(),
            active: app.active,
          }
        }),
      })
    } catch (err) {
      console.log(err)
      res.status(500).send({ message: err.message || ERROR })
    }
  })

  // ⚠️
  app.post('/v1/appstore/channel/:channelId/app/:appId', async (req, res) => {
    if (!req.headers.authorization) return res.status(500).send({ message: 'Not allowed' })
    if (!req.headers.authorization.split(' ')[1]) return res.status(501).send({ message: 'Bad token' })

    try {
      //const jwt = JwtHelper.decode(req.headers.authorization.split(' ')[1], SECRET)
      const { appId, channelId } = req.params
      const channel = await ChannelModel.findOneAndUpdate({ _id: channelId }, { $push: { apps: [{ app: appId, active: true, token: uuid() }] } }, { new: true })
        .populate({
          path: 'apps.app',
          model: 'App',
        })
        .exec()

      // Get the app that was just added
      const app = channel.apps.filter(channelApp => channelApp.app._id == appId)[0].toJSON()
      const appWithId = {
        ...app,
        app: {
          ...app.app,
          id: app.app._id,
        },
      }

      // Send this to the socket server for processing (sending to channel)
      syncUserAppState(channelId, {
        type: 'CREATE_CHANNEL_APP',
        payload: {
          channelId,
          app: appWithId,
        },
      })

      res.send({ success: true })
    } catch (err) {
      console.log(err)
      res.status(500).send({ message: err.message || ERROR })
    }
  })

  // ⚠️
  app.delete('/v1/appstore/channel/:channelId/app/:appId', async (req, res) => {
    if (!req.headers.authorization) return res.status(500).send({ message: 'Not allowed' })
    if (!req.headers.authorization.split(' ')[1]) return res.status(501).send({ message: 'Bad token' })

    try {
      //const jwt = JwtHelper.decode(req.headers.authorization.split(' ')[1], SECRET)
      const { appId, channelId } = req.params
      const channel = await ChannelModel.findOneAndUpdate({ _id: channelId }, { $pull: { apps: { app: appId } } }, { new: true }).exec()

      // Send this to the socket server for processing (sending to channel)
      // TODO: Needs to be governed with RabbitMQ
      syncUserAppState(channelId, {
        type: 'DELETE_CHANNEL_APP',
        payload: {
          appId,
          channelId,
        },
      })

      res.send({ success: true })
    } catch (err) {
      console.log(err)
      res.status(500).send({ message: err.message || ERROR })
    }
  })

  // ⚠️
  app.put('/v1/appstore/channel/:channelId/app/:appId/active', async (req, res) => {
    if (!req.headers.authorization) return res.status(500).send({ message: 'Not allowed' })
    if (!req.headers.authorization.split(' ')[1]) return res.status(501).send({ message: 'Bad token' })

    try {
      //const jwt = JwtHelper.decode(req.headers.authorization.split(' ')[1], SECRET)
      const { appId, channelId } = req.params
      const { active } = req.body

      await ChannelModel.findOneAndUpdate({ '_id': channelId, 'apps.app': appId }, { $set: { 'apps.$.active': active } }, { new: true }).exec()

      // Send this to the socket server for processing (sending to channel)
      // TODO: Needs to be governed with RabbitMQ
      syncUserAppState(channelId, {
        type: 'UPDATE_CHANNEL_APP_ACTIVE',
        payload: {
          appId,
          active,
          channelId,
        },
      })

      res.send({ success: true })
    } catch (err) {
      console.log(err)
      res.status(500).send({ message: err.message || ERROR })
    }
  })
}
