import StorageService from './storage.service'
import { API_HOST, JWT } from '../environment'

export default class OpengraphService {
  static fetchUrl(url) {
    const token = StorageService.getStorage(JWT)

    return fetch(`${API_HOST}/opengraph`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({ url }),
    })
  }
}
