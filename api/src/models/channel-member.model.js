import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { MessageModel } from './message.model'

const ChannelMemberSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
    },
    // This gets updated from:
    // - updateUser mutation
    // - account route /v1/account/:userId/update
    name: String,
    username: String,
    private: Boolean,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['ADMIN', 'MEMBER', 'GUEST'],
      default: 'MEMBER',
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
)

ChannelMemberSchema.index({ channel: 1, user: 1, team: 1 }, { unique: true })

ChannelMemberSchema.index({
  name: 'text',
})

ChannelMemberSchema.pre('remove', next => {
  //MessageModel.remove({ channel: this._id }).exec()
  next()
})

export const ChannelMemberModel = mongoose.model('ChannelMember', ChannelMemberSchema)
