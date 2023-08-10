import React, { useState, useEffect } from 'react'
import { useRouter, withRouter } from 'next/router'
import Head from 'next/head'
import { Button, Error, Loading, Notification, Spinner } from '@weekday/elements'
import { openAppModal } from '@weekday/dev-kit'
import fetch from 'isomorphic-unfetch'

function Success(props) {
  const { router: { query }} = props
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const { scope, code } = props.query

  useEffect(() => {
    window.top.postMessage({ scope, code }, "*")
    window.opener.postMessage({ scope, code }, "*")
  }, [])

  return (
    <React.Fragment>
      <Head>
        <title>Google Drive</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link href="https://weekday-apps.s3.us-west-2.amazonaws.com/styles.css" rel="stylesheet" />
        <link href="https://weekday-apps.s3.us-west-2.amazonaws.com/favicon.png" rel="shortcut icon" />
        <link href="/static/css/styles.css" rel="stylesheet" />
      </Head>

      <style global jsx>{`
        * {
          margin: 0px;
          padding: 0px;
        }

        body {
          background: white;
        }
      `}</style>

      <p>Redirecting...</p>
    </React.Fragment>
  )
}

Success.getInitialProps = async ({ query }) => {
  try {
    return { query }
  } catch (e) {
    return { error: e }
  }
}

export default withRouter(Success)
