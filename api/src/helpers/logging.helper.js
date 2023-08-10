require('dotenv').config()

import { createLogger, format, transports } from 'winston'
let winstonLogger

export const setupLogging = async () => {
  winstonLogger = createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    ),
    defaultMeta: { service: 'weekday-api' },
    transports: [
      new transports.File({
        filename: 'weekday-api-error.log',
        level: 'error',
      }),
    ],
  })

  // If we're not in production then log to the console too
  if (process.env.NODE_ENV !== 'production') {
    winstonLogger.add(
      new transports.Console({
        format: format.combine(format.colorize(), format.simple()),
      })
    )
  }

  global.winstonLogger = winstonLogger
}

export const logger = {
  info: msg => {
    console.log(msg)
    if (winstonLogger) winstonLogger.info(msg)
  },
  warn: msg => {
    console.log(msg)
    if (winstonLogger) winstonLogger.warn(msg)
  },
  error: msg => {
    console.log(msg)
    if (winstonLogger) winstonLogger.error(msg)
  },
}
