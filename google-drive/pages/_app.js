import React, { useState, useEffect } from 'react'
import { initDevKit, openAppModal } from '@weekday/dev-kit'
import { APP_TOKEN } from '../environment'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // true = DEV
    // false = PROD
    initDevKit(APP_TOKEN, false)
  }, [])

  return <Component {...pageProps} />
}

export default MyApp
