require('dotenv').config()

import { SECRET } from '../constants'
import bcrypt from 'bcrypt'
import os from 'os'
import * as JwtHelper from '../helpers/jwt.helper'
import { authenticator } from 'otplib'
import uuid from 'uuid'
import fs from 'fs'
import path from 'path'
import Handlebars from 'handlebars'
import pdf from 'html-pdf'
import ogs from 'open-graph-scraper'
import { logger } from '../helpers/logging.helper'

export const OpengraphRoute = app => {
  app.post('/v1/opengraph', async (req, res) => {
    const { url } = req.body
    const options = { url, timeout: 4000 }

    ogs(options, (error, result) => {
      if (error) {
        console.log(error, result)
        res.status(500).send({ message: 'Error' })
      } else {
        res.status(200).send(result)
      }
    })
  })
}
