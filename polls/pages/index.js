import React, { useState, useEffect } from "react";
import { useRouter, withRouter } from "next/router";
import Head from "next/head";
import fetch from "isomorphic-unfetch";
import {
  Button,
  Error,
  Loading,
  Notification,
  Spinner
} from "@weekday/elements";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import { WebSocketSetup } from "../config";
import PollComponent from "../components/poll.component";
import { useMutation, useSubscription } from "@apollo/react-hooks";
import { openAppModal } from "@weekday/dev-kit";

const withData = WebSocketSetup();

function Index(props) {
  const {
    router: { query }
  } = props;
  const { userId, token } = query;
  const [addVote, addVoteData] = useMutation(gql`
    mutation add_vote($objects: [poll_votes_insert_input!]!) {
      insert_poll_votes(objects: $objects) {
        returning {
          id
        }
      }
    }
  `);
  const { loading, error, data } = useSubscription(gql`
    subscription {
      polls(where: { channel_token: { _eq: "${token}" } }) {
        id
        title
        description
        user_id
        channel_token
        expiry
        options
        poll_votes {
          option_id
          user_id
        }
      }
    }
  `);

  return (
    <React.Fragment>
      <Head>
        <title>Polls</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link
          href="https://weekday-apps.s3.us-west-2.amazonaws.com/styles.css"
          rel="stylesheet"
        />
        <link
          href="https://weekday-apps.s3.us-west-2.amazonaws.com/favicon.png"
          rel="shortcut icon"
        />
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

      <div className="container column">
        <div className="polls-listing-container">
          {(loading || !data) && <Spinner />}
          {(error || !data) && !loading && (
            <div className="error">
              <Error message="Error loading polls" />
            </div>
          )}
          {data && (
            <React.Fragment>
              {data.polls.length == 0 && (
                <React.Fragment>
                  <div className="mb-20 pl-20 pr-20 text-center">
                    <img
                      src="https://weekday-apps.s3.us-west-2.amazonaws.com/polls-icon.svg"
                      width="60%"
                      className="mb-30"
                    />
                  </div>
                  <div className="h3 mb-20 pl-20 pr-20 color-d2 text-center">
                    There are no polls
                  </div>
                  <div className="h5 mb-20 pl-20 pr-20 color-d0 text-center">
                    There are no polls for this channel. Click on the button
                    below to create your first poll.
                  </div>
                </React.Fragment>
              )}

              {data.polls.map((poll, index) => {
                return (
                  <PollComponent
                    tools={true}
                    key={index}
                    id={poll.id}
                    expiry={poll.expiry}
                    token={token}
                    userId={userId}
                    currentUserId={userId}
                    title={poll.title}
                    description={poll.description}
                    options={poll.options || []}
                    pollVotes={poll.poll_votes || []}
                    onSubmit={optionId => {
                      addVote({
                        variables: {
                          objects: [
                            {
                              option_id: optionId,
                              poll_id: poll.id,
                              user_id: userId
                            }
                          ]
                        }
                      });
                    }}
                  />
                );
              })}
            </React.Fragment>
          )}

          <div className="row justify-content-center mt-30 w-100">
            <Button
              size="small"
              theme="blue-border"
              text="Create a new poll"
              onClick={() => {
                if (window.location.hostname == "localhost") {
                  openAppModal(
                    "Create a poll",
                    "http://localhost:3002/create",
                    "50%",
                    "80%",
                    token
                  );
                } else {
                  openAppModal(
                    "Create a poll",
                    "https://polls.weekday.work/create",
                    "50%",
                    "80%",
                    token
                  );
                }
              }}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default withData(withRouter(Index));
