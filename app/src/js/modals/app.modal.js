import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { connect } from 'react-redux'
import styled from 'styled-components'
import ModalPortal from '../portals/modal.portal'
import PropTypes from 'prop-types'
import { Button, Modal } from '../elements'

export default function AppModal(props) {
  const user = useSelector(state => state.user)
  const [url, setUrl] = useState(props.action.payload.url)

  // If a user has submitted a command
  // then this will be attached to the webhook, panel or modal
  useEffect(() => {
    // If the user has already added a query string
    if (props.action.payload.url.indexOf('?') == -1) {
      setUrl(
        `${props.action.payload.url}?token=${props.action.token}&userId=${user.id}${
          props.action.userCommand ? '&userCommand=' + props.action.userCommand : ''
        }`
      )
    } else {
      setUrl(
        `${props.action.payload.url}&token=${props.action.token}&userId=${user.id}${
          props.action.userCommand ? '&userCommand=' + props.action.userCommand : ''
        }`
      )
    }
  }, [])

  return (
    <ModalPortal>
      <Modal
        title={props.action.name}
        width={props.action.payload.width || '75%'}
        height={props.action.payload.height || '75%'}
        onClose={props.onClose}
      >
        <Iframe border="0" src={url} width="100%" height="100%"></Iframe>
      </Modal>
    </ModalPortal>
  )
}

AppModal.propTypes = {
  onClose: PropTypes.func,
  action: PropTypes.any,
}

const Iframe = styled.iframe`
  border: none;
`
