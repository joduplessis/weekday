import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import ModalPortal from '../portals/modal.portal'
import PropTypes from 'prop-types'
import { Attachment, Popup, Button, Modal } from '../elements'
import { IconComponent } from './icon.component'

export default function PreviewComponent(props) {
  return (
    <ModalPortal>
      <PreviewContainer className="row justify-content-center">
        <PreviewClose>
          <IconComponent icon="x" size={30} color="white" className="button" onClick={props.onClose} />
        </PreviewClose>
        <PreviewImage image={props.image} />
      </PreviewContainer>
    </ModalPortal>
  )
}

PreviewComponent.propTypes = {
  onClose: PropTypes.func,
  image: PropTypes.string,
}

const PreviewContainer = styled.div`
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 1;
  background-color: rgba(4, 11, 28, 0.75);
`

const PreviewClose = styled.div`
  position: fixed;
  top: 0px;
  right: 0px;
  width: max-content;
  height: max-content;
  z-index: 1;
  padding: 20px;
`

const PreviewImage = styled.div`
  width: 80%;
  height: 80%;
  background-position: center center;
  background-image: url(${props => props.image});
  background-size: contain;
  background-repeat: no-repeat;
  border-radius: 5px;
`
