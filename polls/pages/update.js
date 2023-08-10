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
import { WebSocketSetup } from '../config'

const withData = WebSocketSetup()

function Update(props) {
  const { router } = props
  const { userId, pollId, token } = router.query
  const [notification, setNotification] = useState(null)
  const [updatePoll, { data }] = useMutation(gql`
    mutation update_polls($id: Int, $changes: polls_set_input) {
      update_polls(
        where: {id: {_eq: $id}},
        _set: $changes
      ) {
        affected_rows
        returning {
          id
          title
          description
        }
      }
    }
  `)
  const [query, setQuery] = useState(gql`
    query {
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
        }
      }
    }
  `)

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

      {query &&
        <div className="container column">
          {notification && <Notification text={notification} />}

          <Query
            query={query}
            fetchPolicy={'cache-and-network'}>
            {({ loading, data, error }) => {
              if (loading) return <Spinner />
              if (error) return <div className="error"><Error message="Error loading polls" /></div>

              // If no polls exist
              if (data.polls.length == 0) {
                return (
                  <React.Fragment>
                    <img src="https://weekday-apps.s3.us-west-2.amazonaws.com/no-polls.png" width="60%" className="mb-30"/>
                    <div className="h3 mb-20 pl-20 pr-20 color-d2 text-center">There are no polls</div>
                    <div className="h5 mb-20 pl-20 pr-20 color-d0 text-center">There are no polls for this channel. Click on the button below to create your first poll.</div>

                    <Button
                      size="small"
                      theme="blue-border"
                      text="Create a poll"
                    />
                  </React.Fragment>
                )
              }

              // If there are
              return data.polls.map((poll, index) => {
                return (
                  <div className="polls-listing-container" key={index}>
                    <FormComponent
                      id={poll.id}
                      userId={poll.user_id}
                      expiry={poll.expiry}
                      title={poll.title}
                      currentUserId={userId}
                      description={poll.description}
                      options={poll.options}
                      onSubmit={(pollId, title, description, options, expiry) => {
                        setNotification('Saved')
                        updatePoll({
                          variables: {
                            id: pollId,
                            changes: {
                              title,
                              description,
                              options,
                              expiry,
                            }
                          }
                        })
                      }}
                    />
                  </div>
                )
              })
            }}
          </Query>
        </div>
      }
    </React.Fragment>
  )
}

export default withData(withRouter(Update))
