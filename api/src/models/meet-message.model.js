import mongoose from 'mongoose'

const MeetMessageFileSchema = new mongoose.Schema(
  {
    url: String,
    filename: String,
  },
  { timestamps: true }
)

const MeetMessageSchema = new mongoose.Schema(
  {
    body: String,
    callId: String,
    meet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meet',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    files: [MeetMessageFileSchema]
  },
  { timestamps: true }
)

export const MeetMessageModel = mongoose.model('MeetMessage', MeetMessageSchema)
