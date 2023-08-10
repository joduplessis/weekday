import React, { useState, useEffect } from 'react'
import { useRouter, withRouter } from 'next/router'
import Head from 'next/head'
import { Button, Error, Loading, Notification, Spinner } from '@weekday/elements'
import fetch from 'isomorphic-unfetch'
import { syncMessageHeight } from '@weekday/dev-kit'

function File(props) {
  const { router: { query }} = props
  const { userId, token, resourceId, resizeId } = query
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [file, setFile] = useState({ name: 'default' })
  const [accountName, setAccountName] = useState('')

  useEffect(() => {
    if (!query.resourceId) return

    const { userId, token, resourceId, resizeId } = query
    const resourceIdDecoded = JSON.parse(window.atob(decodeURI(resourceId)))
    const { accountId, fileId } = resourceIdDecoded

    setError(null)
    setLoading(true)

    fetch('/api/file', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, fileId }),
    })
    .then(res => res.json())
    .then(res => {
        const { file, authEmail } = res

        setLoading(false)
        setFile(file)
        setAccountName(authEmail)
        syncMessageHeight(resizeId)
    })
    .catch(error => {
      setError('There has been an error')
      setLoading(false)
    })
  }, [query])

  return (
    <React.Fragment>
      <Head>
        <title>Google Drive</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
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
          overflow: scroll;
        }

        .container {
          background: white;
          padding: 20px;
        }

        .error {
          position: absolute;
          top: 0px;
          left: 0px;
          width: 100%;
        }
      `}</style>

      <div className="container column">
        {loading && <Spinner />}
        {error && <div className="error"><Error message={error} /></div>}

        <div className="row">
          {file.iconLink &&
            <img src={file.iconLink.replace('16', '128')} height="50" className="mr-10"/>
          }
          <div className="column w-100">
            <div className="h4 color-d2 bold">{file.name}</div>
            <div className="h6 color-d2 bold mb-5">{accountName}</div>
            <div className="row">
              <div className="small regular color-d0 mr-10">Modified {file.modifiedTime}</div>
              <a href={file.webViewLink} target="_blank" className="small x-bold color-blue mr-10 button">Open</a>
            </div>
          </div>
        </div>

      </div>
    </React.Fragment>
  )
}

/*
File.getInitialProps = async ({ query }) => {
  try {
    const { userId, token, resourceId, resizeId } = query
    const resourceIdDecoded = JSON.parse(Buffer.from(decodeURI(resourceId), 'base64').toString())
    const { accountId, fileId } = resourceIdDecoded

    const result = await fetch('/api/test', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, fileId }),
    })
    console.log(result)
    const { file } = await result.json()

    return { file }
  } catch (error) {
    return { error }
  }
}
*/

export default withRouter(File)
