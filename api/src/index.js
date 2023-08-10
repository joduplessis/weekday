require('dotenv').config()

import path from 'path'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import cors from 'cors'
import { typeDefs } from './graphql/typedefs.graphql'
import { resolvers } from './graphql/resolvers.graphql'
import exphbs from 'express-handlebars'
import fileUpload from 'express-fileupload'
import bodyParser from 'body-parser'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { AppstoreRoute } from './routes/appstore.route'
import { ZapierRoute } from './routes/zapier.route'
import { AccountRoute } from './routes/account.route'
import { UploadRoute } from './routes/upload.route'
import { OpengraphRoute } from './routes/opengraph.route'
import { PnRoute } from './routes/pn.route'
import { AppRoute } from './routes/app.route'
import { PaymentRoute } from './routes/payment.route'
import { ChannelMemberModel } from './models/channel-member.model'
import * as NotificationHelper from './helpers/notification.helper'
import * as MessagingHelper from './helpers/messaging.helper'
import mongoose from 'mongoose'
import webPush from 'web-push'
import { SECRET } from './constants'
import * as JwtHelper from './helpers/jwt.helper'
import { connectToMqttBroker } from './helpers/mqtt.helper'
import { setupLogging } from './helpers/logging.helper'
import { logger } from './helpers/logging.helper'
import './moment-timezone.min'
import PNHelper from "./helpers/pn.helper";

// processes
import './processes/image.preview.process'
import './processes/outgoing.webhook.process'

const Sentry = require("@sentry/node")

// Housework
setupLogging()
connectToMqttBroker()

// Main async
;(async () => {
  try {
    require('dotenv').config()

    // Web push
    const publicVapidKey = process.env.PUBLIC_VAPID_KEY
    const privateVapidKey = process.env.PRIVATE_VAPID_KEY

    webPush.setVapidDetails('mailto:support@weekday.work', publicVapidKey, privateVapidKey)

    // Start our GraphQL server
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      cache: false,
      context: ({ req }) => {
        if (!req.headers.authorization) throw new Error('Apollo: no auth header present')
        if (!req.headers.authorization.split(' ')[1]) throw new Error('Apollo: no token present')

        try {
          const { authorization } = req.headers
          const token = authorization.split(' ')[1]
          const payload = JwtHelper.decode(token, SECRET)

          if (!payload) throw new Error('Apollo: your token is not valid')

          const { sub, exp } = payload

          // If it's expired
          if (exp < Date.now() / 1000) throw new Error('Apollo: your token has expired')

          // add the user to the context
          return { userId: sub }
        } catch (err) {
          throw new Error('Apollo: general error')
        }
      },
    })

    // Set up the Mongoose stuff
    mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
    })

    // Set up Express app & database
    const app = express()

    // Set up Express middleware
    app.use((err, req, res, next) => console.log('There was an error', err))
    app.use(cors())
    app.use(bodyParser.json())
    app.use(express.static('public'))
    app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }))

    // Templating engine for static pages
    app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
    app.set('view engine', 'handlebars')
    app.set('views', path.join(__dirname, 'templates'))

    // Apply Hapi as middleware
    await server.applyMiddleware({ app, path: '/v1/graphql' })

    // Set up routes
    AccountRoute(app)
    PnRoute(app)
    AppstoreRoute(app)
    UploadRoute(app)
    AppRoute(app)
    OpengraphRoute(app)
    ZapierRoute(app)
    PaymentRoute(app)

    // Set up swagger specifications lib
    const swaggerSpec = swaggerJSDoc({
      openapi: '3.0.1',
      basePath: '/',
      swaggerDefinition: {
        info: {
          title: 'Weekday',
          version: '1.0.0',
          description: 'A team collaboration platform.',
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
            }
          }
        },
      },
      apis: [
        path.join(__dirname, './routes/app.route.js'),
      ],
    })

    // Middleware for Swagger spec doc
    app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

    // Create an end point for Swagger
    app.get('/v1/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json')
      res.send(swaggerSpec)
    })

    // Webhook test
    app.post('/v1/webhook-test', (req, res) => {
      console.log('Successful webhook test - ' + req.query.channelToken)
      console.log(req.body)
      res.send({ success: true })
    })

    // Start the server
    app.listen(process.env.PORT || 8181, () => console.log(`API running on port ${process.env.PORT}`))

    // Admin
    setTimeout(() => {
      new PNHelper().sendToSegments('API up and running', ['test-channel-id'])
    }, 1000)

    // Set up Sentry
    Sentry.init({
      dsn: "https://70d7b89277184ab69a5190673f352b45@o114545.ingest.sentry.io/1273085",
      tracesSampleRate: 1.0,
    });
  } catch (e) {
    console.log('Exited', e)
  }
})()

/*
const clientId = uuidv1()
const host = os.hostname()
const token = JwtHelper.encode(
  {
    iss: host,
    sub: clientId,
    userId: clientId,
    exp: Date.now() / 1000 + 60 * 60 * 24 * 14,
  },
  SECRET
)

console.log(token, SECRET)



console.log(JwtHelper.decode(token, SECRET))

const payload = JSON.stringify({
  title: 'New Message',
  body: 'Push notifications with service workers, this is very cool',
})
webPush.sendNotification(subscription, payload)
  .then(res => console.log(res))
  .catch(error => console.error(error));
*/


    /*
    // AWS SQS


    // Send them a notification
    setTimeout(() => {
      NotificationHelper.createNotificationForUser('Well done!', 'You have joined a team and that is very cool', '5e609bbf5d1147dba2893a85', '5ec3b5ca7d5f6834298c9950', '5e4b6c55c052ed74e32866bb')
    }, 1000)

    // If modifying these scopes, delete token.json.
    const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly']

    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the fir
    const TOKEN_PATH = path.join(__dirname, 'token.json')

    // Load client secrets from a local file.
    fs.readFile(path.join(__dirname, 'credentials.json'), (err, content) => {
      if (err) return console.log('Error loading client secret file:', err)
      // Authorize a client with credentials, then call the Google Drive API.
      authorize(JSON.parse(content), listFiles)
    })

    function authorize(credentials, callback) {
      const { client_secret, client_id, redirect_uris } = credentials.web
      const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback)

        oAuth2Client.setCredentials(JSON.parse(token))
        callback(oAuth2Client)
      })
    }

    function getAccessToken(oAuth2Client, callback) {
      const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES })

      console.log(authUrl)
    }

    function listFiles(auth) {
      const drive = google.drive({ version: 'v3', auth })
      drive.files.list(
        {
          pageSize: 10,
          fields: 'nextPageToken, files(id, name)',
        },
        (err, res) => {
          if (err) return console.log('The API returned an error: ' + err)
          const files = res.data.files
          if (files.length) {
            console.log('Files:')
            files.map(file => {
              console.log(`${file.name} (${file.id})`)
            })
          } else {
            console.log('No files found.')
          }
        }
      )
    }
    */
