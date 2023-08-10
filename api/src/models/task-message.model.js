import mongoose from 'mongoose'

const TaskMessageFileSchema = new mongoose.Schema(
  {
    url: String,
    filename: String,
  },
  { timestamps: true }
)

const TaskMessageSchema = new mongoose.Schema(
  {
    body: String,
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    files: [TaskMessageFileSchema]
  },
  { timestamps: true }
)

export const TaskMessageModel = mongoose.model('TaskMessage', TaskMessageSchema)
