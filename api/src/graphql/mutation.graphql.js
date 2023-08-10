import { ApolloError } from 'apollo-server'
import { SECRET, MIME_TYPES, QUANTITY, WEBRTC_SERVER_LIST, ADMIN_WEBRTC_SERVER_LIST } from '../constants'
import { UserModel } from '../models/user.model'
import { TeamModel } from '../models/team.model'
import { ChannelModel } from '../models/channel.model'
import { TaskModel } from '../models/task.model'
import { TaskMessageModel } from '../models/task-message.model'
import { MessageModel } from '../models/message.model'
import { MessageReadModel } from '../models/message-read.model'
import { MeetModel } from '../models/meet.model'
import { MeetMessageModel } from '../models/meet-message.model'
import { TeamMemberModel } from '../models/team-member.model'
import { ChannelMemberModel } from '../models/channel-member.model'
import { AppModel } from '../models/app.model'
import * as NotificationHelper from '../helpers/notification.helper'
import * as MessagingHelper from '../helpers/messaging.helper'
import { NotificationModel } from '../models/notification.model'
import { ChannelUnreadModel } from '../models/channel-unread.model'
import { ChannelNotificationModel } from '../models/channel-notification.model'
import shortid from 'shortid'
import { authenticator } from 'otplib'
import { sendEmail } from '../helpers/email.helper'
import { logger } from '../helpers/logging.helper'
import { sendMessageToMqttTopic, syncUserAppState, createReduxActionObject } from '../helpers/mqtt.helper'
import moment from 'moment'
import mongoose from 'mongoose'
import webPush from 'web-push'
import PNHelper from '../helpers/pn.helper'
import { ObjectID } from 'mongodb'
import axios from 'axios'
import cp from 'child_process'
import path from 'path'

const AWS = require('aws-sdk')
const ObjectId = mongoose.Types.ObjectId
const Expires = 60 * 60
const Bucket = process.env.AWS_S3_BUCKET
const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY
const endpoint = new AWS.Endpoint(process.env.AWS_S3_ENDPOINT)

// Authenticate with DO
const s3 = new AWS.S3({
  s3BucketEndpoint: true,
  endpoint,
  accessKeyId,
  secretAccessKey,
})

const chooseRoomServer = async () => {
  let leastSessions = 0
  let serverIndex = 0
  const sessions = await Promise.all(
    ADMIN_WEBRTC_SERVER_LIST.map(url => {
      return axios({
        method: 'post',
        url: url + '/admin',
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify({
          janus: 'list_sessions',
          transaction: 'sBJNyUhH6Vc6', // Random
          admin_secret: process.env.SECRET,
        }),
      })
    })
  )

  // Now get the least burdoned server
  sessions.map(({ data: { sessions } }, index) => {
    // Set our default
    if (index == 0) leastSessions = sessions.length

    // Decide to use this one
    if (sessions.length <= leastSessions) serverIndex = index
  })

  return WEBRTC_SERVER_LIST[serverIndex]
}

const addUserstoChannel = (users, channel, author) => {
  return Promise.all(
    users.map(user => {
      const channelId = channel.id
      const userId = user.id
      const role = author.id == userId ? 'ADMIN' : 'MEMBER'

      // The user that created the channel would have added the channel on the frontend
      // So don't need to send them these messages - only the users that are not the author
      if (author.id != userId) {
        sendMessageToMqttTopic(userId, 'JOIN_CHANNEL', channelId)
        syncUserAppState(channelId, createReduxActionObject('INCREASE_CHANNEL_TOTAL_MEMBERS', { channelId }))
      }

      return ChannelMemberModel.create({
        team: channel.team,
        channel: channelId,
        user: userId,
        name: user.name,
        username: user.username,
        role: role,
        private: channel.private,
      })
    })
  )
}

const createUniqueChannelRoomId = () => {
  const generateRandomRoomId = () => {
    return Math.floor(Math.random() * 1000000)
  }

  return new Promise(async (resolve, reject) => {
    try {
      let exists = true
      let roomId = generateRandomRoomId()

      while (exists) {
        const channel = await MeetModel.findOne({ roomId }).exec()

        if (channel) {
          exists = true
          roomId = generateRandomRoomId()
        } else {
          exists = false
        }
      }

      resolve(roomId)
    } catch (e) {
      reject(e)
    }
  })
}

