import React, { useState, useEffect, useRef } from 'react'
import Router, { useRouter, withRouter } from 'next/router'
import Head from 'next/head'
import fetch from 'isomorphic-unfetch'
import { Button, Toggle } from '@weekday/elements'
import AppModal from '../modals/app.modal'
import { updateChannelAppActive, createChannelApp, deleteChannelApp, updateChannelApp, getChannelApps } from '../lib/appstore.helper'
import { AppsContext } from '../lib/apps.context'

export default function AppComponent(props) {
  const [appActive, setAppActive] = useState(false)
  const [appInstalled, setAppInstalled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [modal, setModal] = useState(false)
  const router = useRouter()
  const { userId, teamId, channelId } = router.query
  const [appId, setAppId] = useState(null)

  const handleAppClick = async () => {
    setModal(true)
  }

  const handleActiveToggle = async () => {
    try {
      setLoading(true)
      updateChannelAppActive(channelId, appId, !appActive)
      setLoading(false)
      setAppActive(!appActive)
    } catch (e) {
      setError(e)
    }
  }

  const renderDeveloper = () => {
    const developerName = props.team ? props.team.name : props.user.name

    return (
      <React.Fragment>
        <div className="h4 color-d4 mt-5 bold">{props.name}</div>
        <div className="p color-d0 mt-5 bold">{developerName}</div>
      </React.Fragment>
    )
  }

  useEffect(() => {
    setAppId(props.id)
    setAppActive(props.active)
    setAppInstalled(props.installed)
  }, [props])

  return (
    <AppsContext.Consumer>
      {({ channelApps, loadChannelApps }) => {
        return (
          <React.Fragment>
            {modal &&
              <AppModal
                id={props.id}
                active={appActive}
                installed={appInstalled}
                name={props.name}
                description={props.description}
                user={props.user}
                team={props.team}
                image={props.image}
                visibility={props.visibility}
                tools={props.tools}
                shortcuts={props.shortcuts}
                attachments={props.attachments}
                commands={props.commands}
                onClose={() => setModal(false)}
                postInstallAndUninstall={() => props.loadChannelApps()}
              />
            }

            <style jsx>{`
              .app-component {
                width: 23%;
                height: 250px;
                background: white;
                margin-right: 1%;
                margin-bottom: 10px;
              }

                .app-component .content .toggle {
                  position: absolute;
                  top: 10px;
                  right: 10px;
                }

                .app-component .content {
                  width: 100%;
                  height: 150px;
                  background: #F2F3F5;
                  border-radius: 15px;
                  overflow: hidden;
                  position: relative;
                  border: 2px solid white;
                  cursor: pointer;
                  transition: border 0.25s;
                }

                .app-component .content:hover {
                  border: 2px solid #007AF5;
                }

                .app-component .content .image {
                  width: 100%;
                  height: 100%;
                  background: url(${props.image});
                  background-repeat: no-repeat;
                  background-size: cover;
                  background-position: center center;
                }
            `}</style>
            <div className="app-component">
              <div className="content">
                <div className="image" onClick={handleAppClick}/>

                {appInstalled &&
                  <div className="toggle">
                    <Toggle
                      on={appActive}
                      onChange={handleActiveToggle}
                    />
                  </div>
                }
              </div>
              <div className="column mt-10">
                {appActive && <div className="small color-blue bold">ACTIVE</div>}
                {!appActive && <div className="small color-l1 bold">NOT ACTIVE</div>}
                {renderDeveloper()}
              </div>
            </div>
          </React.Fragment>
        )
      }}
    </AppsContext.Consumer>
  )
}
