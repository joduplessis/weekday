const OneSignal = require('onesignal-node')

export default class PNHelper {
  constructor() {
    if (this.osClient) return

    this.osClient = new OneSignal.Client(process.env.OS_APP_ID, process.env.OS_APP_AUTH_KEY);
  }

  sendToUser(message, device) {
    const notification = {
      content_available: true,
      contents: { en: message },
      include_player_ids: [device],
    }

    // Send the actual message
    this.osClient.createNotification(notification, (error, httpResponse, data) => {
      if (error) {
        console.log('Something went wrong...', error)
      } else {
        console.log('Sent', data, httpResponse.statusCode)
      }
    })
  }

  sendToSegments(message, segments) {
    const notification = {
      content_available: true,
      contents: { en: message },
      included_segments: segments,
    }

    // Send the actual message
    this.osClient.createNotification(notification, (error, httpResponse, data) => {
      if (error) {
        console.log('Something went wrong...', error)
      } else {
        console.log('Sent', data, httpResponse.statusCode)
      }
    })
  }

  sendToTopic(message, key, value) {
    const notification = {
      content_available: true,
      contents: { en: message },
      filters: [
        { field: 'tag', key, relation: '=', value }
      ]
    }

    // Send the actual message
    this.osClient.createNotification(notification, (error, httpResponse, data) => {
      if (error) {
        console.log('Something went wrong...', error)
      } else {
        console.log('Sent', data, httpResponse.statusCode)
      }
    })
  }
}