const createUniqueChannelShortcode = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let exists = true
      let shortcode = shortid.generate()

      while (exists) {
        const channel = await ChannelModel.findOne({ shortcode }).exec()

        if (channel) {
          exists = true
          shortcode = shortid.generate()
        } else {
          exists = false
        }
      }

      resolve(shortcode)
    } catch (e) {
      reject(e)
    }
  })
}

const createUniqueTeamSlug = name => {
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
        const team = await TeamModel.findOne({ slug }).exec()

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

const generatePreviewImagesForAttachments = (attachments, messageId, channelId) => {
  attachments.map(rawAttachment => {
    const attachment = rawAttachment.toJSON()
    const { uri, mime } = attachment

    // We define them explicitly so we can see
    // Don't process these
    if (mime == MIME_TYPES.MEET) return
    if (mime == MIME_TYPES.TASK) return

    // If it's not a special mime type
    const attachmentId = attachment._id
    const isImage = mime.split('/')[0] == 'image'

    // Remove the protocol type & turn into array
    let uriParts = uri.replace('https://', '').split('/')

    // Remove the first index value (AWS URL value)
    uriParts.shift()

    // Combine the KEY for aws
    const Key = uriParts.join('/')
    const params = { Bucket, Key, Expires }
    const securedUrl = s3.getSignedUrl('getObject', params)

    // EVENT is irrelevant here
    if (isImage) {
      const child = cp.fork(path.resolve(__dirname, '../processes/image.preview.process.js'))

      // Send the child our data
      child.send({ uri: securedUrl, mime, channelId, messageId, attachmentId })

      // Whenn closing
      child.on('close', code => {
        console.log(`child process exited with code ${code}`)
      })
    }
  })
}

const callOutgoingWebhooksForApps = (apps, payload) => {
  // Only use the active apps
  // And send each webhook to the service
  // TODO: Checj if it's a valid webhook
  // Outgoing is array from the aggrgate operation
  apps
    .filter(app => app.active)
    .map(app => {
      const outgoing = app.outgoing[0]
      const token = app.token

      // Don't wait for it finish
      if (outgoing && token && payload) {
        const child = cp.fork(path.resolve(__dirname, '../processes/outgoing.webhook.process.js'))

        // Send the child our data
        child.send({ outgoing, token, payload })

        // Whenn closing
        child.on('close', code => {
          console.log(`child process exited with code ${code}`)
        })
      }
    })
}

const createChannelUnreadNotificationsForChannelMembers = async (channelId, teamId, messageId, parentId, mentions, threaded) => {
  const channelMembers = await ChannelMemberModel.find({ channel: channelId }).exec()
  const channelUnreads = channelMembers.map(channelMember => {
    const usernameWithAt = `@${channelMember.username}`
    const isMention = mentions ? mentions.indexOf(usernameWithAt) != -1 : false
    return {
      user: channelMember.user,
      channel: channelId,
      team: teamId,
      message: messageId,
      parent: parentId,
      mention: isMention,
      threaded: threaded,
    }
  })

  await ChannelUnreadModel.insertMany(channelUnreads)
}

export default {
  joinTeam: async (_, { slug, userId, shortcode }, ctx) => {
    try {
      const team = await TeamModel.findOne({ slug, shortcode }).exec()
      const teamId = team._id
      let quantity = team.quantity

      if (!team) return false

      // If there is no QTY (older teams)
      if (!quantity) quantity = QUANTITY

      // Find all the existing members
      const totalTeamMembers = await TeamMemberModel.countDocuments({ team: teamId, role: 'MEMBER' }).exec()

      // If the QTY of the team has been reached, then done do anything else
      if (totalTeamMembers >= quantity) return false

      const user = await UserModel.findOne({ _id: userId }).exec()

      // Add them to the team
      await TeamMemberModel.create({ team: teamId, user: userId, name: user.name, role: 'MEMBER' })

      // Send them a notification
      await NotificationHelper.createNotificationForUser('Team', 'You have joined a team', teamId, null, userId)

      // And tell them to add it on the client
      sendMessageToMqttTopic(userId, 'JOIN_TEAM', teamId)

      // This might not return true if the user is already part of it
      return true
    } catch (e) {
      logger.error(e)
      return false
    }
  },

  joinChannel: async (_, { shortcode, userId }, ctx) => {
    try {
      const channel = await ChannelModel.findOne({ shortcode }).exec()

      if (!channel) return false

      const user = await UserModel.findOne({ _id: userId }).exec()
      const channelId = channel._id
      const teamId = channel.team

      // Add them to the team
      await TeamMemberModel.create({ team: teamId, user: userId, name: user.name, username: user.username, role: 'GUEST' })

      // Add them to the channel
      await ChannelMemberModel.create({ team: teamId, channel: channelId, user: userId, name: user.name, username: user.username, role: 'GUEST' })

      // Send them a notification
      await NotificationHelper.createNotificationForUser('Channel', 'You have joined a channel', teamId, channelId, userId)

      // And tell them to add it on the client
      sendMessageToMqttTopic(userId, 'JOIN_CHANNEL', channelId)
      syncUserAppState(channelId, createReduxActionObject('INCREASE_CHANNEL_TOTAL_MEMBERS', { channelId }))

      // This might not return true if the user is already part of it
      return true
    } catch (e) {
      logger.error(e)
      return false
    }
  },

  // TODO: Remember to change the comment in channel-members.model
  // TODO: Remember to change the comment in team-members.model
  updateUser: async (_, { userId, payload }, ctx) => {
    try {
      const updatedUser = JSON.parse(payload)
      let updatedUserMember = {}

      if (updatedUser.name) updatedUserMember['name'] = updatedUser.name
      if (updatedUser.username) updatedUserMember['username'] = updatedUser.username

      if (updatedUser.name || updatedUser.username) {
        await TeamMemberModel.update({ user: userId }, { $set: updatedUserMember }, { multi: true }).exec()
        await ChannelMemberModel.update({ user: userId }, { $set: updatedUserMember }, { multi: true }).exec()
      }

      return await UserModel.findOneAndUpdate({ _id: userId }, updatedUser, {
        new: true,
      }).exec()
    } catch (e) {
      logger.error(e)
    }
  },

  createChannelNotification: async (_, { userId, channelId, every }, ctx) => {
    try {
      return await ChannelNotificationModel.create({
        channel: channelId,
        user: userId,
        every,
      })
    } catch (e) {
      logger.error(e)
    }
  },

  updateChannelNotification: async (_, { channelNotificationId, every }, ctx) => {
    try {
      return await ChannelNotificationModel.findOneAndUpdate({ _id: channelNotificationId }, { every }, { new: true }).exec()
    } catch (e) {
      logger.error(e)
    }
  },

  deleteChannelNotification: async (_, { channelNotificationId }, ctx) => {
    try {
      await ChannelNotificationModel.deleteOne({ _id: channelNotificationId }).exec()
      return true
    } catch (e) {
      logger.error(e)
      return false
    }
  },

  updateUserStarred: async (_, { userId, channelId, starred }, ctx) => {
    try {
      if (starred) {
        return await UserModel.findOneAndUpdate({ _id: userId }, { $push: { starred: [channelId] } }, { new: true }).exec()
      } else {
        return await UserModel.findOneAndUpdate({ _id: userId }, { $pull: { starred: channelId } }, { new: true }).exec()
      }
    } catch (e) {
      logger.error(e)
    }
  },

  updateUserMuted: async (_, { userId, channelId, muted }, ctx) => {
    try {
      if (muted) {
        return await UserModel.findOneAndUpdate({ _id: userId }, { $push: { muted: [channelId] } }, { new: true }).exec()
      } else {
        return await UserModel.findOneAndUpdate({ _id: userId }, { $pull: { muted: channelId } }, { new: true }).exec()
      }
    } catch (e) {
      logger.error(e)
    }
  },

  updateUserArchived: async (_, { userId, channelId, archived }, ctx) => {
    try {
      if (archived) {
        return await UserModel.findOneAndUpdate({ _id: userId }, { $push: { archived: [channelId] } }, { new: true }).exec()
      } else {
        return await UserModel.findOneAndUpdate({ _id: userId }, { $pull: { archived: channelId } }, { new: true }).exec()
      }
    } catch (e) {
      logger.error(e)
    }
  },

  createTeam: async (_, { userId, userName, payload }, ctx) => {
    try {
      const { name, description, image } = JSON.parse(payload)

      const shortcode = authenticator.generate(SECRET)
      const slug = await createUniqueTeamSlug(name)

      // Create the new team
      let team = await TeamModel.create({
        name,
        description,
        image,
        shortcode,
        slug,
      })

      // The frontend will expect this format
      team.id = team._id

      // Add the current user to the channel
      await TeamMemberModel.create({
        role: 'ADMIN',
        team: team._id,
        user: userId,
        name: userName,
      })

      // Give it back to the user
      return team
    } catch (e) {
      logger.error(e)
    }
  },

  updateTeam: async (_, { teamId, payload }, ctx) => {
    try {
      return await TeamModel.findOneAndUpdate({ _id: teamId }, JSON.parse(payload), { new: true }).exec()
    } catch (e) {
      logger.error(e)
    }
  },

  updateTeamSlug: async (_, { teamId, slug }, ctx) => {
    try {
      const stripe = require('stripe')(process.env.STRIPE_API_KEY)
      const team = await TeamModel.findOne({ _id: teamId })
      const { subscription, customer } = team

      // If there is a subscription
      // Then we update the meta data to the new slug
      if (subscription && customer) await stripe.subscriptions.update(subscription, { metadata: { slug } })

      // Now update the team as normal
      await TeamModel.findOneAndUpdate({ _id: teamId }, { slug }, { new: true }).exec()

      // Say things are cool
      return true
    } catch (e) {
      logger.error(e)
      return false
    }
  },

  updateTeamShortcode: async (_, { teamId, shortcode }, ctx) => {
    try {
      return await TeamModel.findOneAndUpdate({ _id: teamId }, { shortcode }, { new: true }).exec()
    } catch (e) {
      logger.error(e)
    }
  },

  deleteTeam: async (_, { teamId }, ctx) => {
    try {
      // Find all the channel Ids for this team
      const channels = ChannelModel.find({ team: teamId })

      // Tell everyone to leave these channels
      channels.map(channel => {
        const channelId = channel._id

        // Send a message to the channel to tell people to unsubscribe / leave
        sendMessageToMqttTopic(channelId, 'LEAVE_CHANNEL', channelId)
      })

      // Tell everyone to leave the team
      sendMessageToMqttTopic(teamId, 'LEAVE_TEAM', teamId)

      // Delete everything
      await TeamModel.deleteOne({ _id: teamId }).remove()
      await ChannelModel.deleteMany({ team: teamId }).exec()
      await TeamMemberModel.deleteMany({ team: teamId }).exec()
      await ChannelMemberModel.deleteMany({ team: teamId }).exec()
      await MessageModel.deleteMany({ team: teamId }).exec()
      await NotificationModel.deleteMany({ team: teamId }).exec()

      return true
    } catch (e) {
      logger.error(e)
      return false
    }
  },

  updateTeamMemberPosition: async (_, { teamId, userId, position }, ctx) => {
    try {
      return await TeamMemberModel.findOneAndUpdate(
        {
          team: teamId,
          user: userId,
        },
        { position }
      ).exec()
    } catch (e) {
      logger.error(e)
    }
  },

  updateTeamMemberRole: async (_, { teamId, userId, role }, ctx) => {
    try {
      return await TeamMemberModel.findOneAndUpdate(
        {
          team: teamId,
          user: userId,
        },
        { role }
      ).exec()
    } catch (e) {
      logger.error(e)
    }
  },

  deleteTeamMember: async (_, { teamId, userId }, ctx) => {
    try {
      // TODO: This might need more real world testing
      // Get a list of channel memberships for this user / team
      const channelMemberships = await ChannelMemberModel.find({ team: teamId, user: userId }).exec()

      // Go over all channels they belong to
      channelMemberships.map(channelMembership => {
        const channelId = channelMembership.channel

        // If it's private, then delete both people
        // And delete the channel
        if (channelMembership.private) {
          sendMessageToMqttTopic(channelId, 'LEAVE_CHANNEL', channelId)
          ChannelModel.deleteOne({ _id: channelId }).exec()
        } else {
          // If it's not private, then only tell this user to leave
          sendMessageToMqttTopic(userId, 'LEAVE_CHANNEL', channelId)

          // Tell the channel to decrease it's member count
          syncUserAppState(channelId, createReduxActionObject('DECREASE_CHANNEL_TOTAL_MEMBERS', { channelId }))
        }
      })

      // Delete the user from the team
      await TeamMemberModel.deleteOne({ team: teamId, user: userId }).exec()

      // Delete the user from the teamall the channels
      await ChannelMemberModel.deleteMany({ team: teamId, user: userId }).exec()

      // Finally tell the user to leave the team
      sendMessageToMqttTopic(userId, 'LEAVE_TEAM', teamId)
    } catch (e) {
      logger.error(e)
    }
  },

  inviteTeamMembers: async (_, { teamId, emails }, ctx) => {
    try {
      const team = await TeamModel.findOne({ _id: teamId })
      const { name, slug, shortcode } = team
      const removeSpaces = emails.replace(/ /g, '')
      const emailArray = removeSpaces.split(',').filter(email => email != '')

      emailArray.map(email => {
        sendEmail('TEAM', {
          email,
          name,
          slug,
          shortcode,
        })
      })
    } catch (e) {
      logger.error(e)
    }
  },

  deleteChannelSection: async (_, { channelId, sectionId }, ctx) => {
    try {
      await ChannelModel.findOneAndUpdate({ _id: channelId }, { $pull: { sections: { _id: sectionId } } })

      return true
    } catch (e) {
      logger.error(e)
      return false
    }
  },

  createChannelSection: async (_, { channelId, title, order }, ctx) => {
    try {
      const id = new ObjectID()
      const section = {
        id,
        _id: id,
        title,
        order,
      }
      await ChannelModel.findOneAndUpdate({ _id: channelId }, { $push: { sections: [section] } })

      return section
    } catch (e) {
      logger.error(e)
      return null
    }
  },

  updateChannelSection: async (_, { channelId, sectionId, title, order }, ctx) => {
    try {
      await ChannelModel.findOneAndUpdate(
        {
          '_id': channelId,
          'sections._id': sectionId,
        },
        {
          $set: {
            'sections.$.title': title,
            'sections.$.order': order,
          },
        }
      )

      return true
    } catch (e) {
      logger.error(e)
      return null
    }
  },

  updateChannelSections: async (_, { channelId, sections }, ctx) => {
    try {
      await ChannelModel.findOneAndUpdate({ _id: channelId }, { sections: JSON.parse(sections) }).exec()

      return true
    } catch (e) {
      logger.error(e)
      return null
    }
  },

  updateChannelShortcode: async (_, { channelId, generateNewCode }, ctx) => {
    try {
      let shortcode = null

      // Generate new shortcode
      if (generateNewCode) shortcode = await createUniqueChannelShortcode()

      // Update the channel
      await ChannelModel.findOneAndUpdate({ _id: channelId }, { shortcode }).exec()

      // Return it to the client
      return shortcode
    } catch (e) {
      logger.error(e)
    }
  },

  createChannel: async (_, { payload }, ctx) => {
    try {
      const { channel, user, users } = JSON.parse(payload)
      const url = shortid.generate()
      const newChannel = await ChannelModel.create({ ...channel, url })
      const author = users.filter(u => u.id == user.id)[0]

      await addUserstoChannel(users, newChannel, author)

      return newChannel
    } catch (e) {
      logger.error(e)
    }
  },

  updateChannel: async (_, { channelId, payload }, ctx) => {
    try {
      return await ChannelModel.findOneAndUpdate({ _id: channelId }, JSON.parse(payload), { new: true }).exec()
    } catch (e) {
      logger.error(e)
    }
  },

  deleteChannel: async (_, { channelId, teamId }, ctx) => {
    try {
      await ChannelModel.deleteOne({ _id: channelId }).exec()
      await ChannelMemberModel.deleteMany({ channel: channelId }).exec()
      await MessageModel.deleteMany({ channel: channelId }).exec()
      await ChannelNotificationModel.deleteMany({ channel: channelId }).exec()

      // Tell everyone to leave
      sendMessageToMqttTopic(channelId, 'LEAVE_CHANNEL', channelId)
      return true
    } catch (e) {
      logger.error(e)
      return false
    }
  },

  deleteChannelUnread: async (_, { userId, channelId, parentId, threaded }, ctx) => {
    try {
      if (parentId == null) {
        await ChannelUnreadModel.deleteMany({ channel: channelId, user: userId, threaded }).exec()
      } else {
        await ChannelUnreadModel.deleteMany({ channel: channelId, user: userId, parent: parentId, threaded }).exec()
      }
      return true
    } catch (e) {
      logger.error(e)
      return false
    }
  },

  createChannelMember: async (_, { channelId, teamId, member }, ctx) => {
    try {
      const channelMember = JSON.parse(member)
      const {
        user: { id, name, username, timezone, image },
      } = channelMember
      const userId = id

      // Add them to the channel
      const newChannelMember = await ChannelMemberModel.create({ team: teamId, channel: channelId, name, username, user: userId, role: 'MEMBER' })

      // Create a new notification
      await NotificationHelper.createNotificationForUser('Channel', 'You have joined a channel!', teamId, channelId, userId)

      // Send a message to the channel
      await MessagingHelper.createMessageFromSystem(channelId, teamId, `${name} has just joined the channel`)

      // This structure is the same structure we query with GQL
      const newChannelMemberObjectToSendChannel = {
        id: newChannelMember._id,
        user: {
          id,
          name,
          username,
          timezone,
          image,
        },
      }

      // And tell them to add it on the client
      sendMessageToMqttTopic(userId, 'JOIN_CHANNEL', channelId)

      // Always add the channelId because the app needs to know if it's the current channel
      syncUserAppState(channelId, createReduxActionObject('INCREASE_CHANNEL_TOTAL_MEMBERS', { channelId }))
      syncUserAppState(channelId, createReduxActionObject('CREATE_CHANNEL_MEMBER', { channelId, member: newChannelMemberObjectToSendChannel }))

      return true
    } catch (e) {
      return false
      logger.error(e)
    }
  },

  deleteChannelMember: async (_, { channelId, userId, memberId }, ctx) => {
    try {
      await ChannelMemberModel.findByIdAndRemove(memberId).exec()
      syncUserAppState(channelId, createReduxActionObject('DECREASE_CHANNEL_TOTAL_MEMBERS', { channelId }))
      syncUserAppState(channelId, createReduxActionObject('DELETE_CHANNEL_MEMBER', { channelId, memberId }))
      sendMessageToMqttTopic(userId, 'LEAVE_CHANNEL', channelId)
    } catch (e) {
      logger.error(e)
    }
  },

  deleteChannelMessage: async (_, { messageId }, ctx) => {
    try {
      // We are purposely not going to update Cassandra here
      // It's not worht the call for 1 rogue entry that will be
      // Cleaned up with channel/team deletions
      return await MessageModel.find({ _id: messageId })
        .remove()
        .exec()
    } catch (e) {
      logger.error(e)
    }
  },

  updateChannelMessage: async (_, { messageId, payload }, ctx) => {
    try {
      const messageData = JSON.parse(payload)
      const { mentions, body } = messageData

      // Now update our message
      let updatedMessage = await MessageModel.findOneAndUpdate({ _id: messageId }, JSON.parse(payload), { new: true }).exec()

      // And get these vaules we're about to use
      const channelId = updatedMessage.channel
      const teamId = updatedMessage.team
      const parentId = updatedMessage.parent
      const { threaded } = updatedMessage

      // Get all the apps on this channel
      const channelApps = await ChannelModel.aggregate([
        {
          $match: { _id: ObjectId(channelId) },
        },
        { $unwind: '$apps' },
        { $unwind: '$apps.app' },
        {
          $lookup: {
            from: 'apps',
            localField: 'apps.app',
            foreignField: '_id',
            as: 'app',
          },
        },
        {
          $project: {
            channelName: '$name',
            token: '$apps.token',
            active: '$apps.active',
            outgoing: '$app.outgoing',
          },
        },
      ])

      // Create an unread notification
      createChannelUnreadNotificationsForChannelMembers(channelId, teamId, messageId, parentId, mentions, threaded)

      // Call any webhooks
      callOutgoingWebhooksForApps(channelApps, body)

      // Now iterate over the message attachments & create previews
      // The actual URI for the attachment is generated inside the resolver for attachments
      generatePreviewImagesForAttachments(updatedMessage.attachments, messageId, channelId)

      // Return the message
      return updatedMessage
    } catch (e) {
      logger.error(e)
    }
  },

  createChannelMessage: async (_, { payload }, ctx) => {
    try {
      const messageData = JSON.parse(payload)
      const { mentions, parent, body } = messageData

      // Create the new message
      let newMessage = await MessageModel.create(messageData)

      // If there is a parent, then update it's updatedAt date
      // We use this to track which threads are being updated
      // If if this isn't a thread, update it anyways
      // We use this date to always sort by date on the UI
      if (parent) await MessageModel.findOneAndUpdate({ _id: parent }, { updatedAt: new Date() })

      // Carry on
      const channelId = newMessage.channel
      const teamId = newMessage.team
      const messageId = newMessage._id
      const parentId = parent
      const { threaded } = newMessage

      // If there is a parent, then update the parent to have the SAME CREATEDAT
      // This will ensure that this message will be pulled at the right time when opening a channel
      // if (messageData.parent) await MessageModel.findOneAndUpdate({ _id: messageData.parent }, { createdAt: newMessage.createdAt })

      // Send a PN to the channel
      // ⚠️ TODO: Need to make these constants
      // ⚠️ different way of managing notifications at a subscription lvel
      // new PNHelper().sendToTopic('New Message', channelId, true)
      // Get all the apps on this channel
      const channelApps = await ChannelModel.aggregate([
        {
          $match: { _id: ObjectId(channelId) },
        },
        { $unwind: '$apps' },
        { $unwind: '$apps.app' },
        {
          $lookup: {
            from: 'apps',
            localField: 'apps.app',
            foreignField: '_id',
            as: 'app',
          },
        },
        {
          $project: {
            name: '$name',
            token: '$apps.token',
            active: '$apps.active',
            outgoing: '$app.outgoing',
          },
        },
      ])

      // Call any webhooks
      callOutgoingWebhooksForApps(channelApps, body)

      // Now iterate over the message attachments & create previews
      // The actual URI for the attachment is generated inside the resolver for attachments
      generatePreviewImagesForAttachments(newMessage.attachments, messageId, channelId)

      // Create an unread notification
      createChannelUnreadNotificationsForChannelMembers(channelId, teamId, messageId, parentId, mentions, threaded)

      // Send the message object back
      return newMessage
    } catch (e) {
      logger.error(e)
    }
  },

  createChannelMessageReaction: async (_, { messageId, reaction }, ctx) => {
    try {
      return await MessageModel.findOneAndUpdate({ _id: messageId }, { $push: { reactions: [reaction] } }, { new: true }).exec()
    } catch (e) {
      logger.error(e)
    }
  },

  deleteChannelMessageReaction: async (_, { messageId, reaction }, ctx) => {
    try {
      return await MessageModel.findOneAndUpdate({ _id: messageId }, { $pull: { reactions: reaction } }, { new: true }).exec()
    } catch (e) {
      logger.error(e)
    }
  },

  createChannelMessageLike: async (_, { messageId, userId }, ctx) => {
    try {
      return await MessageModel.findOneAndUpdate({ _id: messageId }, { $push: { likes: [userId] } }, { new: true }).exec()
    } catch (e) {
      logger.error(e)
    }
  },

  deleteChannelMessageLike: async (_, { messageId, userId }, ctx) => {
    try {
      return await MessageModel.findOneAndUpdate({ _id: messageId }, { $pull: { likes: userId } }, { new: true }).exec()
    } catch (e) {
      logger.error(e)
    }
  },

  updateNotificationRead: async (_, { notificationId, read }, ctx) => {
    try {
      return await NotificationModel.findOneAndUpdate({ _id: notificationId }, { read }, { new: true }).exec()
    } catch (e) {
      logger.error(e)
    }
  },

  createChannelMessageRead: async (_, { messageId, userId, channelId, teamId }, ctx) => {
    try {
      return await MessageReadModel.create({
        message: messageId,
        user: userId,
        channel: channelId,
        team: teamId,
      })
    } catch (e) {
      logger.error(e)
      return 0
    }
  },

  updateChannelMessageRead: async (_, { messageId }, ctx) => {
    try {
      return await MessageModel.findOneAndUpdate({ _id: messageId }, { read: true }).exec()
    } catch (e) {
      console.log(e)
    }
  },

  createTask: async (_, { payload }, ctx) => {
    try {
      const { title, order, parent, user, channel, team, dueDate, description, sectionId } = JSON.parse(payload)
      let task = {
        title,
        order,
        description: description || '',
        done: false,
        parent,
        channel,
        user,
        team,
        dueDate,
        sectionId,
      }

      // Create the new task
      const newTask = await TaskModel.create(task)

      // Not add the ID
      task._id = newTask._id
      task.id = newTask._id

      return task
    } catch (e) {
      logger.error(e)
    }
  },

  updateTask: async (_, { taskId, payload }, ctx) => {
    try {
      return await TaskModel.findOneAndUpdate({ _id: taskId }, JSON.parse(payload), { new: true }).exec()
    } catch (e) {
      logger.error(e)
    }
  },

  deleteTask: async (_, { taskId }, ctx) => {
    try {
      await TaskModel.deleteOne({ _id: taskId }).exec()
      await TaskModel.deleteMany({ parent: taskId }).exec()
      await TaskMessageModel.deleteMany({ task: taskId }).exec()
      return true
    } catch (e) {
      logger.error(e)
      return false
    }
  },

  createTaskMessage: async (_, { taskId, body, userId, files }, ctx) => {
    try {
      return await TaskMessageModel.create({
        body,
        user: userId,
        task: taskId,
        files: JSON.parse(files),
      })
    } catch (e) {
      logger.error(e)
    }
  },

  createMeet: async (_, { payload }, ctx) => {
    try {
      const roomId = await createUniqueChannelRoomId()
      const { topic, channel, team } = JSON.parse(payload)
      const active = true
      const location = await chooseRoomServer()
      let meet = {
        topic,
        roomId,
        location,
        active,
        channel,
        team,
      }

      // Create the new meet
      const newMeet = await MeetModel.create(meet)

      // Not add the ID
      meet._id = newMeet._id
      meet.id = newMeet._id

      return meet
    } catch (e) {
      console.log(e)
    }
  },

  updateMeet: async (_, { meetId, payload }, ctx) => {
    try {
      return await MeetModel.findOneAndUpdate({ _id: meetId }, JSON.parse(payload), { new: true }).exec()
    } catch (e) {
      logger.error(e)
    }
  },

  deleteMeet: async (_, { meetId }, ctx) => {
    try {
      await MeetModel.deleteOne({ _id: meetId }).exec()
      await MeetMessageModel.deleteMany({ meet: meetId }).exec()
      return true
    } catch (e) {
      logger.error(e)
      return false
    }
  },

  createMeetMessage: async (_, { meetId, body, userId, files }, ctx) => {
    try {
      return await MeetMessageModel.create({
        body,
        user: userId,
        meet: meetId,
        files: JSON.parse(files),
      })
    } catch (e) {
      logger.error(e)
    }
  },
}
