import mongoose from 'mongoose'

const TaskSchema = new mongoose.Schema(
  {
    title: String,
    description: {
      type: String,
      default: '',
    },
    done: Boolean,
    order: Number,
    sectionId: String,
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dueDate: Date,
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
    },
  },
  { timestamps: true }
)

export const TaskModel = mongoose.model('Task', TaskSchema)
