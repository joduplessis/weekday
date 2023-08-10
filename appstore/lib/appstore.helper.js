import fetch from 'isomorphic-unfetch'
import  { getCookie } from './cookie.helper'

// ⚠️ Yes this is manual for now
// process.env.NODE_ENV is always development on local
// NextJS sets this
const API_HOST = process.env.NODE_ENV == 'development' ? 'http://localhost:8181/v1' : 'https://api.weekday.work/v1'

export const deleteApp = (appId) => {
  const jwt = getCookie('jwt')
  return fetch(`${API_HOST}/appstore/app/${appId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + jwt,
    },
  })
}

export const createApp = (app) => {
  const jwt = getCookie('jwt')
  return fetch(`${API_HOST}/appstore/app`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + jwt,
    },
    body: JSON.stringify({ ...app }),
  })
}

export const updateApp = (appId, app) => {
  const jwt = getCookie('jwt')
  return fetch(`${API_HOST}/appstore/app/${appId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + jwt,
    },
    body: JSON.stringify({ ...app }),
  })
}

export const getApp = (appId) => {
  const jwt = getCookie('jwt')
  return fetch(`${API_HOST}/appstore/app/${appId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + jwt,
    },
  })
}

export const getUserApps = (userId) => {
  const jwt = getCookie('jwt')
  return fetch(`${API_HOST}/appstore/user/${userId}/apps`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + jwt,
    },
  })
}

export const getTeamApps = (teamId) => {
  const jwt = getCookie('jwt')
  return fetch(`${API_HOST}/appstore/team/${teamId}/apps`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + jwt,
    },
  })
}

export const getCategoryApps = (categoryName) => {
  const jwt = getCookie('jwt')
  return fetch(`${API_HOST}/appstore/category/${categoryName}/apps`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + jwt,
    },
  })
}

export const getAllApps = () => {
  const jwt = getCookie('jwt')
  return fetch(`${API_HOST}/appstore/apps`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + jwt,
    },
  })
}

export const getChannelApps = (channelId) => {
  const jwt = getCookie('jwt')
  return fetch(`${API_HOST}/appstore/channel/${channelId}/apps`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + jwt,
    },
  })
}

export const createChannelApp = (channelId, appId) => {
  const jwt = getCookie('jwt')
  return fetch(`${API_HOST}/appstore/channel/${channelId}/app/${appId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + jwt,
    },
  })
}

export const deleteChannelApp = (channelId, appId) => {
  const jwt = getCookie('jwt')
  return fetch(`${API_HOST}/appstore/channel/${channelId}/app/${appId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + jwt,
    },
  })
}

export const updateChannelAppActive = (channelId, appId, active) => {
  const jwt = getCookie('jwt')
  return fetch(`${API_HOST}/appstore/channel/${channelId}/app/${appId}/active`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + jwt,
    },
    body: JSON.stringify({ active }),
  })
}
