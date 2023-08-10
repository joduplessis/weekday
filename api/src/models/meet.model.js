import mongoose from 'mongoose'

const MeetSchema = new mongoose.Schema(
  {
    topic: String,
    roomId: String,
    location: String,
    active: Boolean,
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
    },
  },
  { timestamps: true }
)

export const MeetModel = mongoose.model('Meet', MeetSchema)
