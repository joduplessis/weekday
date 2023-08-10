import Cors from 'cors'
import moment from 'moment'
import axios from 'axios'
import { HASURA_GRAPHQL_ADMIN_SECRET, GRAPHQL_ENDPOINT, APP_TOKEN, GRAPHQL_WEBSOCKET } from '../../environment'

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'POST', 'HEAD'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, result => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

async function handler(req, res) {
  try {
    // Run the middleware
    // To allow CORS
    await runMiddleware(req, res, cors)

    // Set these up - token here is the channelToken
    const { body, query } = req
    const { userId, token } = query
    const channelToken = token
    const { userCommand: { commandName, commandQuery } } = body
    const commandQueryParts = commandQuery.split(',')
    const title = commandQueryParts[0]
    const description = commandQueryParts[1]
    const expiry = moment().add(1, 'months').format('YYYY-MM-DD 00:00:00')

    // Create an options data object that will be compatible with the DB
    // ... which is just plain JSON
    const options = commandQueryParts
      .splice(2, (commandQueryParts.length - 1))
      .map((option, index) => {
        return {
          id: index,
          text: option,
        }
      })

    // Make a manual GraphQL request
    // Bit of a hack - but saves having to jump through the GQL-via-server hoops
    // This should update the UI automagically because of Hasura/subscriptions
    await axios({
      url: GRAPHQL_ENDPOINT,
      method: 'post',
      headers: {
        'x-hasura-admin-secret': HASURA_GRAPHQL_ADMIN_SECRET,
      },
      data: {
        "operationName": "add_poll",
        "variables": {
          "objects": [
            {
              "title": title,
              "description": description,
              "options": options,
              "expiry": expiry,
              "channel_token": channelToken,
              "user_id": userId
            }
          ]
        },
        "query": `
          mutation add_poll($objects: [polls_insert_input!]!) {
            insert_polls(objects: $objects) {
              returning {
                id
                title
                __typename
              }
              __typename
            }
          }
        `
      }
    })

    // All is good
    res.json({ success: true })
  } catch (e) {
    res.json({ error: e })
  }
}

export default handler
