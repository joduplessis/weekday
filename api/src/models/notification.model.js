import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const NotificationSchema = new mongoose.Schema(
  {
    title: String,
    body: String,
    read: Boolean,
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

export const NotificationModel = mongoose.model('Notification', NotificationSchema)
