import React, { useState, useEffect } from 'react'
import Router, { useRouter, withRouter } from 'next/router'
import Head from 'next/head'
import fetch from 'isomorphic-unfetch'
import { Avatar, Tabbed, Button, Error } from '@weekday/elements'
import AppsComponent from '../components/apps.component'
import { AppsContext } from '../lib/apps.context'
import AppComponent from '../components/app.component'
import  { setCookie } from '../lib/cookie.helper'
import { getCategoryApps, getTeamApps, getUserApps, getChannelApps } from '../lib/appstore.helper'

export default function Index(props) {
  const [error, setError] = useState(false)
  const [category, setCategory] = useState({
    type: "all",
    value: "all",
    title: "All",
    subtitle: "Power your team channels with Weekday apps.",
  })
  const [channelApps, setChannelApps] = useState([])
  const router = useRouter()
  const { userId, teamId, channelId, jwt } = router.query
  const categories = [{
    type: "all",
    value: "all",
    title: "All",
    subtitle: "Collect & gather feedback from the users in your channels",
  },{
    type: "category",
    value: "feedback",
    title: "Feedback",
    subtitle: "Collect & gather feedback from the users in your channels",
  },{
    type: "category",
    value: "documents",
    title: "Documents",
    subtitle: "Connect & manage documents in the cloud",
  },{
    type: "category",
    value: "video-audio",
    title: "Video & audio",
    subtitle: "Collaborate with your team using voice & audio services",
  },{
    type: "category",
    value: "productivity",
    title: "Productivity",
    subtitle: "Manage your team's producitvity using common project management tools",
  },{
    type: "category",
    value: "other",
    title: "Other",
    subtitle: "All sort of other apps",
  },{
    type: "channel",
    value: channelId,
    title: "Channel apps",
    subtitle: "The following apps are available for this channel",
  },{
    type: "team",
    value: teamId,
    title: "Team Apps",
    subtitle: "The following apps are available for this team only",
  },{
    type: "user",
    value: userId,
    title: "Your Apps",
    subtitle: "The following apps you have created",
  }]

  const loadChannelApps = async () => {
    try {
      const raw = await getChannelApps(channelId)
      const apps = await raw.json()

      setChannelApps(apps.apps)
    } catch (e) {
      setError(e.toString())
    }
  }

  useEffect(() => {
    if (router.query.channelId) {
      setCookie('jwt', router.query.jwt)
      loadChannelApps()
    }
  }, [router.query])

  return (
    <AppsContext.Provider value={{ channelApps, loadChannelApps }}>
      <Head>
        <title>Appstore</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link href="/static/css/styles.css" rel="stylesheet" />
        <link href="/static/images/favicon.png" rel="shortcut icon" />
        <link rel="stylesheet" href="https://use.typekit.net/ycb3zss.css" />
      </Head>

      <style global jsx>{`
        * {
          margin: 0px;
          padding: 0px;
          font-family: proxima-nova, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji;
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
          overflow: scroll;
        }

        .error {
          position: absolute;
          top: 0px;
          left: 0px;
          width: 100%;
        }

        .pill {
          background: #F8F9FA;
          padding: 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin: 2px;
          color: #ACB5BD;
          cursor: pointer;
        }

        .pill:hover {
          background: #F0F3F5;
        }

        .pill.current {
          background: #0C1829;
          color: white;
        }

        .categories {
          display: flex;
          flex-direction: row;
          align-items: center;
          align-content: center;
          justify-content: center;
          padding: 20px;
        }

        .new-app {
          position: absolute;
          top: 20px;
          right: 20px;

        }
      `}</style>

      <div className="container">  
        <div className="new-app">
          <Button
            size="small"
            text="Create a new app"
            theme="muted"
            onClick={() => {
              Router.push({
                pathname: '/app',
                query: { userId, teamId, channelId, jwt },
              })
            }}
          />
        </div> 

        <div className="h1 color-d4 mb-5 w-100 text-center pt-30 mt-30">Appstore</div>
        <div className="h4 color-d0 mb-30 w-100 text-center">{category.subtitle}</div>
      
        <div className="categories">
          {categories.map((c, index) => {
            return (
              <div 
                className={category.value == c.value ? "pill current" : "pill"} 
                key={index}
                onClick={() => setCategory(c)}>
                {c.title}
              </div>
            )
          })}
        </div>

        {category && (
          <AppsComponent
            type={category.type}
            value={category.value}
          />
        )}
      </div>
    </AppsContext.Provider>
  )
}
