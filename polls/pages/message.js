import React, { useState, useEffect } from 'react'
import { useRouter, withRouter } from 'next/router'
import Head from 'next/head'
import fetch from 'isomorphic-unfetch'
import { Button, Error, Loading, Notification, Spinner } from '@weekday/elements'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import { WebSocketSetup } from '../config'
import PollComponent from '../components/poll.component'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { syncMessageHeight } from '@weekday/dev-kit'

const withData = WebSocketSetup()

function Message(props) {
  const { router: { query }} = props
  const { userId, token, resourceId, resizeId } = query
  const pollId = resourceId
  const [addVote, addVoteData] = useMutation(gql`
    mutation add_vote($objects: [poll_votes_insert_input!]!) {
      insert_poll_votes(objects: $objects) {
        returning {
          id
        }
      }
    }
  `)
  const { loading, error, data } = useSubscription(gql`
    subscription {
      polls(where: { id: { _eq: ${pollId} } }) {
        id
        title
        description
        user_id
        channel_token
        expiry
        options
        poll_votes {
          user_id
          option_id
        }
      }
    }
  `)

  useEffect(() => {
    syncMessageHeight(resizeId)
  }, [])

  return (
    <React.Fragment>
      <Head>
        <title>Polls</title>
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
          overflow: scroll;
        }

        .container {
          background: white;
          padding: 0px;
        }

        .error {
          position: absolute;
          top: 0px;
          left: 0px;
          width: 100%;
        }
      `}</style>


      <div className="container">
        {(loading || !data) && <Spinner />}
        {((error || !data) && !loading) && <div className="error"><Error message="Error loading polls" /></div>}

        {data &&
          <React.Fragment>
            {(data.polls.length == 0) &&
              <div className="error"><Error message="This poll doesn't exist anymore" /></div>
            }

            {data.polls.map((poll, index) => {
              return (
                <PollComponent
                  tools={false}
                  key={index}
                  expiry={poll.expiry}
                  title={poll.title}
                  userId={poll.user_id}
                  description={poll.description}
                  options={poll.options}
                  pollVotes={poll.poll_votes}
                  currentUserId={userId}
                  token={token}
                  onSubmit={(optionId) => {
                    addVote({
                      variables: {
                        objects: [
                          {
                            option_id: optionId,
                            poll_id: pollId,
                            user_id: userId,
                          }
                        ]
                      }
                    })
                  }}
                />
              )
            })}
          </React.Fragment>
        }
      </div>
    </React.Fragment>
  )
}

export default withData(withRouter(Message))
