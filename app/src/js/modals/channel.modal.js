import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import ModalPortal from '../portals/modal.portal'
import GraphqlService from '../services/graphql.service'
import MessagingService from '../services/messaging.service'
import styled from 'styled-components'
import UploadService from '../services/upload.service'
import PropTypes from 'prop-types'
import { browserHistory } from '../services/browser-history.service'
import { updateChannel, deleteChannel, createChannelMember, deleteChannelMember } from '../actions'
import ConfirmModal from './confirm.modal'
import {
  User,
  Modal,
  Tabbed,
  Popup,
  Loading,
  Error,
  Spinner,
  Notification,
  Input,
  Textarea,
  Button,
  Avatar,
} from '../elements'
import QuickUserComponent from '../components/quick-user.component'
import { IconComponent } from '../components/icon.component'
import { logger } from '../helpers/util'

export default function ChannelModal(props) {
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)
  const [name, setName] = useState('')
  const [notification, setNotification] = useState(null)
  const [description, setDescription] = useState('')
  const channel = useSelector(state => state.channel)
  const dispatch = useDispatch()

  const handleUpdateChannel = async () => {
    setLoading(true)
    setError(null)

    try {
      await GraphqlService.getInstance().updateChannel(channel.id, { name, description })

      dispatch(updateChannel(channel.id, { name, description }))
      setLoading(false)
      setNotification('Successfully updated')
    } catch (e) {
      logger(e)
      setLoading(false)
      setError('Error updating channel')
    }
  }

  useEffect(() => {
    ;(async () => {
      try {
        if (!props.channelId) return

        setLoading(true)

        const { data } = await GraphqlService.getInstance().channel(props.channelId)
        const channel = data.channel

        setName(channel.name || '')
        setDescription(channel.description || '')
        setLoading(false)
      } catch (e) {
        setLoading(false)
        setError('Error getting data')
      }
    })()
  }, [props.id])

  return (
    <ModalPortal>
      <Modal
        title="Channel"
        width={450}
        height={650}
        footer={
          <React.Fragment>
            {props.hasAdminPermission && (
              <div className="row w-100">
                <div className="flexer" />
                <Button onClick={handleUpdateChannel} text="Save" theme="muted" />
              </div>
            )}
          </React.Fragment>
        }
        onClose={props.onClose}
      >
        {error && <Error message={error} onDismiss={() => setError(false)} />}
        {loading && <Spinner />}
        {notification && <Notification text={notification} onDismiss={() => setNotification(false)} />}

        <Container>
          <Input
            inputSize="large"
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="New channel name"
            className="mb-20"
            disable={!props.hasAdminPermission}
          />

          <Textarea
            label="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Add a description"
            rows={8}
            className="mb-20"
            textareaSize="large"
            disable={!props.hasAdminPermission}
          />

          <div className="row">
            <IconComponent icon="markdown" size={20} color="#626d7a" />
            <Supported>Markdown supported</Supported>
          </div>
        </Container>
      </Modal>
    </ModalPortal>
  )
}

ChannelModal.propTypes = {
  channelId: PropTypes.string,
  teamId: PropTypes.string,
  onClose: PropTypes.func,
  hasAdminPermission: PropTypes.bool, // Whether someone can edit the team or not (admin)
}

const Container = styled.div`
  width: 100%;
  padding: 25px;
`

const Supported = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: #626d7a;
  margin-left: 5px;
`
