import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import '../helpers/extensions'
import AuthService from '../services/auth.service'
import styled from 'styled-components'
import GraphqlService from '../services/graphql.service'
import { BrowserRouter as Router, Link } from 'react-router-dom'
import { hydrateTeams, updateNotifications, hydrateNotifications } from '../actions'
import PropTypes from 'prop-types'
import { logger } from '../helpers/util'
import { Toggle, Popup, Menu, Avatar, Channel, Tooltip } from '../elements'
import { useSelector, useDispatch } from 'react-redux'
import NotificationsComponent from '../components/notifications.component'
import { IconComponent } from './icon.component'
import MessagingService from '../services/messaging.service'
import TeamOnboardingModal from '../modals/team-onboarding.modal'
import {
  IS_CORDOVA,
  DEVICE,
  TOGGLE_CHANNELS_DRAWER,
  TEXT_VERY_FADED_WHITE,
  TEXT_FADED_WHITE,
  BACKGROUND_FADED_BLACK,
} from '../constants'
import EventService from '../services/event.service'

export default function DockComponent(props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(true)
  const [teamOnboardingModal, setTeamOnboardingModal] = useState(false)
  const dispatch = useDispatch()
  const channel = useSelector(state => state.channel)
  const user = useSelector(state => state.user)
  const common = useSelector(state => state.common)
  const teams = useSelector(state => state.teams)
  const team = useSelector(state => state.team)
  const notifications = useSelector(state => state.notifications)

  // When the user creates a team from quick input component
  const fetchTeams = async userId => {
    setLoading(true)
    setError(false)

    try {
      const teams = await GraphqlService.getInstance().teams(userId)
      const teamIds = teams.data.teams.map(team => team.id)

      setLoading(false)
      dispatch(hydrateTeams(teams.data.teams))

      // Join all these team channels
      MessagingService.getInstance().joins(teamIds)
    } catch (e) {
      logger(e)
      setLoading(false)
      setError(e)
    }
  }

  // Get all the teams
  useEffect(() => {
    if (user.id) fetchTeams(user.id)

    // If the user has signed up (this query string will be present)
    if (props.history.location.search) {
      if (props.history.location.search.split('=')[1] == 'true') {
        setTeamOnboardingModal(true)
      }
    }
  }, [user.id])

  const channelColor = channel.color || '#112640'

  return (
    <Dock color={channelColor}>
      <Corner>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 67 68"
          xmlSpace="preserve"
          style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 2 }}
        >
          <g transform="matrix(1,0,0,1,-594.763,-1025.34)">
            <g transform="matrix(1,0,0,1,556.375,508.641)">
              <g transform="matrix(1,0,0,1,-556.375,-508.641)">
                <path
                  d="M661.005,1025.34C624.952,1027.43 596.141,1056.69 594.763,1092.92L594.763,1025.34L661.005,1025.34Z"
                  style={{ fill: '#0b1729' }}
                />
              </g>
            </g>
          </g>
        </svg>
      </Corner>

      {teamOnboardingModal && (
        <TeamOnboardingModal
          onOkay={() => setTeamOnboardingModal(false)}
          onCancel={() => setTeamOnboardingModal(false)}
        />
      )}

      {teams.map((t, index) => {
        const active = t.id == team.id

        return (
          <Link
            className="column align-items-center align-content-center justify-content-center"
            key={index}
            to={`/app/team/${t.id}`}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              paddingTop: 0,
              paddingBottom: 0,
              marginBottom: 5,
            }}
          >
            <div
              className="button"
              style={{
                borderRadius: 12,
                background: '#2c4354',
                borderColor: active ? '#f8f9fa' : '#2c4354',
                borderWidth: 2,
                borderStyle: 'solid',
                width: 39,
                overflow: 'hidden',
                height: 39,
              }}
            >
              <Avatar size="medium-large" image={t.image} title={t.name} />
            </div>
            <Team active={active}>{t.name}</Team>
          </Link>
        )
      })}

      <div className="mt-10 mb-0">
        <Avatar
          size="medium-large"
          color="rgba(0,0,0,0)"
          className="button"
          onClick={e => setTeamOnboardingModal(true)}
        >
          <IconComponent icon="plus-circle" size={19} color="#2c4354" />
        </Avatar>
      </div>

      <div className="mt-10" id="yack" data-inbox="weekday" style={{ width: 18, height: 18 }}>
        <IconComponent icon="channels-help" size={20} color="#2c4354" className="button" />
      </div>

      <NotificationsComponent style={{ width: 18, height: 18 }}>
        <div className="mt-20">
          <IconComponent icon="channels-notifications" size={20} color="#2c4354" className="button" />
        </div>
      </NotificationsComponent>

      <div className="flexer"></div>

      {!!team.id && (
        <IconComponent
          icon="menu"
          className="button"
          size={23}
          color="#2c4354"
          onClick={e => {
            setOpen(!open)
            EventService.getInstance().emit(TOGGLE_CHANNELS_DRAWER, true)
          }}
        />
      )}
    </Dock>
  )
}

DockComponent.propTypes = {}

const Corner = styled.div`
  position: absolute;
  top: -1px;
  right: -10px;
  width: 10px;
  height: 12px;
`

const Dock = styled.div`
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 20px;
  padding-bottom: 20px;
  display: flex;
  height: 100%;
  position: relative;
  background: #f8f9fa;
  background: white;
  background: #0b1729;
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
  z-index: 7;
  border-right: 0px solid #eaedef;

  @media only screen and (max-width: 768px) {
    width: 20vw;
    padding-top: ${props => (IS_CORDOVA ? 'env(safe-area-inset-top)' : '0px')};
  }
`

const Team = styled.div`
  margin-top: 50x;
  font-size: 8px;
  font-weight: 800;
  color: ${props => (props.active ? '#202933' : '#CFD4D9')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-top: 5px;
  text-transform: uppercase;
  display: none;
`
