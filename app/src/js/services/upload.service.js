import { API_HOST, JWT } from '../environment'
import StorageService from './storage.service'

export default class UploadService {
  static uploadFileLocal(file) {
    var formData = new FormData()
    formData.append('file', file)

    return fetch(`${API_HOST}/upload/local`, {
      method: 'POST',
      body: formData,
    })
  }

  static uploadFileS3(file) {
    var formData = new FormData()
    formData.append('file', file)

    return fetch(`${API_HOST}/upload`, {
      method: 'POST',
      body: formData,
    })
  }

  static getUploadUrl(filename, mime, secured) {
    const token = StorageService.getStorage(JWT)

    return fetch(`${API_HOST}/upload/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({ filename, mime, secured }),
    })
  }

  static getSignedGetUrl(filename) {
    const token = StorageService.getStorage(JWT)

    return fetch(`${API_HOST}/upload/get_url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({ filename }),
    })
  }

  static uploadFile(url, file, mime) {
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': mime,
      },
      body: file,
    })
  }
}
