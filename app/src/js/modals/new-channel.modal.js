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

export default function NewChannelModal(props) {
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)
  const [userMenu, setUserMenu] = useState(null)
  const [notification, setNotification] = useState(null)
  const user = useSelector(state => state.user)
  const team = useSelector(state => state.team)
  const [members, setMembers] = useState([])

  const handleCreateChannel = () => {
    const users = members.map(member => member.user)
    props.onCreate(users)
  }

  return (
    <ModalPortal>
      <Modal
        title="Create New Channel"
        width={500}
        height={500}
        footer={<Button onClick={() => handleCreateChannel()} text="Create Channel" theme="muted" />}
        onClose={props.onClose}
      >
        <div className="row align-items-start w-100" style={{ zIndex: 100000 }}>
          <div className="column w-100">
            {error && <Error message={error} onDismiss={() => setError(false)} />}
            {loading && <Spinner />}
            {notification && <Notification text={notification} onDismiss={() => setNotification(false)} />}

            <div className="column pl-20 pt-20">
              <div className="row align-items-start mb-20">
                {members.map((member, index) => {
                  return (
                    <Member className="row" key={index}>
                      <Avatar
                        size="small-medium"
                        image={member.user.image}
                        title={member.user.name}
                        className="mb-5 mr-5"
                        key={index}
                      />
                      <MemberName>{member.user.name}</MemberName>
                      <IconComponent
                        icon="x"
                        size={15}
                        color="#626d7a"
                        className="button mr-5"
                        onClick={() => setUserMenu(true)}
                      />
                    </Member>
                  )
                })}
              </div>

              <div className="row pr-25">
                <QuickUserComponent
                  userId={user.id}
                  teamId={team.id}
                  visible={userMenu}
                  width={250}
                  direction="left-bottom"
                  handleDismiss={() => setUserMenu(false)}
                  handleAccept={member => setMembers([...members, member])}
                >
                  <IconComponent
                    icon="plus-circle"
                    size={15}
                    color="#626d7a"
                    className="button"
                    onClick={() => setUserMenu(true)}
                  />
                </QuickUserComponent>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </ModalPortal>
  )
}

NewChannelModal.propTypes = {
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
}

const Member = styled.div`
  background: #f6f7fa;
  padding: 3px;
  border-radius: 10px;
`

const MemberName = styled.div`
  color: #617691;
  font-size: 12px;
  font-weight: 500px;
  padding-left: 10px;
  padding-right: 10px;
`
