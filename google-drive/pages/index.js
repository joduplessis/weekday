import React, { useState, useEffect } from "react";
import { useRouter, withRouter } from "next/router";
import Head from "next/head";
import {
  Button,
  Error,
  Loading,
  Notification,
  Spinner
} from "@weekday/elements";
import { openAppModal } from "@weekday/dev-kit";
import fetch from "isomorphic-unfetch";
import AccountComponent from "../components/AccountComponent";
import EventEmitter from "eventemitter3";

function Index(props) {
  const {
    router: { query }
  } = props;
  const { userId, token } = query;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [accounts, setAccounts] = useState([]);

  const getAccounts = async () => {
    const channeltoken = token || "5e92a53e8314d31bbc73b0cd";

    // Resets
    setLoading(true);
    setError(null);

    // Fetch all of the accounts linked to this channel
    // using the Channel / App token
    fetch("/api/accounts", { headers: { channeltoken } })
      .then(res => res.json())
      .then(json => {
        if (json.error) return setError("Error fetching accounts");

        // Otherwise add our account to the list
        setAccounts(json.accounts || []);
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        setError("Error in API response");
      });
  };

  const windowMessageFromPopup = async event => {
    const { scope, code } = event.data;
    const channelToken = token || "5e92a53e8314d31bbc73b0cd";

    if (window.EventEmitter) window.EventEmitter.emit("account", {});

    // If everything has been returned correctly
    if (scope && code) {
      // Kill/Close the popup first
      window.authPopup.close();
      window.authPopup = null;

      // Create the token
      fetch("/api/accounts", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, channelToken, scope, code })
      })
        .then(res => res.json())
        .then(json => {
          const { account, error } = json;

          // If there's been an error
          if (error) return setError("Error adding account");

          // Refresh our list
          setAccounts([...accounts, account]);
        })
        .catch(error => {
          setError("Error in API response");
        });
    }
  };

  useEffect(() => {
    getAccounts();
  }, []);

  useEffect(() => {
    // If the auth window posts back a code we can handle it here
    window.addEventListener("message", windowMessageFromPopup, false);

    // Make sure we remove this every time
    return () => window.removeEventListener("message", windowMessageFromPopup);
  }, [accounts]);

  return (
    <React.Fragment>
      <Head>
        <title>Google Drive</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
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
          overflow: scroll;
        }

        .container {
          background: white;
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0px;
          top: 0px;
          display: flex;
          overflow: scroll;
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
        {error && (
          <div className="error">
            <Error message={error} />
          </div>
        )}

        <div className="row p-10 w-100 border-bottom">
          <div className="p color-d2">
            You have <strong>{accounts.length}</strong> connected accounts
          </div>
          <div className="flexer" />
          <Button
            size="small"
            theme="blue-border"
            text="Connect account"
            onClick={() => {
              window.authPopup = window.open(
                props.authUrl,
                "Complete OAuth2",
                "location=no,toolbar=no,menubar=no,width=600,height=500,left=200,top=100"
              );
            }}
          />
        </div>

        {accounts.map((account, index) => (
          <AccountComponent
            getAccounts={getAccounts}
            account={account}
            key={index}
          />
        ))}

        {accounts.length == 0 && (
          <div className="column align-items-center">
            <div className="mt-40 mb-20 pl-20 pr-20 text-center">
              <img
                src="https://weekday-apps.s3.us-west-2.amazonaws.com/google-drive-icon.png"
                width="60%"
              />
            </div>
            <div className="h3 mb-20 pl-20 pr-20 color-d2 text-center">
              There are no connected accounts
            </div>
            <div className="h5 mb-20 pl-20 pr-20 color-d0 text-center">
              Click on the "Connect account" button connect an account.
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

Index.getInitialProps = async ({ query }) => {
  try {
    const { userId, token } = query;
    const channelToken = token;
    const SCOPES = [
      "https://www.googleapis.com/auth/drive.metadata.readonly",
      "https://www.googleapis.com/auth/userinfo.email"
    ];
    const { google } = require("googleapis");
    const fs = require("fs");
    const readline = require("readline");
    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URL
    );

    // Auto generate a token so that we can immediately direct the user
    return {
      authUrl: oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES
      })
    };
  } catch (e) {
    return {
      authUrl: null
    };
  }
};

export default withRouter(Index);
