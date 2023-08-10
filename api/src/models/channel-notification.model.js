import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { MessageModel } from './message.model'

const ChannelNotificationSchema = new mongoose.Schema(
  {
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
    },
    every: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

export const ChannelNotificationModel = mongoose.model('ChannelNotification', ChannelNotificationSchema)
