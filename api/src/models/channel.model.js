import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { MessageModel } from './message.model'
import { ChannelMemberModel } from './channel-member.model'

const ChannelSectionSchema = new mongoose.Schema({
  order: Number,
  title: String,
},
  { timestamps: true }
)

const ChannelSchema = new mongoose.Schema(
  {
    image: String,
    name: String,
    description: String,
    sections: [ChannelSectionSchema],
    url: String,
    excerpt: String,
    shortcode: { type: String, default: null },
    public: Boolean,
    color: { type: String, default: '#3369E7' },
    icon: String,
    private: Boolean,
    readonly: Boolean,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    apps: [
      {
        app: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'App',
        },
        active: { type: Boolean, default: false },
        token: { type: String, default: null },
      },
    ],
  },
  { timestamps: true }
)

ChannelSchema.index({
  subject: 'text',
  body: 'text',
})

ChannelSchema.pre('remove', next => {
  // MessageModel.remove({ channel: this._id }).exec()
  // ChannelMemberModel.remove({ channel: this._id }).exec()
  next()
})

export const ChannelModel = mongoose.model('Channel', ChannelSchema)
