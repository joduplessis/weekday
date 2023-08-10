import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import ModalPortal from '../portals/modal.portal'
import PropTypes from 'prop-types'
import { Button, Modal } from '../elements'

export default function ConfirmModal({ onOkay, onCancel, text, title }) {
  return (
    <ModalPortal>
      <Modal title={title} width={450} height={300} onClose={onCancel}>
        <div className="row justify-content-center pt-30">
          <div className="h5 pl-30 pr-30 text-center w-light color-d1">{text}</div>
        </div>
        <div className="row justify-content-center pt-30 pb-30">
          <Button size="large" onClick={onOkay} text="Yes" className="mr-10" theme="muted" />
          <Button size="large" onClick={onCancel} text="No" theme="muted" />
        </div>
      </Modal>
    </ModalPortal>
  )
}

ConfirmModal.propTypes = {
  onOkay: PropTypes.any,
  onCancel: PropTypes.any,
  text: PropTypes.string,
  title: PropTypes.string,
}
