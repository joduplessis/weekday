import GraphqlService from './graphql.service'
import CookieService from './storage.service'
import AuthService from './auth.service'
import { API_HOST, PUBLIC_VAPID_KEY, PN } from '../environment'
import { urlBase64ToUint8Array, logger } from '../helpers/util'

export const subscribeUserMobile = async pushToken => {
  try {
    const { token } = await AuthService.currentAuthenticatedUser()
    const { userId } = AuthService.parseJwt(token)

    await fetch(API_HOST + '/pn/subscribe/mobile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: pushToken,
        userId,
      }),
    })
  } catch (e) {
    logger(e)
  }
}

export const subscribeUser = async () => {
  const { token } = await AuthService.currentAuthenticatedUser()
  const { userId } = AuthService.parseJwt(token)
  const registrations = await navigator.serviceWorker.getRegistrations()

  registrations.map(async register => {
    try {
      const parts = register.active.scriptURL.split('/')
      const path = parts[parts.length - 1]

      if (path == 'sw.js') {
        // Subscribe to the PNs
        const subscription = await register.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
        })

        // Join - we're not using this for anything yet
        await fetch(API_HOST + '/pn/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription,
            userId,
          }),
        })
      }
    } catch (e) {
      logger(e)
    }
  })
}

export const askPushNotificationPermission = () => {
  return new Promise((resolve, reject) => {
    const permissionResult = Notification.requestPermission(result => {
      resolve(result)
    })

    if (permissionResult) {
      permissionResult.then(resolve).catch(reject)
    }
  }).then(result => result)
}
