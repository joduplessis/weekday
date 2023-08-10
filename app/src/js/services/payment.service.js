import GraphqlService from './graphql.service'
import CookieService from './storage.service'
import AuthService from './auth.service'
import StorageService from './storage.service'
import { API_HOST, PUBLIC_VAPID_KEY, PN, JWT } from '../environment'
import { urlBase64ToUint8Array } from '../helpers/util'

export const getPaymentPortalUrl = async teamId => {
  const token = StorageService.getStorage(JWT)

  return await fetch(`${API_HOST}/payment/customer_portal/${teamId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  })
}

export const getCheckout = async (slug, priceId, qty) => {
  const token = StorageService.getStorage(JWT)

  return await fetch(`${API_HOST}/payment/subscription/create_session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({ slug, priceId, qty }),
  })
}
