import React, { useState, useEffect } from 'react'
import { useRouter, withRouter } from 'next/router'
import Head from 'next/head'
import fetch from 'isomorphic-unfetch'
import { Button, Error, Loading, Notification, Spinner } from '@weekday/elements'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import PollComponent from '../components/poll.component'
import FormComponent from '../components/form.component'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { closeAppModal } from '@weekday/dev-kit'
import { WebSocketSetup } from '../config'

const withData = WebSocketSetup()

function Create(props) {
  const { router: { query }} = props
  const [userId, setUserId] = useState(query.userId)
  const [token, setToken] = useState(query.token)
  const [addPoll, { data, error, loading }] = useMutation(gql`
    mutation add_poll($objects: [polls_insert_input!]!) {
      insert_polls(objects: $objects) {
        returning {
          id
          title
        }
      }
    }
  `)

  const onSubmit = (title, description, options, expiry) => {
    addPoll({
      variables: {
        objects: [
          {
            title,
            description,
            options,
            expiry,
            channel_token: token,
            user_id: userId
          }
        ]
      }
    })

    // And then close the modal
    // BUT NOT NOW
    // closeAppModal()
  }

  return (
    <React.Fragment>
      <Head>
        <title>Poll</title>
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

        html, body {
          background: white;
          height: 100%;
        }

        .complete-container {
          background: white;
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0px;
          top: 0px;
          display: flex;
          align-items: center;
          flex-direction: column;
          align-content: center;
          justify-content: center;
        }

        .container {
          background: white;
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0px;
          top: 0px;
          display: flex;
          align-items: stretch;
          align-content: center;
          justify-content: center;
        }

        .error {
          position: absolute;
          top: 0px;
          left: 0px;
          width: 100%;
        }

        .polls-listing-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          align-content: center;
          justify-content: flex-start;
          padding: 20px;
        }
      `}</style>

      {loading && <Spinner />}
      {error && <div className="error"><Error message="Error loading polls" /></div>}

      {data &&
        <div className="complete-container">
          <img src="https://weekday-apps.s3.us-west-2.amazonaws.com/check.png" width="100" className="mb-30"/>
          <div className="h3 mb-20 color-d2 text-center">Success</div>
          <div className="h5 color-d0 text-center">You have created a new poll!</div>
        </div>
      }

      {!data &&
        <div className="polls-listing-container">
          <FormComponent
            id={null}
            userId={null}
            expiry={null}
            title={null}
            currentUserId={userId}
            description={null}
            options={null}
            onSubmit={onSubmit}
          />
        </div>
      }
    </React.Fragment>
  )
}

export default withData(withRouter(Create))
