require('dotenv').config()

export const IS_DEV = process.env.NODE_ENV == 'development'
export const SECRET = process.env.SECRET
export const MAIL_FROM = 'noreply@weekday.work'
export const BUCKET = 'weekday'
export const PAGE_LIMIT = 50
export const COST = 3
export const QUANTITY = 3
export const MIME_TYPES = {
  MEET: 'weekday/meet',
  TASK: 'weekday/task',
}
export const STRIPE_REDIRECT_LOCAL = 'http://localhost:3000'
export const STRIPE_REDIRECT_LIVE = 'https://app.weekday.work'
export const API_LOCAL = 'http://localhost:8181'
export const API_LIVE = 'https://api.weekday.work'
export const ADMIN_WEBRTC_SERVER_LIST = IS_DEV ? ['http://localhost:7088'] : ['http://94.237.81.25:7088']
export const WEBRTC_SERVER_LIST = IS_DEV ? ['http://localhost:8088/janus'] : ['https://video1.weekday.work/janus']
