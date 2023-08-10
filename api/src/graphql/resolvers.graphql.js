import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'
import Query from './query.graphql'
import Mutation from './mutation.graphql'
import { TaskMessageModel } from '../models/task-message.model'
import { UserModel } from '../models/user.model'
import { TeamModel } from '../models/team.model'
import { ChannelModel } from '../models/channel.model'
import { TaskModel } from '../models/task.model'
import { MeetModel } from '../models/meet.model'
import { TeamMemberModel } from '../models/team-member.model'
import { ChannelMemberModel } from '../models/channel-member.model'
import { ChannelNotificationModel } from '../models/channel-notification.model'
import { MeetMessageModel } from '../models/meet-message.model'
import { AppModel } from '../models/app.model'
import { MessageModel } from '../models/message.model'
import { MessageReadModel } from '../models/message-read.model'
import { PAGE_LIMIT, MIME_TYPES } from '../constants'
import { logger } from '../helpers/logging.helper'
import mongoose from 'mongoose'
import { getJanusToken } from '../helpers/janus.helper'

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

export const resolvers = {
  // Mutation: {},
  // Core queries
  Mutation,
  Query,

  // These resolve type-in-type defitions in our
  // TypeDefs - Channel { user: User } etc.
  AppAction: {
    payload: async action => {
      try {
        return await action.payload
      } catch (e) {
        logger.error(e)
      }
    },
  },

  AppCommand: {
    action: async command => {
      try {
        return await command.action
      } catch (e) {
        logger.error(e)
      }
    },
  },

  AppButton: {
    action: async button => {
      try {
        return await button.action
      } catch (e) {
        logger.error(e)
      }
    },
  },

  AppMessage: {
    buttons: async message => {
      try {
        return await message.buttons
      } catch (e) {
        logger.error(e)
      }
    },
  },

  App: {
    team: async app => {
      try {
        return await TeamModel.findById(app.team)
      } catch (e) {
        logger.error(e)
      }
    },

    user: async app => {
      try {
        return await UserModel.findById(app.user)
      } catch (e) {
        logger.error(e)
      }
    },

    commands: async app => {
      try {
        return await app.toJSON().commands
      } catch (e) {
        logger.error(e)
      }
    },

    // These are not file attachments
    // They are app framework attachment buttons
    attachments: async app => {
      try {
        return await app.toJSON().attachments
      } catch (e) {
        logger.error(e)
      }
    },

    tools: async app => {
      try {
        return await app.toJSON().tools
      } catch (e) {
        logger.error(e)
      }
    },

    shortcuts: async app => {
      try {
        return await app.toJSON().shortcuts
      } catch (e) {
        logger.error(e)
      }
    },

    message: async app => {
      try {
        return await app.toJSON().message
      } catch (e) {
        logger.error(e)
      }
    },
  },

  ChannelNotification: {
    user: async channelNotification => {
      try {
        return await UserModel.findById(channelNotification.user)
      } catch (e) {
        logger.error(e)
      }
    },

    channelId: async channelNotification => {
      return channelNotification.channel
    },

    channel: async channelNotification => {
      try {
        return await ChannelModel.findById(channelNotification.channel)
      } catch (e) {
        logger.error(e)
      }
    },
  },

  ChannelUnread: {
    user: async channelUnread => {
      try {
        return await UserModel.findById(channelUnread.user)
      } catch (e) {
        logger.error(e)
      }
    },

    team: async channelUnread => {
      try {
        return await TeamModel.findById(channelUnread.team)
      } catch (e) {
        logger.error(e)
      }
    },

    parentId: async channelUnread => {
      return channelUnread.parent
    },

    parent: async channelUnread => {
      try {
        return await MessageModel.findById(channelUnread.parent)
      } catch (e) {
        logger.error(e)
      }
    },

    messageId: async channelUnread => {
      return channelUnread.message
    },

    message: async channelUnread => {
      try {
        return await MessageModel.findById(channelUnread.message)
      } catch (e) {
        logger.error(e)
      }
    },

    channelId: async channelUnread => {
      return channelUnread.channel
    },

    channel: async channelUnread => {
      try {
        return await ChannelModel.findById(channelUnread.channel)
      } catch (e) {
        logger.error(e)
      }
    },
  },

  ChannelMember: {
    user: async member => {
      try {
        return await UserModel.findById(member.user)
      } catch (e) {
        logger.error(e)
      }
    },

    team: async member => {
      try {
        return await TeamModel.findById(member.team)
      } catch (e) {
        logger.error(e)
      }
    },
  },

  ChannelApp: {
    app: async app => {
      try {
        return await AppModel.findById(app.app)
      } catch (e) {
        logger.error(e)
      }
    },
  },

  Channel: {
    sections: async (channel, _, ctx) => {
      try {
        return await channel.toJSON().sections.map(section => {
          return {
            ...section,
            id: section._id,
          }
        })
      } catch (e) {
        logger.error(e)
      }
    },

    isMember: async (channel, _, ctx) => {
      try {
        const { userId } = ctx
        const isChannelMember = await ChannelMemberModel.findOne({
          channel: channel._id,
          user: userId,
        }).exec()

        return !!isChannelMember
      } catch (e) {
        logger.error(e)
      }
    },

    totalMembers: async (channel, _, ctx) => {
      try {
        const channelMembers = await ChannelMemberModel.countDocuments({ channel: channel._id, deleted: false }).exec()

        return channelMembers
      } catch (e) {
        logger.error(e)
      }
    },

    excerpt: async channel => {
      try {
        const message = await MessageModel.findOne({ channel: channel._id, threaded: false, body: { $ne: null } })
          .sort({ createdAt: -1 })
          .exec()
        return message ? message.body : ''
      } catch (e) {
        logger.error(e)
      }
    },

    members: async (channel, _, ctx) => {
      try {
        return await ChannelMemberModel.aggregate([
          {
            $match: {
              $and: [{ channel: ObjectId(channel._id) }, { deleted: false }],
            },
          },
          { $limit: channel.private ? 1000 : 3 },
          {
            $lookup: {
              from: 'channels',
              localField: 'channel',
              foreignField: '_id',
              as: 'channel',
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $unwind: '$user',
          },
          {
            $unwind: '$channel',
          },
          {
            $project: {
              id: '$_id',
              user: {
                id: '$user._id',
                name: '$user.name',
                image: '$user.image',
                username: '$user.username',
                timezone: '$user.timezone',
                status: '$user.status',
                presence: '$user.presence',
              },
            },
          },
        ])
      } catch (e) {
        logger.error(e.message)
      }
    },

    user: async channel => {
      try {
        return channel.user
      } catch (e) {
        logger.error(e)
      }
    },

    team: async channel => {
      try {
        return channel.team
      } catch (e) {
        logger.error(e)
      }
    },

    tasks: async channel => {
      try {
        return await TaskModel.find({ channel: channel.id, parent: null }).exec()
      } catch (e) {
        logger.error(e)
      }
    },

    messages: async channel => {
      try {
        return await MessageModel.find({ channel: channel.id, threaded: false })
          .sort({ createdAt: -1 })
          .skip(0)
          .limit(PAGE_LIMIT)
          .exec()
      } catch (e) {
        logger.error(e)
      }
    },

    pinnedMessages: async channel => {
      try {
        return await MessageModel.find({ channel: channel.id, pinned: true }).exec()
      } catch (e) {
        logger.error(e)
      }
    },

    apps: async channel => {
      try {
        return channel.apps
      } catch (e) {
        logger.error(e)
      }
    },
  },

  MessageRead: {
    user: async messageRead => {
      try {
        return await UserModel.findById(messageRead.user)
      } catch (e) {
        logger.error(e)
      }
    },

    message: async messageRead => {
      try {
        return await MessageModel.findById(messageRead.message)
      } catch (e) {
        logger.error(e)
      }
    },
  },

  MessageApp: {
    app: async app => {
      try {
        return await AppModel.findById(app.app)
      } catch (e) {
        logger.error(e)
      }
    },
  },

  Message: {
    reads: async message => {
      try {
        const messageId = message._id
        const teamId = message.team
        const channelId = message.channel

        return await MessageReadModel.countDocuments({ messageId, teamId, channelId }).exec()
      } catch (e) {
        logger.error(e)
      }
    },

    forwardingUser: async message => {
      try {
        return await UserModel.findById(message.forwardingUser)
      } catch (e) {
        logger.error(e)
      }
    },

    user: async message => {
      try {
        return await UserModel.findById(message.user)
      } catch (e) {
        logger.error(e)
      }
    },

    attachments: async message => {
      try {
        return message.attachments.map(rawAttachment => {
          const attachment = rawAttachment.toJSON()
          const { mime } = rawAttachment

          // We define them explicitly so we can see
          // Don't process these
          if (mime == MIME_TYPES.MEET) return { ...attachment, id: attachment._id }
          if (mime == MIME_TYPES.TASK) return { ...attachment, id: attachment._id }

          // Remove the protocol type & turn into array
          let uriParts = attachment.uri.replace('https://', '').split('/')

          // Remove the first index value (AWS URL value)
          uriParts.shift()

          // Combine the KEY for aws
          const Key = uriParts.join('/')
          const params = { Bucket, Key, Expires }
          const securedUrl = s3.getSignedUrl('getObject', params)

          return {
            ...attachment,
            uri: securedUrl,
            id: attachment._id,
          }
        })
      } catch (e) {
        logger.error(e)
      }
    },

    hasAttachments: async message => {
      if (!message.attachments) return false
      if (message.attachments.length == 0) return false

      return true
    },

    parent: async message => {
      try {
        return await MessageModel.findById(message.parent)
      } catch (e) {
        logger.error(e)
      }
    },

    channel: async message => {
      try {
        return await ChannelModel.findById(message.channel)
      } catch (e) {
        logger.error(e)
      }
    },

    app: async message => {
      try {
        return message.app
      } catch (e) {
        logger.error(e)
      }
    },

    childMessageCount: async message => {
      try {
        return await MessageModel.countDocuments({ parent: message.id }).exec()
      } catch (e) {
        logger.error(e)
      }
    },
  },

  Notification: {
    user: async notification => {
      try {
        return await notification.user
      } catch (e) {
        logger.error(e)
      }
    },

    channel: async notification => {
      try {
        return await notification.channel
      } catch (e) {
        logger.error(e)
      }
    },

    team: async notification => {
      try {
        return await notification.team
      } catch (e) {
        logger.error(e)
      }
    },
  },

  TeamMember: {
    user: async member => {
      try {
        return await UserModel.findById(member.user)
      } catch (e) {
        logger.error(e)
      }
    },
  },

  Team: {
    position: async (team, { userId }, ctx) => {
      try {
        const { userId } = ctx
        const teamMember = await TeamMemberModel.findOne({
          team: team._id,
          user: userId,
        })

        return teamMember ? teamMember.position : 'Rockstar'
      } catch (e) {
        logger.error(e)
      }
    },

    role: async (team, { userId }, ctx) => {
      try {
        const { userId } = ctx
        const teamMember = await TeamMemberModel.findOne({
          team: team._id,
          user: userId,
        })

        return teamMember ? teamMember.role : null
      } catch (e) {
        logger.error(e)
      }
    },

    totalMembers: async (team, _, ctx) => {
      try {
        const teamMembers = await TeamMemberModel.find({ team: team._id }).exec()

        return teamMembers.length
      } catch (e) {
        logger.error(e)
      }
    },

    channels: async (team, { userId }, ctx) => {
      try {
        const teamId = team._id
        let channels = await ChannelModel.find({ team: teamId, public: true }).exec()
        const channelsUserBelongsTo = await ChannelMemberModel.find({ team: teamId, user: userId })
          .populate({
            path: 'channel',
            model: 'Channel',
            select: '_id name image readonly description url public private color icon excerpt createdAt updatedAt',
          })
          .exec()

        // Only add the channels if they are not there already
        // What is there already are only PUBLIC channelss
        channelsUserBelongsTo.map(member => {
          if (!member.channel) return
          if (channels.filter(channel => channel._id.toString() == member.channel._id.toString()).length == 0) {
            channels.push(member.channel)
          }
        })

        return channels
      } catch (e) {
        logger.error(e)
      }
    },
  },

  User: {
    channelNotifications: async user => {
      try {
        return await ChannelNotificationModel.find({ user: user._id }).exec()
      } catch (e) {
        logger.error(e)
      }
    },

    emails: async user => {
      try {
        return await user.toJSON().emails
      } catch (e) {
        logger.error(e)
      }
    },

    devices: async user => {
      try {
        return await user.toJSON().devices
      } catch (e) {
        logger.error(e)
      }
    },
  },

  Meet: {
    token: async meet => {
      return getJanusToken('janus', ['janus.plugin.videoroom'])
    },

    messages: async meet => {
      try {
        return await MeetMessageModel.find({ meet: meet.id })
          .sort({ createdAt: -1 })
          .skip(0)
          .limit(PAGE_LIMIT)
          .exec()
      } catch (e) {
        logger.error(e)
      }
    },

    team: async meet => {
      try {
        return await MeetModel.findById(meet.team)
      } catch (e) {
        logger.error(e)
      }
    },

    channel: async meet => {
      try {
        return await ChannelModel.findById(meet.channel)
      } catch (e) {
        logger.error(e)
      }
    },
  },

  MeetMessage: {
    user: async meetMessage => {
      try {
        return await UserModel.findById(meetMessage.user)
      } catch (e) {
        logger.error(e)
      }
    },

    meet: async meetMessage => {
      try {
        return await MeetModel.findById(meetMessage.task)
      } catch (e) {
        logger.error(e)
      }
    },

    files: async meetMessage => {
      try {
        return await meetMessage.toJSON().files.map(file => {
          return {
            ...file,
            id: file._id,
          }
        })
      } catch (e) {
        logger.error(e)
      }
    },
  },

  TaskMessage: {
    user: async taskMessage => {
      try {
        return await UserModel.findById(taskMessage.user)
      } catch (e) {
        logger.error(e)
      }
    },

    task: async taskMessage => {
      try {
        return await TaskModel.findById(taskMessage.task)
      } catch (e) {
        logger.error(e)
      }
    },

    files: async taskMessage => {
      try {
        return await taskMessage.toJSON().files.map(file => {
          return {
            ...file,
            id: file._id,
          }
        })
      } catch (e) {
        logger.error(e)
      }
    },
  },

  Task: {
    subtaskCount: async task => {
      try {
        return await TaskModel.countDocuments({ parent: task.id }).exec()
      } catch (e) {
        logger.error(e)
      }
    },

    parentId: async task => {
      try {
        return task.parent
      } catch (e) {
        logger.error(e)
      }
    },

    parent: async task => {
      try {
        return await TaskModel.findOne({ _id: task.parent }).exec()
      } catch (e) {
        logger.error(e)
      }
    },

    tasks: async task => {
      try {
        return await TaskModel.find({ parent: task.id }).exec()
      } catch (e) {
        logger.error(e)
      }
    },

    team: async task => {
      try {
        return await TeamModel.findById(task.team)
      } catch (e) {
        logger.error(e)
      }
    },

    channel: async task => {
      try {
        return await ChannelModel.findById(task.channel)
      } catch (e) {
        logger.error(e)
      }
    },

    messages: async task => {
      try {
        return await TaskMessageModel.find({ task: task.id })
          .sort({ createdAt: -1 })
          .skip(0)
          .limit(PAGE_LIMIT)
          .exec()
      } catch (e) {
        logger.error(e)
      }
    },

    user: async task => {
      try {
        return await UserModel.findById(task.user)
      } catch (e) {
        logger.error(e)
      }
    },
  },

  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value)
    },
    serialize(value) {
      return value
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value)
      }

      return null
    },
  }),
}
