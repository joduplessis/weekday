import React, { useState, useEffect, useContext } from 'react'
import { Avatar, Error } from '@weekday/elements'
import Router, { useRouter, withRouter } from 'next/router'
import AppModal from '../modals/app.modal'
import { getCategoryApps, getTeamApps, getUserApps, getChannelApps, getAllApps } from '../lib/appstore.helper'
import AppComponent from './app.component'
import { AppsContext } from '../lib/apps.context'

export default function AppsComponent(props) {
  const [apps, setApps] = useState([])
  const [error, setError] = useState(false)
  const [buffer, setBuffer] = useState(0)
  const [showActive, setShowActive] = useState(false)
  const router = useRouter()
  const { userId, teamId, channelId } = router.query
  const [channelApps, setChannelApps] = useState([])
  const appContext = useContext(AppsContext)

  const fetchApps = async() => {
    if (!props.value) return
    if (!userId) return
    if (!teamId) return
    if (!channelId) return

    try {
      let raw, apps

      switch(props.type) {
        case 'all':
          raw = await getAllApps()
          apps = await raw.json()
          setBuffer(apps.length % 4)
          setApps(apps.apps)
          break
        case 'category':
          raw = await getCategoryApps(props.value)
          apps = await raw.json()
          setBuffer(apps.length % 4)
          setApps(apps.apps)
          break
        case 'user':
          raw = await getUserApps(props.value)
          apps = await raw.json()
          setBuffer(apps.length % 4)
          setApps(apps.apps)
          break
        case 'team':
          raw = await getTeamApps(props.value)
          apps = await raw.json()
          setBuffer(apps.length % 4)
          setApps(apps.apps)
          break
        case 'channel':
          raw = await getChannelApps(props.value)
          apps = await raw.json()
          setBuffer(apps.length % 4)
          setApps(apps.apps)
          break
      }
    } catch (e) {
      setError(e.toString())
    }
  }

  useEffect(() => {
    fetchApps()
  }, [props])

  const renderBuffer = () => {
    const buffers = []

    for (let b = 0; b < buffer; b++) {
      buffers.push(<div style={{ width: '23%' }} />)
    }

    return buffers
  }

  return (
    <AppsContext.Consumer>
      {({ channelApps, loadChannelApps }) => {
        return (
          <div className="flexer pt-30 pl-30 pr-30">
            {error && <Error message={error} />}

            <div className="row wrap justify-content-start mb-20">
              {apps.map((app, index) => {
                const channelApp = channelApps.filter(channelApp => channelApp._id == app._id)
                const installed = channelApp.length == 1 ? true : false
                const active = installed ? channelApp[0].active : false

                return (
                  <AppComponent
                    key={index}
                    active={active}
                    installed={installed}
                    id={app._id}
                    name={app.name}
                    description={app.description}
                    user={app.user}
                    image={app.image}
                    team={app.team}
                    visibility={app.visibility}
                    tools={app.tools}
                    shortcuts={app.shortcuts}
                    attachments={app.attachments}
                    commands={app.commands}
                    loadChannelApps={() => {
                      fetchApps()
                      loadChannelApps()
                    }}
                  />
                )
              })}

              {apps.length == 0 &&
                <p className="color-d1">There are no apps.</p>
              }

              {renderBuffer()}
            </div>
          </div>
        )
      }}
    </AppsContext.Consumer>
  )
}
