import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import ModalPortal from '../portals/modal.portal'
import PropTypes from 'prop-types'
import { Button, Modal } from '../elements'
import { IconComponent } from './icon.component'
import { closeAppPanel } from '../actions'

export default function AppComponent(props) {
  const user = useSelector(state => state.user)
  const app = useSelector(state => state.app)
  const dispatch = useDispatch()
  let url

  // If there is no app panel action - then don't display this component
  if (!app.panel) return null

  // app.panel is an APP ACTION
  // If the user has already added a query string
  // Payload consists of URL/WIDTH/HEIGHT
  // We maange the dimensions because this is the panel - so we only want the URL
  // -----------------------
  // User commands are added dynamically by the compose component
  // they refer to the / (slash) commands when users interact with an app
  if (app.panel.payload.url.indexOf('?') == -1) {
    url = `${app.panel.payload.url}?token=${app.panel.token}&userId=${user.id}${
      app.panel.userCommand ? '&userCommand=' + app.panel.userCommand : ''
    }`
  } else {
    url = `${app.panel.payload.url}&token=${app.panel.token}&userId=${user.id}${
      app.panel.userCommand ? '&userCommand=' + app.panel.userCommand : ''
    }`
  }

  return (
    <Container className="column" hide={props.hide}>
      <Header className="row">
        <HeaderTitle>{app.panel.name}</HeaderTitle>
        <Tooltip>App</Tooltip>
        <div className="flexer"></div>
        <IconComponent
          icon="x"
          size={25}
          color="#040b1c"
          className="mr-5 button"
          onClick={() => dispatch(closeAppPanel())}
        />
      </Header>
      <IframeContainer>
        <Iframe border="0" src={url} width="100%" height="100%"></Iframe>
      </IframeContainer>
    </Container>
  )
}

AppComponent.propTypes = {
  action: PropTypes.any,
  hide: PropTypes.bool,
}

const Iframe = styled.iframe`
  border: none;
`

const IframeContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  width: 100%;
`

const Container = styled.div`
  display: ${props => (props.hide ? 'none' : 'flex')};
  flex-direction: column;
  width: 400px;
  height: 100%;
  border-left: 1px solid #f1f3f5;
`

const Header = styled.div`
  width: 100%;
  border-bottom: 1px solid #eaedef;
  position: relative;
  z-index: 5;
  padding 0px 25px 0px 25px;
  height: 75px;
  display: flex;
`

const HeaderTitle = styled.div`
  font-size: 18px;
  font-weight: 400;
  font-style: normal;
  color: #040b1c;
  transition: opacity 0.5s;
  display: inline-block;
  padding-right: 10px;
`

const Tooltip = styled.span`
  font-size: 10px;
  z-index: 2;
  position: relative;
  font-weight: 600;
  color: #adb5bd;
  background: #f2f3f5;
  border-radius: 5px;
  padding: 7px;
  text-transform: uppercase;
`
