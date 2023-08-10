require('dotenv').config()

import crypto from 'crypto'
import base64url from 'base64url'

const jwt = require('jsonwebtoken')

export const encode = (payload, secret) => {
  const header = {
    typ: 'JWT',
    alg: 'HS256',
  }

  return jwt.sign(payload, secret)
}

export const decode = (token, secret) => {
  return jwt.verify(token, secret, (err, decoded) => {
    if (err) return null
    return decoded
  })
}
