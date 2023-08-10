import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { openApp } from '../actions'
import { IconComponent } from '../components/icon.component'
import ModalPortal from '../portals/modal.portal'
import { Button, Modal } from '../elements'
import { APPSTORE_URL } from '../environment'
import AuthService from '../services/auth.service'
import { TEXT_OFF_WHITE } from '../constants'

export default function ToolbarComponent(props) {
  const [buttons, setButtons] = useState([])
  const [store, setStore] = useState(false)
  const [url, setUrl] = useState(false)
  const user = useSelector(state => state.user)
  const channel = useSelector(state => state.channel)
  const team = useSelector(state => state.team)
  const dispatch = useDispatch()

  const handleAppStoreClick = async () => {
    const { token } = await AuthService.currentAuthenticatedUser()
    const appstoreUrl = `${APPSTORE_URL}?userId=${user.id}&teamId=${team.id}&channelId=${channel.id}&jwt=${token}`

    setStore(true)
    setUrl(appstoreUrl)
  }

  const handleActionClick = async action => {
    dispatch(openApp(action))
  }

  // Load all our toolbar actions
  useEffect(() => {
    const appButtons = []

    setButtons(appButtons)

    // TODO: Debugging - remove
    // handleAppStoreClick()

    // go over all the apps
    // and add only the active ones
    if (channel.apps) {
      channel.apps
        .filter(app => app.active)
        .map(app => {
          if (!app.app.tools) return
          if (app.app.tools.length == 0) return

          // Add the channel app details to each button so we can
          // pass them to the action _ for meta data
          // Also - only apps that have toolbat UI parts
          // We add the token here so that the app can identifu the channgel
          // ---> each channel has an auth token
          app.app.tools.map(tool => {
            appButtons.push({
              ...tool,
              action: {
                ...tool.action,
                token: app.token,
              },
            })
          })
        })
    }

    setButtons(appButtons)
  }, [channel.apps])

  return (
    <React.Fragment>
      <Toolbar className="column" hide={props.hide}>
        {store && (
          <ModalPortal>
            <CloseIcon className="button" onClick={() => setStore(false)}>
              <IconComponent icon="x" size={23} color="white" />
            </CloseIcon>
            <Modal title="Appstore" width="90%" height="90%" header={false} onClose={() => setStore(false)}>
              <Iframe border="0" src={url ? url : null} width="100%" height="100%"></Iframe>
            </Modal>
          </ModalPortal>
        )}

        {buttons.map((button, index) => {
          return (
            <AppIconContainer key={index} onClick={() => handleActionClick(button.action)}>
              <AppIconImage image={button.icon} />
            </AppIconContainer>
          )
        })}

        <div className="flexer" />

        <AppIconContainer onClick={handleAppStoreClick}>
          <IconComponent icon="package" size={20} color="#ACB5BD" />
        </AppIconContainer>
      </Toolbar>
    </React.Fragment>
  )
}

ToolbarComponent.propTypes = {
  hide: PropTypes.bool,
}

const Toolbar = styled.div`
  align-items: center;
  height: 100%;
  position: relative;
  border-left: 1px solid #eaedef;
  border-right: 1px solid #eaedef;
  display: ${props => (props.hide ? 'none' : '')};
  width: 50px;
  padding-top: 0px;

  @media only screen and (max-width: 768px) {
    display: none;
  }
`

const AppIconContainer = styled.div`
  padding: 0px;
  margin-bottom: 20px;
  cursor: pointer;
  opacity: 1;
  transition: opacity 0.25s;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;
  display: flex;

  &:first-child {
    margin-top: 20px;
  }

  &:last-child {
    margin-bottom: 15px;
  }

  &:hover {
    opacity: 0.8;
  }
`

const AppIconImage = styled.div`
  width: 15px;
  height: 15px;
  overflow: hidden;
  background-size: contain;
  background-position: center center;
  background-color: transparent;
  background-repeat: no-repeat;
  background-image: url(${props => props.image});
`

const Iframe = styled.iframe`
  border: none;
`

const CloseIcon = styled.div`
  position: fixed;
  z-index: 100;
  width: 30px;
  height: 30px;
  top: 20px;
  right: 20px;
`
