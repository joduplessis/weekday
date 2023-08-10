import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const AppActionPayloadSchema = new mongoose.Schema({
  url: String,
  width: { type: String, default: null },
  height: { type: String, default: null },
})

const AppActionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['modal', 'panel', 'webhook'],
    default: 'modal',
  },
  name: String,
  payload: AppActionPayloadSchema,
})

const AppCommandSchema = new mongoose.Schema({
  name: String,
  description: String,
  action: AppActionSchema,
})

const AppButtonSchema = new mongoose.Schema({
  icon: { type: String, default: null },
  text: String,
  action: AppActionSchema,
})

const AppMessageSchema = new mongoose.Schema({
  url: String,
  width: String,
  height: String,
  buttons: [AppButtonSchema],
})

const AppSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    image: String,
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    token: String,
    categories: [String],
    published: Boolean,
    verified: Boolean,
    featured: Boolean,
    visibility: {
      type: String,
      enum: ['none', 'community', 'team'],
      default: 'none',
    },
    support: String,
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    outgoing: String,
    commands: [AppCommandSchema], // Slash commands
    attachments: [AppButtonSchema], // Attachment pickers in compose
    tools: [AppButtonSchema], // Toolbar on right
    shortcuts: [AppButtonSchema], // Header toolbar at the top
    message: AppMessageSchema, // Message iframe & button below
  },
  { timestamps: true }
)

export const AppModel = mongoose.model('App', AppSchema)
