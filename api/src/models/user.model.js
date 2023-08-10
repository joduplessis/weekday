import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const EmailSchema = new mongoose.Schema(
  {
    address: String,
    confirmed: Boolean,
    confirm: String,
  },
  { timestamps: true }
)

const DeviceSchema = new mongoose.Schema(
  {
    type: { type: String, default: null },
    token: { type: String, default: null },
  },
  { timestamps: true }
)

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      validate: username => username.split(' ').length == 1,
    },
    emails: [EmailSchema],
    password: String,
    forgotten_password: String,
    devices: [DeviceSchema],
    status: { type: String, default: '' },
    presence: String,
    dnd: Number,
    dndUntil: Date,
    timezone: String,
    name: { type: String, default: '' },
    theme: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    starred: [{ type: String, default: null }],
    archived: [{ type: String, default: null }],
    muted: [{ type: String, default: null }],
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
)

UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password)
}

UserSchema.pre('save', function(next) {
  const user = this

  // Now process the password
  if (!user.isModified('password')) return next()

  // Encrypt it
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err)

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err)

      user.password = hash

      next()
    })
  })
})

UserSchema.index({
  name: 'text',
  username: 'text',
  description: 'text',
})

export const UserModel = mongoose.model('User', UserSchema)
