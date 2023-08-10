import React, { useState, useEffect } from 'react'
import Router, { useRouter, withRouter } from 'next/router'
import Head from 'next/head'
import fetch from 'isomorphic-unfetch'
import { Button, Toggle, Modal, Input, Select } from '@weekday/elements'
import { Link, Terminal, Paperclip, Sidebar, MessageSquare, ShoppingCart, Check, Lock, EyeOff, Eye } from 'react-feather'
import ActionComponent from '../components/action.component'
import { createChannelApp, deleteChannelApp, updateChannelApp } from '../lib/appstore.helper'

export default function AppModal(props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const router = useRouter()
  const { userId, teamId, channelId, jwt } = router.query
  const [appId, setAppId] = useState(null)
  const [developer, setDeveloper] = useState('')
  const [appInstalled, setAppInstalled] = useState(false)
  const [appActive, setAppActive] = useState(false)
  const [modal, setModal] = useState(false)

  const handleUninstall = async () => {
    try {
      setLoading(true)
      await deleteChannelApp(channelId, appId)
      setLoading(false)
      props.postInstallAndUninstall()
    } catch (e) {
      setError(e)
    }
  }

  const handleInstall = async () => {
    try {
      setLoading(true)
      await createChannelApp(channelId, appId)
      setLoading(false)
      props.postInstallAndUninstall()
    } catch (e) {
      setError(e)
    }
  }

  const handleAuthModalMessage = async (event) => {
    if (!event.data) return
    if (!event.data.type) return
    if (event.data.type != 'weekday') return
    if (!event.data.payload) return
    if (!event.data.payload.type) return

    // We need the AUTH_COMPLETE message payload type
    // Otherwise no-go
    if (event.data.payload.type == 'AUTH_COMPLETE') handleAppInstall()
  }

  useEffect(() => {
    setAppId(props.id)
    setAppActive(props.active)
    setAppInstalled(props.installed)
    setDeveloper(props.team ? props.team.name : props.user.name)

    // Listen for message from the auth modal
    window.addEventListener('message', handleAuthModalMessage, false)

    // Unhoko the listener on destroy
    return () => {
      window.removeEventListener('message', handleAuthModalMessage, false)
    }
  }, [props])

  return (
    <React.Fragment>
      <style jsx>{`
        .hero {
          width: 100%;
          height: 200px;
          background: #edf0f2;
          border-radius: 15px;
          margin-bottom: 30px;
          position: relative;
          flex-direction: column;
          align-items: flex-start;
          align-content: flex-start;
          justify-content: flex-end;
          display: flex;
          overflow: hidden;
        }

        .overlay {
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0px;
          right: 0px;
          z-index: 2;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%);
        }

        .image {
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0px;
          right: 0px;
          z-index: 1;
          background: #edf0f2 url(${props.image});
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center center;
        }

        .text {
          padding: 30px;
          z-index: 3;
        }

        iframe {
          border: none;
        }

        .seperator {
          width: 100%;
          height: 1px;
          border-top: 1px solid #edf0f2;
        }
      `}</style>

      <Modal
        title="App"
        width="50%"
        height="80%"
        header={false}
        onClose={() => console.log('Cool')}
        footer={(
          <div className="row w-100">
            <div
              onClick={props.onClose}
              className="h5 underline color-d1 button">
              Close
            </div>

            <div className="flexer" />

            {(props.user._id == userId || teamId == props.team._id) &&
              <Button
                text="Edit"
                theme="muted"
                className="mr-10"
                onClick={() => {
                  Router.push(`/app?userId=${props.user._id}&teamId=${teamId}&channelId=${channelId}&jwt=${jwt}&appId=${props.id}`)
                }}
              />
            }

            <Button
              text={props.installed ? "Uninstall" : "Install"}
              theme={props.installed ? "red" : "muted"}
              onClick={props.installed ? handleUninstall : handleInstall}
            />
          </div>
        )}>

        {modal &&
          <Modal
            title="Authenticate"
            width="45%"
            height="75%"
            onClose={() => setModal(false)}>
            <iframe
              width="100%"
              height="100%"
              src={props.authUrl}
            />
          </Modal>
        }

        <div className="column flexer p-20">
          <div className="hero">
            <div className="overlay" />
            <div className="image" />
            <div className="column text">
              <div className="h2 color-l4 mb-5">{props.name}</div>
              <div className="row">
                <span className="h5 color-l3">Developed by</span> &nbsp;
                <span className="h5 color-l3 bold">{developer}</span>
              </div>
            </div>
          </div>

          <div className="row align-items-stretch w-100">
            <div className="column flexer h5 color-l0">
              {props.description}
            </div>

            <div className="column flexer pl-20 justify-content-start">
              {props.visibility != "none" &&
                <div className="row mb-20">
                  {props.visibility == "team" &&
                    <React.Fragment>
                      <EyeOff size="20" color="#007af5" />
                      <div className="h5 color-blue flexer pl-10">
                        Only visible to this team
                      </div>
                    </React.Fragment>
                  }

                  {props.visibility == "community" &&
                    <React.Fragment>
                      <Eye size="20" color="#007af5" />
                      <div className="h5 color-blue flexer pl-10">
                        Anyone can install this app
                      </div>
                    </React.Fragment>
                  }
                </div>
              }

              <div className="row w-100">
                <div className="column flexer">
                  <div className="h5 color-d4 mb-5 mt-10">UI extensions</div>
                  <div className="p color-d0 mb-20">This app extends the UI in the following ways:</div>
                </div>
              </div>

              {props.shortcuts.length > 0 &&
                <div className="row mb-20">
                  <Sidebar size="20" color="#007af5" style={{ transform: 'rotateZ(90deg)' }} />
                  <div className="h5 color-blue flexer pl-10">Shortcut buttons</div>
                </div>
              }

              {props.commands.length > 0 &&
                  <div className="row mb-20">
                    <Terminal size="20" color="#007af5" />
                    <div className="h5 color-blue flexer pl-10">Commands</div>
                  </div>
              }

              {props.tools.length > 0 &&
                <div className="row mb-20">
                  <Sidebar size="20" color="#007af5" style={{ transform: 'rotateZ(180deg)' }} />
                  <div className="h5 color-blue flexer pl-10">Toolbar buttons</div>
                </div>
              }

              {props.attachments.length > 0 &&
                <div className="row mb-20">
                  <Paperclip size="20" color="#007af5" />
                  <div className="h5 color-blue flexer pl-10">Attachment buttons</div>
                </div>
              }
            </div>
          </div>
        </div>
      </Modal>
    </React.Fragment>
  )
}
