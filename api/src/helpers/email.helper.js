require('dotenv').config()

import Handlebars from 'handlebars'
import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'

// Set up our SES
const AWSSES = require('aws-sdk')
const accessKeyId = process.env.AWS_SES_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SES_SECRET_ACCESS_KEY
const region = process.env.AWS_SES_REGION
const apiVersion = '2010-12-01'
const sesInstance = new AWSSES.SES({
  region,
  accessKeyId,
  secretAccessKey,
  apiVersion,
})

export const sendEmail = async (type, payload) => {
  try {
    switch (type) {
      case 'TEAM':
        await team(payload)
        break
      case 'CONFIRM':
        await confirm(payload)
        break
      case 'PASSWORD':
        await password(payload)
        break
    }
  } catch (e) {
    console.log(e)
  }
}

const team = ({ email, name, slug, shortcode }) => {
  const text = fs.readFileSync(path.resolve(__dirname, '../templates/team.html'), 'utf8')
  const template = Handlebars.compile(text)
  const html = template({ name, slug, shortcode })
  const ses = sesInstance
  const params = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: html,
        },
        Text: {
          Charset: 'UTF-8',
          Data: `You have been invited to join ${name} @ https://app.weekday.work/t/${slug} - use shortcode: ${shortcode}`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `You have been invited to join ${name}`,
      },
    },
    Source: 'noreply@weekday.work',
  }

  return ses.sendEmail(params).promise()
}

const confirm = ({ email, token }) => {
  const url = process.env.NODE_ENV == 'development'
  ? `http://${process.env.HOST}:${process.env.PORT}/account/confirmation/${email}/${token}`
  : `http://api.weekday.work/account/confirmation/${email}/${token}`
  const text = fs.readFileSync(path.resolve(__dirname, '../templates/confirm.html'), 'utf8')
  const template = Handlebars.compile(text)
  const html = template({ token, email, url })
  const ses = sesInstance

  const params = {
    Destination: {
      ToAddresses: [email],
    },
    Source: 'noreply@weekday.work',
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: html,
        },
        Text: {
          Charset: 'UTF-8',
          Data: `Visit the following link to confirm your email address: ${url}`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `Please confirm your email address`,
      },
    },
  }

  return ses.sendEmail(params).promise()
}

const password = ({ email, token }) => {
  const text = fs.readFileSync(path.resolve(__dirname, '../templates/password.html'), 'utf8')
  const template = Handlebars.compile(text)
  const html = template({ token })
  const ses = sesInstance
  const params = {
    Destination: {
      ToAddresses: [email],
    },
    Source: 'noreply@weekday.work',
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: html,
        },
        Text: {
          Charset: 'UTF-8',
          Data: `Your forgotten password code is ${token}`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `Forgotten password code`,
      },
    },
  }

  return ses.sendEmail(params).promise()
}
