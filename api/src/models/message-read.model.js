import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { MessageModel } from './message.model'

const MessageReadSchema = new mongoose.Schema(
  {
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
  },
  { timestamps: true }
)

export const MessageReadModel = mongoose.model('MessageRead', MessageReadSchema)
