require('dotenv').config()

import bcrypt from 'bcrypt'
import path from 'path'
import fs from 'fs'
import { MAIL_FROM, ERROR } from '../constants'
import sgMail from '@sendgrid/mail'
import { logger } from '../helpers/logging.helper'
import { MessageModel } from '../models/message.model'
import { syncUserAppState, createReduxActionObject } from '../helpers/mqtt.helper'

const readChunk = require('read-chunk')
const fileType = require('file-type')
const uuidv1 = require('uuid/v1')
const AWS = require('aws-sdk')

const Expires = 60 * 60
const Bucket = process.env.AWS_S3_BUCKET
const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY
const endpoint = new AWS.Endpoint(process.env.AWS_S3_ENDPOINT)

// Authenticate with DO
const s3 = new AWS.S3({
  s3BucketEndpoint: true,
  endpoint,
  accessKeyId,
  secretAccessKey,
})

export const UploadRoute = app => {
  // Upload to filesystem
  app.post('/v1/upload/local', async (req, res) => {
    try {
      if (!req.files || Object.keys(req.files).length == 0) return res.status(400).send({ message: 'No files were uploaded.' })

      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      let { file } = req.files
      var dateObj = new Date()
      var day = dateObj.getUTCDate()
      var month = dateObj.getUTCMonth() + 1 //months from 1-12
      var year = dateObj.getUTCFullYear()
      const baseFolder = '../files'
      const subFolder = baseFolder + '/' + day + '-' + month + '-' + year
      const key = uuidv1() + '.' + file.name
      const filePath = subFolder + '/' + key
      const mime = file.mimetype

      if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder)
      if (!fs.existsSync(subFolder)) fs.mkdirSync(subFolder)

      // Use the mv() method to place the file somewhere on your server
      file.mv(filePath, err => {
        if (err) return res.status(500).send({ message: err.message || ERROR })

        const { size } = fs.statSync(filePath)
        const name = path.basename(filePath)

        res.send({
          uri,
          mime,
          size,
          name,
        })
      })
    } catch (e) {
      res.status(500).send({ message: err.message || ERROR })
    }
  })

  // Upload to S3
  app.post('/v1/upload', async (req, res) => {
    try {
      if (!req.files || Object.keys(req.files).length == 0) return res.status(400).send({ message: 'No files were uploaded.' })

      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      let { file } = req.files
      const filePath = './temp/' + file.name
      const mime = file.mimetype

      // Use the mv() method to place the file somewhere on your server
      file.mv(filePath, err => {
        if (err) return res.status(500).send({ message: err.message || ERROR })

        // Set up the file parameters
        var dateObj = new Date()
        var day = dateObj.getUTCDate()
        var month = dateObj.getUTCMonth() + 1 //months from 1-12
        var year = dateObj.getUTCFullYear()
        const folder = day + '-' + month + '-' + year
        const name = path.basename(filePath)
        const Key = folder + '/' + uuidv1() + '.' + name
        const Body = fs.createReadStream(filePath)
        const { size } = fs.statSync(filePath)

        // Create the DO config values (10 MB)
        const partSize = 10 * 1024 * 1024
        const queueSize = 10
        const options = {
          partSize,
          queueSize,
          ContentType: mime,
          ACL: 'public-read',
        }

        const params = {
          Bucket,
          Key,
          Body,
          ACL: 'public-read',
          CORSConfiguration: {
            CORSRules: [
              {
                AllowedHeaders: ['*'],
                AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                AllowedOrigins: ['*'],
                MaxAgeSeconds: 3000,
              },
            ],
          },
        }

        s3.upload(params, options, (err, data) => {
          if (!err) {
            const uri = data.Location

            res.send({
              uri,
              mime,
              size,
              name,
            })

            // If it's not an image, we will delete it
            // The image processing process will delete it if it's an image
            fs.unlink(filePath, err => {
              if (err) throw err
            })
          } else {
            res.status(500).send({ message: err.message || ERROR })
          }
        })
      })
    } catch (e) {
      res.status(500).send({ message: err.message || ERROR })
    }
  })

  // Gets a signed URL to use to post directly to S3
  app.post('/v1/upload/url', async (req, res) => {
    const { filename, mime, secured } = req.body
    var dateObj = new Date()
    var day = dateObj.getUTCDate()
    var month = dateObj.getUTCMonth() + 1
    var year = dateObj.getUTCFullYear()
    const folder = day + '-' + month + '-' + year

    try {
      const Key = folder + '/' + uuidv1() + '.' + filename
      const ACL = secured ? '' : 'public-read'
      const ContentType = mime
      const params = { Bucket, Key, Expires, ACL, ContentType }
      const url = s3.getSignedUrl('putObject', params)

      res.status(200).send({ url })
    } catch (err) {
      res.status(500).send({ message: err.message || ERROR })
    }
  })

  // Gets a signed URL for messagee attachments
  app.post('/v1/upload/get_url', async (req, res) => {
    const { filename } = req.body

    try {
      const Key = filename
      const params = { Bucket, Key, Expires }
      const url = s3.getSignedUrl('getObject', params)

      res.status(200).send({ url })
    } catch (err) {
      res.status(500).send({ message: err.message || ERROR })
    }
  })

  // This gets called from the Lambda image pocessing function
  app.post('/v1/upload/message_attachment_preview', async (req, res) => {
    try {
      const { channelId, messageId, attachmentId, preview } = req.body

      // Update the message & send the result to the user
      await MessageModel
        .findOneAndUpdate({ '_id': messageId, 'attachments._id': attachmentId }, { $set: { 'attachments.$.preview': preview } })
        .exec()

      // Sync the user's state
      syncUserAppState(
        channelId,
        createReduxActionObject('V1_UPLOAD_MESSAGE_ATTACHMENT_PREVIEW', {
          preview,
          channelId,
          messageId,
          attachmentId,
        })
      )

      res.status(200).send({ success: true })
    } catch (e) {
      console.error(e)
      res.status(500).send({ success: false })
    }
  })
}
