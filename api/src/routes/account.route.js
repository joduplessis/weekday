import { SECRET } from '../constants'
import { UserModel } from '../models/user.model'
import bcrypt from 'bcrypt'
import os from 'os'
import * as JwtHelper from '../helpers/jwt.helper'
import { authenticator } from 'otplib'
import { TeamMemberModel } from '../models/team-member.model'
import { ChannelMemberModel } from '../models/channel-member.model'
import { sendEmail } from '../helpers/email.helper'
import { logger } from '../helpers/logging.helper'

require('dotenv').config()

export const AccountRoute = app => {
  app.put('/v1/account/:userId/email/confirm', async (req, res) => {
    const { userId } = req.params
    const address = req.body.email.toLowerCase()
    const confirm = authenticator.generate(SECRET)
    const confirmed = false

    // Create a new unconfrimed user
    // And set their confirmation code
    return UserModel.findOneAndUpdate(
      {
        '_id': userId,
        'emails.address': address,
      },
      {
        $set: { 'emails.$.confirmed': confirmed, 'emails.$.confirm': confirm },
      }
    )
      .exec()
      .then(user => {
        sendEmail('CONFIRM', {
          email: address,
          token: confirm,
        })

        // Send back the okay
        return res.status(200).send(user)
      })
      .catch(err => {
        if (err.code == 11000) {
          return res.status(401).send({ error: true })
        } else {
          return res.status(500).send({ error: true })
        }
      })
  })

  app.put('/v1/account/:userId/email/add', async (req, res) => {
    const { userId } = req.params
    const address = req.body.email.toLowerCase()
    const confirm = authenticator.generate(SECRET)
    const confirmed = false

    // First look for existing people
    const existingUser = await UserModel.findOne({ 'emails.address': address })

    // If this user exists, then return
    if (existingUser) return res.status(401).send({ error: true })

    // Create a new unconfrimed user
    // And set their confirmation code
    return UserModel.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        $push: { emails: [{ address, confirmed, confirm }] },
      }
    )
      .exec()
      .then(user => {
        sendEmail('CONFIRM', {
          email: address,
          token: confirm,
        })

        // Send back the okay
        return res.status(200).send(user)
      })
      .catch(err => {
        if (err.code == 11000) {
          return res.status(401).send({ error: true })
        } else {
          return res.status(500).send({ error: true })
        }
      })
  })

  app.put('/v1/account/:userId/email/delete', async (req, res) => {
    const { userId } = req.params
    const address = req.body.email.toLowerCase()

    return UserModel.findOneAndUpdate({ _id: userId }, { $pull: { emails: { address } } })
      .exec()
      .then(user => res.status(200).send(user))
      .catch(err => res.status(500).send({ error: true }))
  })

  app.put('/v1/account/:userId/password/update', async (req, res) => {
    const { currentPassword, newPassword } = req.body
    const { userId } = req.params
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(newPassword, salt)

    // Authenticate the user's current password first
    const user = await UserModel.findOne({ _id: userId }).exec()
    const same = await user.comparePassword(currentPassword)

    if (!same) return res.status(401).send({ message: 'Wrong password' })

    return UserModel.findOneAndUpdate({ _id: userId }, { password: hash })
      .exec()
      .then(user => {
        // If we find no user
        if (!user) return res.status(404).send({ message: 'User not found' })

        return res.status(200).send({ success: true })
      })
      .catch(err => {
        return res.status(500).send({ error: true })
      })
  })

  app.put('/v1/account/password/reset', async (req, res) => {
    const { email } = req.body
    const forgotten_password = authenticator.generate(SECRET)

    return UserModel.findOneAndUpdate({ 'emails.address': email }, { forgotten_password })
      .exec()
      .then(user => {
        // If we find no user
        if (!user) return res.status(404).send({ message: 'User not found' })

        // Send them the email
        sendEmail('PASSWORD', {
          email: email,
          token: forgotten_password,
        })

        return res.status(200).send({ success: true })
      })
      .catch(err => {
        return res.status(500).send({ message: 'Error' })
      })
  })

  app.put('/v1/account/password/reset/update', async (req, res) => {
    const { email, password, code } = req.body
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    return UserModel.findOneAndUpdate(
      {
        'emails.address': email,
        'forgotten_password': code,
      },
      {
        password: hash,
        forgotten_password: null,
      }
    )
      .exec()
      .then(user => {
        // If we find no user
        if (!user) return res.status(404).send({ message: 'User not found' })

        return res.status(200).send({ success: true })
      })
      .catch(err => {
        return res.status(500).send({ error: true })
      })
  })

  app.post('/v1/account/signup', async (req, res) => {
    const host = os.hostname()
    const { username, password } = req.body
    const address = req.body.email.toLowerCase()
    const confirm = authenticator.generate(SECRET)
    const confirmed = false

    // First look for existing people
    const existingUser = await UserModel.findOne({
      'emails.address': address,
    }).exec()

    // If this user exists, then return
    if (existingUser) return res.status(401).send({ error: true })

    // Create a new unconfrimed user
    // And set their confirmation code
    return UserModel.create({
      username,
      password,
      emails: [
        {
          address,
          confirm,
          confirmed,
        },
      ],
    })
      .then(user => {
        sendEmail('CONFIRM', {
          email: address,
          token: confirm,
        })

        // Generate our JWT (like a login)
        const token = JwtHelper.encode(
          {
            iss: host,
            sub: user._id,
            userId: user._id,
            exp: Date.now() / 1000 + 60 * 60 * 24 * 14,
          },
          SECRET
        )

        // Send back the okay
        return res.status(200).send({ user, token })
      })
      .catch(err => {
        console.log(err)
        if (err.code == 11000) {
          return res.status(401).send({ error: true })
        } else {
          return res.status(500).send({ error: true })
        }
      })
  })

  // Legacy Zapier v1.0 app ⚠️
  app.post('/v1/account/signin/zapier', async (req, res) => {
    try {
      const host = os.hostname()
      const base64 = req.headers.authorization.split(' ')[1]
      const str = new Buffer(base64, 'base64')
      const username = str.toString('ascii').split(':')[0]
      const password = str.toString('ascii').split(':')[1]

      return UserModel.findOne({ username, $or: [{ deleted: false }, { deleted: null }] })
        .exec()
        .then(usr => {
          // If we find no user
          if (!usr) return res.status(404).send({ message: 'User not found' })

          // If the passwords don't match
          return usr
            .comparePassword(password)
            .then(same => {
              if (!same) return res.status(401).send({ message: 'Wrong password' })

              // If all is good
              return res.status(200).send({ username })
            })
            .catch(err => {
              return res.status(500).send({ message: 'Comparison error' })
            })
          })
        .catch(err => {
          return res.status(500).send({ message: 'Error' })
        })
    } catch (e) {
      return res.status(500).send({ message: 'Error' })
    }
  })

  app.post('/v1/account/signin', async (req, res) => {
    try {
      const host = os.hostname()
      const { username, password } = req.body

      return UserModel.findOne({ username, $or: [{ deleted: false }, { deleted: null }] })
        .exec()
        .then(usr => {
          // If we find no user
          if (!usr) return res.status(404).send({ message: 'User not found' })

          // If the passwords don't match
          return usr
            .comparePassword(password)
            .then(same => {
              if (!same) return res.status(401).send({ message: 'Wrong password' })

              const jwt = {
                userId: usr._id,
                token: JwtHelper.encode(
                  {
                    iss: host,
                    sub: usr._id,
                    userId: usr._id,
                    exp: Date.now() / 1000 + 60 * 60 * 24 * 14,
                  },
                  SECRET
                ),
              }

              // If all is good
              return res.status(200).send(jwt)
            })
            .catch(err => {
              return res.status(500).send({ message: 'Comparison error' })
            })
        })
        .catch(err => {
          return res.status(500).send({ message: 'Error' })
        })
    } catch (e) {
      return res.status(500).send({ message: 'Error' })
    }
  })

  app.delete('/v1/account/:userId/delete', async (req, res) => {
    const { userId } = req.params

    try {
      await UserModel.findOneAndUpdate({ _id: userId }, { deleted: true }).exec()
      await TeamMemberModel.updateMany({ user: userId }, { deleted: true }).exec()
      await ChannelMemberModel.updateMany({ user: userId }, { deleted: true }).exec()

      return res.status(200).send({ success: true })
    } catch (e) {
      return res.status(500).send({ error: true })
    }
  })

  // This gets called from the AUTH page when onboarding
  // See updateUser in mutation.graphql
  // TODO: Remember to change the comment in channel-members.model
  // TODO: Remember to change the comment in team-members.model
  app.put('/v1/account/:userId/update', async (req, res) => {
    const updatedUser = req.body
    const { userId } = req.params
    let updatedUserMember = {}

    if (updatedUser.name) updatedUserMember['name'] = updatedUser.name
    if (updatedUser.username) updatedUserMember['username'] = updatedUser.username

    try {
      if (updatedUser.name || updatedUser.username) {
        await TeamMemberModel.update({ user: userId }, { $set: updatedUserMember }, { multi: true }).exec()
        await ChannelMemberModel.update({ user: userId }, { $set: updatedUserMember }, { multi: true }).exec()
      }

      await UserModel.findOneAndUpdate({ _id: userId }, updatedUser).exec()

      return res.status(200).send({ success: true })
    } catch (e) {
      return res.status(500).send({ error: true })
    }
  })

  // Account confirmation
  app.get('/account/confirmation/:email/:token', async (req, res) => {
    const { email, token } = req.params

    // Finds a user based on
    // 1) email address
    // 2) confirmation token
    // And then sets that address as confirmed
    const user = await UserModel.findOneAndUpdate(
      {
        'emails.confirm': token,
        'emails.address': email,
      },
      {
        $set: { 'emails.$.confirmed': true },
      }
    ).exec()

    // If they've been found or not
    if (user) {
      res.render('confirmation', { confirmed: true })
    } else {
      res.render('confirmation', { confirmed: false })
    }
  })
}
