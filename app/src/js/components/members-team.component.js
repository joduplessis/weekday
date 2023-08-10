import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import GraphqlService from '../services/graphql.service'
import UploadService from '../services/upload.service'
import ConfirmModal from '../modals/confirm.modal'
import PropTypes from 'prop-types'
import MessagingService from '../services/messaging.service'
import ModalPortal from '../portals/modal.portal'
import { browserHistory } from '../services/browser-history.service'
import styled from 'styled-components'
import {
  Popup,
  Menu,
  Textarea,
  Modal,
  Tabbed,
  Notification,
  Spinner,
  Error,
  User,
  Avatar,
  Button,
  Input,
} from '../elements'
import { IconComponent } from './icon.component'
import { deleteTeam, updateTeam } from '../actions'
import { MEMBER_PAGE_LIMIT } from '../constants'

const TableRow = props => {
  const { member, user } = props
  const [menu, setMenu] = useState(false)
  const [confirmSelfDeleteModal, setConfirmSelfDeleteModal] = useState(false)
  const [confirmMemberDeleteModal, setConfirmMemberDeleteModal] = useState(false)
  const [roles, setRoles] = useState(false)

  return (
    <React.Fragment>
      {confirmSelfDeleteModal && (
        <ConfirmModal
          onOkay={() => {
            props.onLeave()
            setConfirmSelfDeleteModal(false)
          }}
          onCancel={() => setConfirmSelfDeleteModal(false)}
          text="Are you sure you want to leave this team?"
          title="Are you sure?"
        />
      )}

      {confirmMemberDeleteModal && (
        <ConfirmModal
          onOkay={() => {
            props.onDelete(member.user.id)
            setConfirmMemberDeleteModal(false)
          }}
          onCancel={() => setConfirmMemberDeleteModal(false)}
          text="Are you sure you want to remove this person, it can not be undone?"
          title="Are you sure?"
        />
      )}

      <tr>
        <Td width={30}>
          <Avatar size="medium" userId={member.user.id} image={member.user.image} title={member.user.name} />
        </Td>
        <Td>
          <div className="bold">{member.user.id == user.id ? member.user.name + ' (You)' : member.user.name}</div>
          <div className="color-l0">{member.position}</div>
        </Td>
        <Td>
          <Popup
            handleDismiss={() => setRoles(false)}
            visible={roles}
            width={200}
            direction="right-bottom"
            content={
              <Menu
                items={[
                  {
                    text: `Admin ${member.role == 'ADMIN' ? '(current)' : ''}`,
                    onClick: () => {
                      props.onRoleChange(member.user.id, 'ADMIN')
                      setRoles(false)
                    },
                  },
                  {
                    text: `Member ${member.role == 'MEMBER' ? '(current)' : ''}`,
                    onClick: () => {
                      props.onRoleChange(member.user.id, 'MEMBER')
                      setRoles(false)
                    },
                  },
                  {
                    text: `Guest ${member.role == 'GUEST' ? '(current)' : ''}`,
                    onClick: () => {
                      props.onRoleChange(member.user.id, 'GUEST')
                      setRoles(false)
                    },
                  },
                ]}
              />
            }
          >
            <span className="color-blue button bold underline" onClick={() => (props.admin ? setRoles(true) : null)}>
              {member.role.toTitleCase()}
            </span>
          </Popup>
        </Td>
        <Td>
          <span className="">{member.user.timezone ? member.user.timezone.replace('_', ' ') : 'Not set yet'}</span>
        </Td>
        <Td>
          <Popup
            handleDismiss={() => setMenu(false)}
            visible={menu}
            width={275}
            direction="right-bottom"
            content={
              <Menu
                items={[
                  {
                    hide: member.user.id != user.id,
                    icon: <IconComponent icon="user-minus" size={18} color="#11161c" />,
                    text: 'Leave team',
                    onClick: () => setConfirmSelfDeleteModal(true),
                  },
                  {
                    hide: member.user.id == user.id || !props.admin,
                    icon: <IconComponent icon="user-minus" size={18} color="#11161c" />,
                    text: 'Remove person from team',
                    onClick: () => setConfirmMemberDeleteModal(true),
                  },
                  {
                    hide: member.user.id == user.id,
                    icon: <IconComponent icon="message-circle" size={18} color="#11161c" />,
                    text: 'Start conversation',
                    onClick: () => props.onConversationStart(member.user),
                  },
                ]}
              />
            }
          >
            <IconComponent icon="more-v" size={20} color="#475669" className="button" onClick={() => setMenu(true)} />
          </Popup>
        </Td>
      </tr>
    </React.Fragment>
  )
}

