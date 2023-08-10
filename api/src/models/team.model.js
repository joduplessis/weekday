import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { UserModel } from './user.model'
import { ChannelModel } from './channel.model'
import { TeamMemberModel } from './team-member.model'
import { QUANTITY } from '../constants'

const TeamSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    image: String,
    shortcode: String,
    customer: String,
    subscription: String,
    current_period_start: Date,
    current_period_end: Date,
    quantity: {
      type: Number,
      default: QUANTITY,
    },
    active: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
)

TeamSchema.pre('remove', next => {
  // ChannelModel.remove({ team: this._id }).exec()
  // TeamMemberModel.remove({ team: this._id }).exec()
  next()
})

export const TeamModel = mongoose.model('Team', TeamSchema)
