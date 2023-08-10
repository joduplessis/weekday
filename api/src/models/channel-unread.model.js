import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { MessageModel } from './message.model'

const ChannelUnreadSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    mention: Boolean,
    threaded: Boolean,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

export const ChannelUnreadModel = mongoose.model('ChannelUnread', ChannelUnreadSchema)
