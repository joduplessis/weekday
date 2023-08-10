import StorageService from './storage.service'
import { API_HOST, JWT, WEBRTC } from '../environment'

export default class AuthService {
  static parseJwt(token) {
    var base64Url = token.split('.')[1]
    var base64 = base64Url.replace('-', '+').replace('_', '/')

    return JSON.parse(window.atob(base64))
  }

  static currentAuthenticatedUser() {
    return new Promise((resolve, reject) => {
      const token = StorageService.getStorage(JWT)

      // Now parse the JWT
      if (token) {
        const { exp, sub, userId } = this.parseJwt(token)

        if (exp > Date.now() / 1000) {
          resolve({ token, exp, sub, userId })
        } else {
          reject('Expired')
        }
      } else {
        reject('No user')
      }
    })
  }

  static signout() {
    StorageService.deleteStorage(JWT)
  }

  static saveToken(token) {
    StorageService.setStorage(JWT, token)
  }
}
