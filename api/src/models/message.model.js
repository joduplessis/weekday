import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const AttachmentSchema = new mongoose.Schema(
  {
    uri: String,
    preview: { type: String, default: null },
    mime: String,
    name: String,
    size: Number,
  },
  { timestamps: true }
)

const MessageAppSchema = new mongoose.Schema({
  app: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'App',
  },
  resourceId: String,
  token: String,
})

const MessageSchema = new mongoose.Schema(
  {
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
    },
    pinned: Boolean,
    device: String,
    app: MessageAppSchema,
    system: Boolean,
    read: { type: Boolean, default: false },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    forwardingOriginalTime: Date,
    forwardingUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    attachments: [AttachmentSchema],
    body: {
      type: String,
      default: '',
    },
    reactions: [String],
    likes: [String],
    thread: { type: Boolean, default: false },
    threaded: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  // Leaving this out will enable us to manually edit the createdAt
  // { timestamps: true }
)

// Since we do this manually now, we need this
// So it gets auto adjusted
MessageSchema.pre('update', () => {
  this.update({},{ $set: { updatedAt: new Date() } });
});

MessageSchema.index({
  body: 'text',
})

export const MessageModel = mongoose.model('Message', MessageSchema)
