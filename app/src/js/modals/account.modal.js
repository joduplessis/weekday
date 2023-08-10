import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import GraphqlService from '../services/graphql.service'
import UploadService from '../services/upload.service'
import AuthService from '../services/auth.service'
import MessagingService from '../services/messaging.service'
import { API_HOST, JWT } from '../environment'
import styled from 'styled-components'
import { Formik } from 'formik'
import ConfirmModal from './confirm.modal'
import * as Yup from 'yup'
import PropTypes from 'prop-types'
import { updateUser, updateChannelUserNameImage } from '../actions'
import ModalPortal from '../portals/modal.portal'
import {
  Avatar,
  Button,
  Input,
  Textarea,
  Notification,
  Modal,
  Tabbed,
  Spinner,
  Error,
  Select,
  Toggle,
} from '../elements'
import { STRIPE_API_KEY } from '../environment'
import Zero from '@joduplessis/zero'
import { logger, stripSpecialChars } from '../helpers/util'
import { IconComponent } from '../components/icon.component'
import * as PnService from '../services/pn.service'

const moment = require('moment-timezone')

export default function AccountModal(props) {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(null)
  const [notification, setNotification] = useState(null)
  const [image, setImage] = useState('')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [description, setDescription] = useState('')
  const [timezone, setTimezone] = useState(0)
  const [emails, setEmails] = useState([])
  const [newEmailAddress, setNewEmailAddress] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [confirmAccountDeleteModal, setConfirmAccountDeleteModal] = useState('')
  const dispatch = useDispatch()
  const fileRef = useRef(null)
  const teams = useSelector(state => state.teams)
  const channels = useSelector(state => state.channels)
  const AccountService = Zero.container().get('AccountService')

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)

        const { data } = await GraphqlService.getInstance().user(props.id)
        const user = data.user

        setImage(user.image)
        setUsername(user.username)
        setName(user.name || '')
        setDescription(user.description || '')
        setEmails(user.emails)
        setTimezone(moment.tz.names().indexOf(user.timezone))
        setLoading(false)
      } catch (e) {
        setLoading(false)
        setError('Error getting data')
      }
    })()
  }, [])

  const handleAccountDelete = async () => {
    setLoading(true)
    setError(false)

    try {
      const userId = props.id

      // Delete me first
      // So that if anything fails I'm still gone
      await AccountService.accountDelete(userId)

      // Remove user from teams
      teams.map(team => {
        MessagingService.getInstance().leave(team.id)
      })

      // Remove user from channels
      channels.map(channel => {
        MessagingService.getInstance().leave(channel.id)
      })

      // Remove from user sub
      MessagingService.getInstance().leave(userId)

      // Sign me out and
      await AuthService.signout()
      await GraphqlService.signout()

      // Close this the confirm modal
      setConfirmAccountDeleteModal(false)

      // Reload to force refresh
      window.location.reload()
    } catch (e) {
      logger(e)
      setLoading(false)
      setError('There has been an error')
    }
  }

  const handlePasswordUpdate = async () => {
    if (newPassword != newPasswordConfirm) return setError('Passwords must match')

    setLoading(true)
    setError(false)

    try {
      const userId = props.id
      const auth = await AccountService.updatePassword(userId, currentPassword, newPassword)

      if (auth.status == 401) {
        setError('Wrong password')
        setLoading(false)
      } else {
        setLoading(false)
        setNotification('Successfully updated')
      }
    } catch (e) {
      setLoading(false)
      setError('There has been an error')
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(false)

    try {
      const updatedUser = { name, description, username, image, timezone: moment.tz.names()[timezone] }
      const userId = props.id

      const { data } = await GraphqlService.getInstance().updateUser(userId, updatedUser)

      // Either way, stop loading
      setLoading(false)

      // This is a bit assumptive
      // Only reason it would fail
      // TODO: Handle this better
      if (!data.updateUser) {
        setError('This username is already in use')
        setNotification(null)
      } else {
        dispatch(updateUser(updatedUser))
        setError(null)
        setNotification('Succesfully updated')

        // We want to notifu all the team we belong in
        teams.map(team => dispatch(updateChannelUserNameImage(userId, team.id, name, image)))
      }
    } catch (e) {
      setLoading(false)
      setError('Email or username are taken')
    }
  }

  const handleFileChange = async e => {
    if (e.target.files.length == 0) return

    setLoading(true)
    setError(null)

    try {
      const file = e.target.files[0]
      const { name, type, size } = file
      const raw = await UploadService.getUploadUrl(name, type, false)
      const { url } = await raw.json()
      const upload = await UploadService.uploadFile(url, file, type)
      const uri = upload.url.split('?')[0]
      const mime = type

      setImage(uri)
      setLoading(false)
    } catch (e) {
      setLoading(false)
      setError('Error uploading file')
    }
  }

  // Email management
  const handleEmailAddressConfirm = async emailAddress => {
    setLoading(true)
    setError(false)

    try {
      const userId = props.id
      const auth = await AccountService.confirmEmail(emailAddress, userId)

      setLoading(false)
      setNotification('We have sent you a confirmation email')
    } catch (e) {
      setLoading(false)
      setError('There has been an error')
    }
  }

  const handleEmailAddressDelete = async emailAddress => {
    if (emails.length == 1) return setError('You need at least 1 connected email address')

    if (confirm('Are you sure?')) {
      setLoading(true)
      setError(false)

      try {
        const userId = props.id
        const auth = await AccountService.deleteEmail(emailAddress, userId)

        setLoading(false)
        setNotification('Succesfully removed email')
        setEmails(emails.filter(e => e.address != emailAddress))
      } catch (e) {
        setLoading(false)
        setError('There has been an error')
      }
    }
  }

  const handleEmailAddressAdd = async () => {
    if (newEmailAddress.trim() == '') return setError('This field is mandatory')

    setLoading(true)
    setError(false)

    try {
      const userId = props.id
      const auth = await AccountService.addEmail(newEmailAddress, userId)

      if (auth.status == 401) {
        setError('Email is already taken')
        setLoading(false)
      } else {
        setLoading(false)
        setEmails([...emails, { address: newEmailAddress, confirmed: false }])
        setNewEmailAddress('')
        setNotification('Succesfully added new email')
      }
    } catch (e) {
      setLoading(false)
      setError('There has been an error')
    }
  }

  // Render functions to make things easier
  const renderProfile = () => {
    return (
      <div className="row align-items-start w-100">
        <div className="column w-100">
          {error && <Error message={error} onDismiss={() => setError(false)} />}
          {loading && <Spinner />}
          {notification && <Notification text={notification} onDismiss={() => setNotification(false)} />}

          <div className="row w-100 p-20">
            <input
              accept="image/png,image/jpg"
              type="file"
              className="hide"
              ref={fileRef}
              onChange={handleFileChange}
            />

            <Avatar image={image} className="mr-20" size="large" />

            <div className="column pl-10">
              <div className="row pb-5">
                <Text className="h5 color-d2">{name}</Text>
              </div>
              <div className="row">
                <Text className="p color-blue button bold" onClick={() => fileRef.current.click()}>
                  Update profile image
                </Text>
              </div>
            </div>
          </div>

          <div className="column p-20 flex-1 scroll w-100">
            <Input
              label="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter full name"
              className="mb-20"
            />

            <Input
              label="Username"
              value={username}
              onChange={e => setUsername(stripSpecialChars(e.target.value))}
              placeholder="Username"
              className="mb-20"
            />

            <Textarea
              label="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter bio"
              className="mb-20"
              rows={2}
            />

            <div className="mb-20 w-100">
              <Select
                label="Your timezone"
                onSelect={index => setTimezone(index)}
                selected={timezone}
                options={moment.tz.names().map((timezone, index) => {
                  return {
                    option: timezone.replace('_', ' '),
                    value: timezone,
                  }
                })}
              />
            </div>

            <Button theme="muted" onClick={handleSubmit} text="Save" />
          </div>
        </div>
      </div>
    )
  }

  const renderEmailAccounts = () => {
    return (
      <div className="row align-items-start w-100">
        <div className="column w-100">
          {error && <Error message={error} onDismiss={() => setError(false)} />}
          {loading && <Spinner />}
          {notification && <Notification text={notification} onDismiss={() => setNotification(false)} />}

          <div className="column p-20 flex-1 scroll w-100">
            <Text className="color-d2 h5 mb-10">Connected email addresses</Text>
            <Text className="color-d0 p mb-30">Use your Weekday account with more than just 1 email address.</Text>

            <Table width="100%">
              <tbody>
                {emails.map((email, index) => (
                  <EmailAddressRow
                    key={index}
                    onDelete={handleEmailAddressDelete}
                    onConfirm={handleEmailAddressConfirm}
                    email={email}
                  />
                ))}
              </tbody>
            </Table>

            <Input
              label="Connect another email address"
              value={newEmailAddress}
              onChange={e => setNewEmailAddress(e.target.value)}
              placeholder="Enter your email"
            />

            <Button text="Add" theme="muted" className="mt-20" onClick={handleEmailAddressAdd} />
          </div>
        </div>
      </div>
    )
  }

  const renderSecurity = () => {
    return (
      <div className="row align-items-start w-100">
        <div className="column w-100">
          {error && <Error message={error} onDismiss={() => setError(false)} />}
          {loading && <Spinner />}
          {notification && <Notification text={notification} onDismiss={() => setNotification(false)} />}

          <div className="column p-20 flex-1 scroll w-100">
            <Text className="color-d2 h5 mb-10">Change & update your password</Text>
            <Text className="color-d0 p mb-30">You need to know your old password.</Text>

            <Input
              label="Current password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder=""
              type="password"
              autocomplete="no"
              className="mb-20"
            />

            <Input
              label="New password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder=""
              type="password"
              autocomplete="no"
              className="mb-20"
            />

            <Input
              label="Confirm new password"
              value={newPasswordConfirm}
              onChange={e => setNewPasswordConfirm(e.target.value)}
              placeholder=""
              type="password"
              autocomplete="no"
              className="mb-20"
            />

            <Button text="Update" theme="muted" onClick={handlePasswordUpdate} />
          </div>
        </div>
      </div>
    )
  }

  const renderDangerZone = () => {
    return (
      <div className="row align-items-start w-100">
        <div className="column w-100">
          {error && <Error message={error} onDismiss={() => setError(false)} />}
          {loading && <Spinner />}
          {notification && <Notification text={notification} onDismiss={() => setNotification(false)} />}

          {confirmAccountDeleteModal && (
            <ConfirmModal
              onOkay={handleAccountDelete}
              onCancel={() => setConfirmAccountDeleteModal(false)}
              text="Are you sure you want to delete your account, it can not be undone?"
              title="Are you sure?"
            />
          )}

          <div className="column p-20 flex-1 scroll w-100">
            <Text className="color-red h5 mb-10">Here be dragons!</Text>
            <Text className="color-d0 p mb-30">
              Once you delete your account, you will only be able to re-activate it by contacting{' '}
              <a href="mailto:support@weekday.work">support@weekday.work</a>.
            </Text>

            <Button theme="red" text="Delete" onClick={() => setConfirmAccountDeleteModal(true)} />
          </div>
        </div>
      </div>
    )
  }

  const renderNotifications = () => {
    return (
      <div className="row align-items-start w-100">
        <div className="column w-100">
          {error && <Error message={error} onDismiss={() => setError(false)} />}
          {loading && <Spinner />}
          {notification && <Notification text={notification} onDismiss={() => setNotification(false)} />}

          <div className="column p-20 flex-1 scroll w-100">
            <Text className="color-d2 h5 mb-10">Notifications</Text>
            <Text className="color-d0 p mb-30">Manage notifications you receive.</Text>

            <div className="row">
              <Toggle on={false} onChange={on => logger(on)} />
              <Text className="p color-blue button bold pl-10">
                {false ? 'Receive notifications for new messages' : "Don't receive notifications for new messages"}
              </Text>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ModalPortal>
      <Modal title="Account" width={700} height="90%" onClose={props.onClose}>
        <Tabbed
          start={0}
          onChange={i => {
            setNotification(null)
            setError(null)
          }}
          panels={[
            {
              title: 'Profile',
              show: true,
              content: renderProfile(),
            },
            {
              title: 'Email accounts',
              show: true,
              content: renderEmailAccounts(),
            },
            {
              title: 'Security',
              show: true,
              content: renderSecurity(),
            },
            {
              title: 'Notifications',
              show: false,
              content: renderNotifications(),
            },
            {
              title: 'Danger zone',
              show: true,
              content: renderDangerZone(),
            },
          ]}
        />
      </Modal>
    </ModalPortal>
  )
}

AccountModal.propTypes = {
  onClose: PropTypes.func,
  id: PropTypes.string,
}

const EmailAddressRow = props => {
  return (
    <tr>
      <TableCell width="50%">
        <MailAddress>{props.email.address}</MailAddress>
        <MailStatus>{props.email.confirmed ? '✓ Confirmed' : 'Not confirmed'}</MailStatus>
      </TableCell>
      <TableCell width="50%">
        <div className="row w-100 justify-content-end">
          {!props.email.confirmed && (
            <MailButtonConfirm onClick={() => props.onConfirm(props.email.address)} className="button">
              Send code again
            </MailButtonConfirm>
          )}

          <IconComponent
            color="#617691"
            icon="delete"
            onClick={() => props.onDelete(props.email.address)}
            size={15}
            className="button"
          />
        </div>
      </TableCell>
    </tr>
  )
}

const Text = styled.div``

const Table = styled.table`
  margin-bottom: 50px;
  margin-top: 20px;
`

const TableCell = styled.td`
  border-bottom: 1px solid #edf0f2;
  height: 30px;
`

const MailAddress = styled.div`
  color: #007af5;
  font-size: 12px;
  font-weight: 600;
`

const MailStatus = styled.div`
  color: #858e96;
  font-size: 12px;
  font-weight: 400;
  margin-top: 3px;
  margin-bottom: 5px;
`

const MailButtonConfirm = styled.span`
  color: #858e96;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  margin-right: 10px;
`

const MailButtonDelete = styled.span`
  color: #d93025;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  margin-left: 10px;
`