export default function MembersTeamComponent(props) {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(null)
  const [notification, setNotification] = useState(null)
  const [page, setPage] = useState(0)
  const [pages, setPages] = useState(0)
  const [members, setMembers] = useState([])
  const [totalMembers, setTotalMembers] = useState(0)
  const [filter, setFilter] = useState('')
  const [filterTimeout, setFilterTimeout] = useState(null)
  const dispatch = useDispatch()
  const user = useSelector(state => state.user)
  const limit = MEMBER_PAGE_LIMIT

  const handleTeamMemberRoleChange = async (userId, role) => {
    setLoading(true)
    setError(null)

    try {
      const teamId = props.id

      await GraphqlService.getInstance().updateTeamMemberRole(teamId, userId, role)

      setLoading(false)
      setMembers(members.map(member => (member.user.id == userId ? { ...member, role } : member)))
    } catch (e) {
      setLoading(false)
      setError('Error setting admin')
    }
  }

  const handleTeamMemberDelete = async userId => {
    setLoading(true)
    setError(null)

    try {
      const teamId = props.id
      const deleteTeamMember = await GraphqlService.getInstance().deleteTeamMember(teamId, userId)

      // Set loading to false
      setLoading(false)
      setTotalMembers(totalMembers - 1)

      // And refetch people so we remove them from the list
      fetchTeamMembers(page, filter)
    } catch (e) {
      setLoading(false)
      setError('Error deleting team member')
    }
  }

  const handleTeamLeave = async () => {
    setLoading(true)
    setError(null)

    try {
      const teamId = props.id
      const userId = user.id
      const deleteTeamMember = await GraphqlService.getInstance().deleteTeamMember(teamId, userId)

      setLoading(false)
      setTotalMembers(totalMembers - 1)

      // Don't sync this one - because its just for us
      // false is for syncing here
      dispatch(deleteTeam(teamId, false))

      // Redirect the user back to the landing page
      props.onClose()
      browserHistory.push('/app')
    } catch (e) {
      setLoading(false)
      setError('Error deleting self')
    }
  }

  const handleTeamMemberConversationStart = async otherUser => {
    props.createPrivateChannel([otherUser])
    props.onClose()
  }

  const fetchTeamMembers = async (localScopedPage = 0, query = '') => {
    setLoading(true)
    setError(false)

    try {
      const teamId = props.id
      let membersResult = []

      if (query != '') {
        const { data } = await GraphqlService.getInstance().searchTeamMembers(teamId, query, localScopedPage)
        membersResult = data.searchTeamMembers ? data.searchTeamMembers : []
      } else {
        const { data } = await GraphqlService.getInstance().teamMembers(teamId, localScopedPage)
        membersResult = data.teamMembers ? data.teamMembers : []
      }

      // Update our users & bump the page
      setLoading(false)
      setMembers(membersResult)
    } catch (e) {
      setLoading(false)
      setError('Error fetching members')
    }
  }

  const fetchLessTeamMembers = () => {
    setPage(page - 1)
    fetchTeamMembers(page - 1, filter)
  }

  const fetchMoreTeamMembers = () => {
    setPage(page + 1)
    fetchTeamMembers(page + 1, filter)
  }

  const onSearch = e => {
    const query = e.target.value

    // Update the filter
    setFilter(query)

    // First cleat the timeout
    if (filterTimeout) clearTimeout(filterTimeout)

    // Re-add a new one to start again
    setFilterTimeout(
      setTimeout(() => {
        setPage(0)
        fetchTeamMembers(0, query)
      }, 1000)
    )
  }

  useEffect(() => {
    if (!props.id || props.totalMembers == 0) return

    setPages(Math.ceil(props.totalMembers / limit))
    setTotalMembers(props.totalMembers)
    fetchTeamMembers(page)

    // Make sure this is null
    return () => clearTimeout(filterTimeout)
  }, [props.id, props.totalMembers])

  return (
    <React.Fragment>
      {error && <Error message={error} onDismiss={() => setError(false)} />}
      {loading && <Spinner />}
      {notification && <Notification text={notification} onDismiss={() => setNotification(false)} />}

      <div className="flexer p-20 w-100">
        <div className="row pb-20">
          <div className="column flexer">
            {filter == '' && (
              <React.Fragment>
                <div className="h5 color-d2 mb-10">
                  {totalMembers} {totalMembers == 1 ? 'Member' : 'Members'}
                </div>
                <div className="p color-d0 mb-10">
                  Displaying page {page + 1} of {pages}
                </div>
              </React.Fragment>
            )}

            {filter != '' && (
              <React.Fragment>
                <div className="h5 color-d2 mb-10">Searching</div>
                <div className="p color-d0">Finding members that match "{filter}"</div>
              </React.Fragment>
            )}
          </div>

          {filter == '' && (
            <Buttons className="row">
              {page <= pages && page > 0 && (
                <div>
                  <Button text="Previous" theme="muted" className="button" onClick={fetchLessTeamMembers} />
                </div>
              )}

              {page >= 0 && page + 1 != pages && (
                <div>
                  <Button text="Next" theme="muted" className="button" onClick={fetchMoreTeamMembers} />
                </div>
              )}
            </Buttons>
          )}
        </div>

        <Input value={filter} onChange={onSearch} placeholder="Filter members by name" className="mb-20" />

        <table width="100%" border="0" cellPadding={0} cellSpacing={0}>
          <thead>
            <tr>
              <Th></Th>
              <Th>Name</Th>
              <Th>Role</Th>
              <Th>Timezone</Th>
              <Th></Th>
            </tr>
          </thead>

          <tbody>
            {members.map((member, index) => {
              const memberUserId = member.user.id

              return (
                <TableRow
                  admin={props.admin}
                  key={index}
                  member={member}
                  user={user}
                  onLeave={handleTeamLeave}
                  onDelete={handleTeamMemberDelete}
                  onConversationStart={handleTeamMemberConversationStart}
                  onRoleChange={handleTeamMemberRoleChange}
                />
              )
            })}
          </tbody>
        </table>
      </div>
    </React.Fragment>
  )
}

MembersTeamComponent.propTypes = {
  members: PropTypes.array,
  createPrivateChannel: PropTypes.func,
  onClose: PropTypes.func,
  id: PropTypes.string,
  admin: PropTypes.bool,
}

/* const Input = styled.input`
  font-size: 14px;
  border-radius: 5px;
  width: 100%;
  padding: 10px;
  color: #626d7a;
  font-weight: 500;
  background: transparent;
  border: 1px solid #e9edef;

  &::placeholder {
    color: #e9edef;
  }
` */

const Buttons = styled.div`
  div:nth-child(2) {
    margin-left: 5px;
  }
`

const Th = styled.th`
  text-align: left;
  padding: 7px;
  font-weight: 500;
  color: #aeb5bc;
  font-size: 12px;
`

const Td = styled.td`
  text-align: left;
  padding: 7px;
  font-weight: 400;
  color: #343a40;
  font-size: 14px;
  border-top: 1px solid #e9edef;
`
