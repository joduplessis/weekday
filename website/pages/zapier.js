import React from 'react'
import Head from 'next/head'
import Features from '../components/features'
import Footer from '../components/footer'
import Header from '../components/header'
import Hero from '../components/hero'

export default function Zapier(props) {
  return (
    <React.Fragment>
      <Head>
        <title>Weekday - Give your team superpowers</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link href="/static/images/favicon.png" rel="shortcut icon" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://use.typekit.net/njt5tyh.css" />
      </Head>

      <style global jsx>{`
        * {
          margin: 0px;
          padding: 0px;
        }

        h1, h2, h3, h4, h5, h6, button {
          font-family: 'proxima-nova', sans-serif;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        div, p, small, a {
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        body {
          background-color: white;
          background-image: url(../static/images/bg.png);
          background-size: 100%;
        }

        .content-container {
          background: white;
          background-color: #F7F8F9;
          padding-top: 50px;
          padding-bottom: 30px;
          margin-left: auto;
          margin-right: auto;
          width: 100%;
          padding-right: 50px;
          padding-left: 50px;
        }

        .content-container h1 {
          font-size: 50px;
          color: #21232C;
          font-weight: 400;
          line-height: 80px;
          margin-bottom: 20px;
        }

        .content-container h2 {
          margin-top: 25px;
          font-size: 25px;
          color: white;
          line-height: 40px;
          font-weight: 300;
          color: #6E7E97;
          width: 100%;
          padding-bottom: 20px;
        }

        .content-container img {
          border: 4px solid #dfe2e6;
          border-radius: 10px;
          display: block;
        }

        .content-container a {
          color: #10ACF3;
        }

        .content-container p {
          font-size: 16px;
          color: #6E7E97;
          padding-bottom: 10px;
          font-weight: 500;
          line-height: 24px;
        }

        .content-container li {
          font-size: 16px;
          line-height: 22px;
          color: #6E7E97;
          margin-left: 20px;
          padding-bottom: 10px;
          font-weight: 500;
        }
      `}</style>

      <Header />

      <div className="content-container">
        <h1>Zapier integration</h1>
        <p>You can connect thousands of other apps to Weekday by following our Zapier integration below.</p>

        <h2><strong>Step 1.</strong> Install the Zapier app on a Weekday channel.</h2>
        <p>To install the Zapier app, simply open the app store via the bottom of the right hand toolbar (at the bottom).</p>
        <img src="/static/images/zapier-appstore.png" width="50%" />

        <h2><strong>Step 2.</strong> Copy the channel token that has just been created for your channel</h2>
        <p>Click on the Zapier app icon to open this drawer.</p>
        <img src="/static/images/zapier-channeltoken.png" width="50%" />

        <h2><strong>Step 3.</strong> Log in to Zapier & create a new zap</h2>
        <p>We've used the Zapier Email app, but you can use any other app you want to trigger a message to Weekday.</p>
        <img src="/static/images/zapier-newzap.png" width="50%" />

        <h2><strong>Step 4.</strong> Set up the Weekday app details in Zapier</h2>
        <p>We've used the Zapier Email app, but you can use any other app you want to trigger a message to Weekday.</p>
        <p>We're working on adding more actions, but for now - select the <strong>Create Message</strong> action & select <strong>Continue</strong>.</p>
        <img src="/static/images/zapier-newzap.png" width="50%" />

        <h2><strong>Step 5.</strong> Connect your Weekday account</h2>
        <p>Use your Weekday login credentials to connect to Zapier.</p>
        <img src="/static/images/zapier-connect.png" width="50%" />

        <h2><strong>Step 5.</strong> Set up your new Zap</h2>
        <p>Set up your body message & use your channel token from step 2 in the <strong>Channel Token</strong> field</p>
        <img src="/static/images/zapier-createmessage.png" width="50%" />

        <h2><strong>Step 6.</strong> Done!</h2>
        <p>Select how you want to populate the body field.</p>
        <p>Now, when you email your Zapier App email address from step 3 it will send the message to your Weekday channel.</p>
        <img src="/static/images/zapier-email.png" width="50%" />
      </div>
      <Footer />
    </React.Fragment>
  )
}
