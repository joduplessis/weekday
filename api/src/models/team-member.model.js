import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { UserModel } from './user.model'
import { ChannelModel } from './channel.model'

const TeamMemberSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // This gets updated from:
    // - updateUser mutation
    // - account route /v1/account/:userId/update
    name: String,
    username: String,
    position: String,
    role: {
      type: String,
      enum: ['ADMIN', 'MEMBER', 'GUEST'],
      default: 'MEMBER',
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
)

TeamMemberSchema.index({ team: 1, user: 1 }, { unique: true })

TeamMemberSchema.index({
  name: 'text',
})

TeamMemberSchema.pre('remove', next => {
  //ChannelModel.remove({ team: this._id }).exec()
  next()
})

export const TeamMemberModel = mongoose.model('TeamMember', TeamMemberSchema)
