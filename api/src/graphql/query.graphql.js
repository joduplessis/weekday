import { ApolloError } from 'apollo-server'
import { PAGE_LIMIT } from '../constants'
import { UserModel } from '../models/user.model'
import { TeamModel } from '../models/team.model'
import { TeamMemberModel } from '../models/team-member.model'
import { ChannelMemberModel } from '../models/channel-member.model'
import { MessageReadModel } from '../models/message-read.model'
import { ChannelModel } from '../models/channel.model'
import { TaskModel } from '../models/task.model'
import { TaskMessageModel } from '../models/task-message.model'
import { MeetModel } from '../models/meet.model'
import { MeetMessageModel } from '../models/meet-message.model'
import { MessageModel } from '../models/message.model'
import { NotificationModel } from '../models/notification.model'
import { logger } from '../helpers/logging.helper'
import mongoose from 'mongoose'
import { ChannelUnreadModel } from '../models/channel-unread.model'
import { ChannelNotificationModel } from '../models/channel-notification.model'

const ObjectId = mongoose.Types.ObjectId

export default {
  user: async (_, { userId }, ctx) => {
    try {
      return await UserModel.findOne({ _id: userId })
    } catch (e) {
      logger.error(e.message)
    }
  },

  users: async (_, { userIds }, ctx) => {
    try {
      return await UserModel.find({
        $or: [{ emails: { $in: userIds.split(',') } }, { username: { $in: userIds.split(',') } }],
      })
    } catch (e) {
      logger.error(e.message)
    }
  },

  channelUnreads: async (_, { teamId, userId }, ctx) => {
    try {
      return await ChannelUnreadModel.find({ team: teamId, user: userId }).exec()
    } catch (e) {
      logger.error(e.message)
    }
  },

  team: async (_, { teamId, userId }, ctx) => {
    try {
      return await TeamModel.findOne({ _id: teamId })
    } catch (e) {
      logger.error(e.message)
    }
  },

  teamSlug: async (_, { slug }, ctx) => {
    try {
      return await TeamModel.findOne({ slug })
    } catch (e) {
      logger.error(e.message)
    }
  },

  teams: async (_, { userId }, ctx) => {
    try {
      const teamsUserBelongsTo = await TeamMemberModel.find({ user: userId })
        .populate({
          path: 'team',
          model: 'Team',
          select: '_id name image description',
        })
        .exec()

      return teamsUserBelongsTo.map(teamMember => teamMember.team)
    } catch (e) {
      logger.error(e.message)
    }
  },

  channelShortcode: async (_, { shortcode }, ctx) => {
    try {
      return await ChannelModel
        .findOne({ shortcode })
        .populate([
          {
            path: 'team',
            ref: 'Team',
          },
          {
            path: 'user',
            ref: 'User',
          },
        ])
    } catch (e) {
      logger.error(e.message)
    }
  },

  channels: async (_, { teamId, userId }, ctx) => {
    try {
      let channels = await ChannelModel.find({ team: teamId, public: true }).exec()
      const channelsUserBelongsTo = await ChannelMemberModel.find({ team: teamId, user: userId })
        .populate({
          path: 'channel',
          model: 'Channel',
          select: '_id name image description url public private color icon excerpt createdAt updatedAt',
        })
        .exec()

      // Only add the channels if they are not there already
      // What is there already are only PUBLIC channelss
      channelsUserBelongsTo.map(member => {
        if (channels.filter(channel => channel._id == member.channel._id).length == 0) {
          channels.push(member.channel)
        }
      })

      return channels
    } catch (e) {
      logger.error(e.message)
    }
  },

  channelTask: async (_, { taskId }, ctx) => {
    try {
      return await TaskModel.findOne({ _id: taskId }).exec()
    } catch (e) {
      logger.error(e.message)
    }
  },

  channelTasks: async (_, { channelId }, ctx) => {
    try {
      return await TaskModel.find({ channel: channelId }).exec()
    } catch (e) {
      logger.error(e.message)
    }
  },

  meets: async (_, { searchCriteria }, ctx) => {
    try {
      return await MeetModel.find(JSON.parse(searchCriteria)).exec()
    } catch (e) {
      logger.error(e.message)
    }
  },

  meet: async (_, { meetId }, ctx) => {
    try {
      return await MeetModel.findOne({ _id: meetId })
    } catch (e) {
      logger.error(e.message)
    }
  },

  meetMessages: async (_, { meetId, page }, ctx) => {
    try {
      return await MeetMessageModel.find({ meet: meetId })
        .sort({ createdAt: -1 })
        .skip(PAGE_LIMIT * page)
        .limit(PAGE_LIMIT)
        .exec()
    } catch (e) {
      logger.error(e.message)
    }
  },

  tasks: async (_, { searchCriteria }, ctx) => {
    try {
      return await TaskModel.find(JSON.parse(searchCriteria)).exec()
    } catch (e) {
      logger.error(e.message)
    }
  },

  task: async (_, { taskId }, ctx) => {
    try {
      return await TaskModel.findOne({ _id: taskId })
    } catch (e) {
      logger.error(e.message)
    }
  },

  taskMessages: async (_, { taskId, page }, ctx) => {
    try {
      return await TaskMessageModel.find({ task: taskId })
        .sort({ createdAt: -1 })
        .skip(PAGE_LIMIT * page)
        .limit(PAGE_LIMIT)
        .exec()
    } catch (e) {
      logger.error(e.message)
    }
  },

  channel: async (_, { channelId }, ctx) => {
    try {
      const { userId } = ctx
      const channel = await ChannelModel.findOne({ _id: channelId }).populate([
        {
          path: 'team',
          ref: 'Team',
        },
        {
          path: 'user',
          ref: 'User',
        },
      ])

      return channel
    } catch (e) {
      logger.error(e.message)
    }
  },

  teamMembers: async (_, { teamId, page }, ctx) => {
    try {
      return await TeamMemberModel.find({ team: teamId, deleted: false })
        .sort({ createdAt: -1 })
        .skip(PAGE_LIMIT * page)
        .limit(PAGE_LIMIT)
        .exec()
    } catch (e) {
      logger.error(e.message)
    }
  },

  channelMembers: async (_, { channelId, page }, ctx) => {
    try {
      return await ChannelMemberModel.find({ channel: channelId, deleted: false })
        .sort({ createdAt: -1 })
        .skip(PAGE_LIMIT * page)
        .limit(PAGE_LIMIT)
        .exec()
    } catch (e) {
      logger.error(e.message)
    }
  },

  isTeamMember: async (_, { teamId, userId }, ctx) => {
    try {
      const teamMember = await TeamMemberModel.findOne({ team: teamId, user: userId }).exec()

      return !!teamMember
    } catch (e) {
      logger.error(e.message)
      return false
    }
  },

  isChannelMember: async (_, { channelId, userId }, ctx) => {
    try {
      const channelMember = await ChannelMemberModel.findOne({ channel: channelId, user: userId }).exec()

      return !!channelMember
    } catch (e) {
      logger.error(e.message)
      return false
    }
  },

  channelMessageReads: async (_, { messageId }, ctx) => {
    try {
      return await MessageReadModel.find({ message: messageId }).exec()
    } catch (e) {
      logger.error(e)
      return 0
    }
  },

  message: async (_, { messageId }, ctx) => {
    try {
      return await MessageModel.findOne({ _id: messageId }).exec()
    } catch (e) {
      logger.error(e.message)
    }
  },

  messageMessages: async (_, { messageId, page }, ctx) => {
    try {
      return await MessageModel.find({ parent: messageId }).exec()
    } catch (e) {
      logger.error(e.message)
    }
  },

  threads: async (_, { channelId }, ctx) => {
    try {
      return await MessageModel.find({ channel: channelId, thread: true }).sort({ updatedAt: -1 }).exec()
    } catch (e) {
      logger.error(e.message)
    }
  },

  channelMessages: async (_, { channelId, page }, ctx) => {
    /*
    Keeping it here for reference
    But this is not used anymore:

    channelMessages: async (_, { channelId, oldest }) => {
      const start = moment(oldest).subtract(2, "hours").toDate()
      const end = moment(oldest).toDate()
      return await MessageModel
        .find({ channel: channelId, createAt: { $gte: start, $lte: end } })
        .sort({ createdAt: -1 })
        .exec()
    },
    */
    try {
      return await MessageModel.find({ channel: channelId, threaded: false })
        .sort({ createdAt: -1 })
        .skip(PAGE_LIMIT * page)
        .limit(PAGE_LIMIT)
        .exec()
    } catch (e) {
      logger.error(e.message)
    }
  },

  channelAttachments: async (_, { channelId, page }, ctx) => {
    try {
      return await MessageModel.find({
        channel: channelId,
        threaded: false,
        attachments: {
          $exists: true,
          $not: { $size: 0 },
          $ne : null
        },
      })
        .sort({ createdAt: -1 })
        .skip(PAGE_LIMIT * page)
        .limit(PAGE_LIMIT)
        .exec()
    } catch (e) {
      logger.error(e.message)
    }
  },

  searchMessages: async (_, { channelId, query }, ctx) => {
    try {
      return await MessageModel.find({
        channel: channelId,
        threaded: false,
        body: { $regex: query, $options: 'i' },
      })
        .sort({ createdAt: -1 })
        .exec()
    } catch (e) {
      logger.error(e.message)
    }
  },

  searchTeamMembers: async (_, { teamId, query, page }, ctx) => {
    try {
      return await TeamMemberModel.aggregate([
        {
          $match: {
            $and: [
              { team: ObjectId(teamId) },
              { deleted: false },
              { $or: [
                { name: new RegExp(query, 'i') },
                { username: new RegExp(query, 'i') }
              ]}
            ],
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: PAGE_LIMIT * page },
        { $limit: PAGE_LIMIT },
        {
          $lookup: {
            from: 'teams',
            localField: 'team',
            foreignField: '_id',
            as: 'team',
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
          $unwind: '$team',
        },
        {
          $project: {
            id: '$_id',
            role: '$role',
            user: {
              _id: '$user._id',
              id: '$user._id',
              name: '$user.name',
              image: '$user.image',
              username: '$user.username',
              timezone: '$user.timezone',
            },
          },
        },
      ])
    } catch (e) {
      logger.error(e.message)
    }
  },

  searchChannelMembers: async (_, { channelId, query, page }, ctx) => {
    try {
      return await ChannelMemberModel.aggregate([
        {
          $match: {
            $and: [
              { channel: ObjectId(channelId) },
              { $or: [
                { name: new RegExp(query, 'i') },
                { username: new RegExp(query, 'i') }
              ]},
              { deleted: false },
            ]
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: PAGE_LIMIT * page },
        { $limit: PAGE_LIMIT },
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
              _id: '$user._id',
              id: '$user._id',
              name: '$user.name',
              image: '$user.image',
              username: '$user.username',
              timezone: '$user.timezone',
            },
          },
        },
      ])
    } catch (e) {
      logger.error(e.message)
    }
  },

  notifications: async (_, { userId, page }, ctx) => {
    try {
      return await NotificationModel.aggregate([
        {
          $match: { user: ObjectId(userId), read: false },
        },
        {
          "$sort": { "createdAt": -1 }
        },
        {
          "$skip": PAGE_LIMIT * page
        },
        {
          "$limit": PAGE_LIMIT
        },
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
            from: 'teams',
            localField: 'team',
            foreignField: '_id',
            as: 'team',
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
          $unwind: '$team',
        },
        {
          $unwind: {
            'path': '$channel',
            'preserveNullAndEmptyArrays': true
          }
        },
        {
          $project: {
            id: '$_id',
            body: '$body',
            read: '$read',
            title: '$title',
            createdAt: '$createdAt',
            channel: {
              _id: '$channel._id',
              id: '$channel._id',
              name: '$channel.name',
              image: '$channel.image',
            },
            team: {
              _id: '$team._id',
              id: '$team._id',
              name: '$team.name',
              image: '$team.image',
            },
            user: {
              _id: '$user._id',
              id: '$user._id',
              name: '$user.name',
              image: '$user.image',
              username: '$user.username',
            },
          },
        },
      ])
    } catch (e) {
      logger.error(e.message)
    }
  },
}
