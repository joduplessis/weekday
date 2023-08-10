import fetch from 'isomorphic-unfetch'
import  { getCookie } from './cookie.helper'

const API_HOST = process.env.NODE_ENV == 'development' ? 'http://localhost:8181/v1' : 'https://api.weekday.work/v1'

export const getUploadUrl = (filename, mime, secured) => {
  const jwt = getCookie('jwt')
  return fetch(`${API_HOST}/upload/url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + jwt,
    },
    body: JSON.stringify({ filename, mime, secured })
  })
}

export const uploadFile = (url, file, mime) => {
  return fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': mime,
    },
    body: file
  })
}
