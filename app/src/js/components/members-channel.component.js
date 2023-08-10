import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { connect } from 'react-redux'
import styled from 'styled-components'
import MessagingService from '../services/messaging.service'
import moment from 'moment'
import ModalPortal from '../portals/modal.portal'
import { browserHistory } from '../services/browser-history.service'
import PropTypes from 'prop-types'
import { Attachment, Popup, Button, Modal, Error, Spinner, Avatar, Menu, Notification, Input } from '../elements'
import { IconComponent } from './icon.component'
import PreviewComponent from './preview.component'
import GraphqlService from '../services/graphql.service'
import { useParams, useHistory } from 'react-router-dom'
import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import ConfirmModal from '../modals/confirm.modal'
import QuickUserComponent from '../components/quick-user.component'
import { logger } from '../helpers/util'

const TableRow = props => {
  const { member, user } = props
  const [confirmSelfDeleteModal, setConfirmSelfDeleteModal] = useState(false)
  const [confirmMemberDeleteModal, setConfirmMemberDeleteModal] = useState(false)

  return (
    <React.Fragment>
      {confirmSelfDeleteModal && (
        <ConfirmModal
          onOkay={() => {
            props.onLeave()
            setConfirmSelfDeleteModal(false)
          }}
          onCancel={() => setConfirmSelfDeleteModal(false)}
          text="Are you sure you want to leave this channel?"
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
          <Avatar size="medium" image={member.user.image} title={member.user.name} userId={member.user.id} />
        </Td>
        <Td>
          <div className="bold">{member.user.id == user.id ? member.user.name + ' (You)' : member.user.name}</div>
          <div className="color-l0">
            @{`${member.user.username}`}
            {member.user.timezone ? ` − ${member.user.timezone.replace('_', ' ')}` : ''}
          </div>
        </Td>
        <Td>
          <IconComponent
            icon="delete"
            size={15}
            color="#aeb5bc"
            className="button"
            onClick={() => {
              if (user.id == member.user.id) {
                setConfirmSelfDeleteModal(true)
              } else {
                setConfirmMemberDeleteModal(true)
              }
            }}
          />
        </Td>
      </tr>
    </React.Fragment>
  )
}

class MembersChannelComponent extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      notification: null,
      error: null,
      busy: false,
      page: 0,
      members: [],
      results: [],
      filter: '',
      userMenu: false,
    }

    this.scrollRef = React.createRef()

    this.handleScrollEvent = this.handleScrollEvent.bind(this)
    this.handleChannelMemberDelete = this.handleChannelMemberDelete.bind(this)
    this.handleChannelLeave = this.handleChannelLeave.bind(this)
    this.fetchChannelMembers = this.fetchChannelMembers.bind(this)
    this.fetchResults = this.fetchResults.bind(this)
    this.onSearch = this.onSearch.bind(this)
    this.handleAddUsersToChannel = this.handleAddUsersToChannel.bind(this)

    this.onSearch$ = new Subject()
    this.subscription = null
  }

  async handleAddUsersToChannel(member) {
    try {
      const channelId = this.props.channel.id
      const teamId = this.props.team.id
      const { data } = await GraphqlService.getInstance().createChannelMember(channelId, teamId, member)

      this.fetchChannelMembers(true)
    } catch (e) {
      logger(e)
    }
  }

  async fetchChannelMembers(refresh = false) {
    this.setState({
      loading: true,
      error: null,
    })

    try {
      const { channelId } = this.props
      const { data } = await GraphqlService.getInstance().channelMembers(channelId, this.state.page)

      // Update our users & bump the page
      this.setState({
        loading: false,
        members: refresh ? data.channelMembers : [...this.state.members, ...data.channelMembers],
        results: [],
      })
    } catch (e) {
      this.setState({
        loading: false,
        error: 'Error fetching members',
      })
    }
  }

  async handleChannelMemberDelete(userId, memberId) {
    this.setState({
      loading: true,
      error: null,
    })

    try {
      const { channelId } = this.props

      // Make the API call
      await GraphqlService.getInstance().deleteChannelMember(channelId, userId, memberId)

      // Stop loading
      this.setState({ loading: false })

      // Refresh the member list
      // They will be told from the API to leave
      this.fetchChannelMembers(true)
    } catch (e) {
      this.setState({
        loading: false,
        error: 'Error deleting member',
      })
    }
  }

  async handleChannelLeave(memberId) {
    this.setState({
      loading: true,
      error: null,
    })

    try {
      const { channelId, teamId } = this.props
      const userId = this.props.user.id
      const { data } = await GraphqlService.getInstance().deleteChannelMember(channelId, userId, memberId)

      // Stop loading
      this.setState({ loading: false })

      // We will get a notification from the server to:
      // Unsubscribe AGAIN & also delete the channel from the store
      // Refresh the member list (just in case)
      this.fetchChannelMembers(true)

      // Unsub frem receiving messages here
      MessagingService.getInstance().leave(channelId)

      // Redirect the user back to the landing page
      browserHistory.push(`/app/team/${teamId}/`)
      props.onClose()
    } catch (e) {
      this.setState({
        loading: false,
        error: 'Error leaving channel',
      })
    }
  }

  componentDidMount() {
    this.fetchChannelMembers()

    // Here we handle the delay for the yser typing in the search field
    this.subscription = this.onSearch$.pipe(debounceTime(1000)).subscribe(debounced => this.fetchResults())

    // Listen for the user scroll
    this.scrollRef.addEventListener('scroll', this.handleScrollEvent)
  }

  componentWillUnmount() {
    this.scrollRef.removeEventListener('scroll', this.handleScrollEvent)

    // Remove the search filter
    if (this.subscription) this.subscription.unsubscribe()
  }

  onSearch(e) {
    const search = e.target.value
    this.setState({ filter: search })
    this.onSearch$.next(search)
    if (search == '') this.setState({ results: [] })
  }

  async fetchResults() {
    if (this.state.filter == '') return

    this.setState({
      loading: true,
      error: null,
    })

    try {
      const { channelId } = this.props
      const page = 0
      const { data } = await GraphqlService.getInstance().searchChannelMembers(channelId, this.state.filter, page)

      // Update our users & bump the page
      this.setState({
        loading: false,
        results: data.searchChannelMembers ? data.searchChannelMembers : [],
      })
    } catch (e) {
      this.setState({
        loading: false,
        error: 'Error searching members',
      })
    }
  }

  async handleScrollEvent(e) {
    // If the user scvrolls up - then fetch more messages
    // 0 = the top of the container
    if (this.scrollRef.scrollTop + this.scrollRef.clientHeight >= this.scrollRef.scrollHeight) {
      this.setState({ page: this.state.page + 1 }, () => {
        this.fetchChannelMembers()
      })
    }
  }

  render() {
    return (
      <Container className="column">
        <Header className="row">
          <HeaderTitle>Channel Members</HeaderTitle>
          <IconComponent icon="x" size={25} color="#040b1c" className="mr-5 button" onClick={this.props.onClose} />
        </Header>

        {this.state.error && <Error message={this.state.error} onDismiss={() => this.setState({ error: null })} />}
        {this.state.notification && (
          <Notification text={this.state.notification} onDismiss={() => this.setState({ notification: null })} />
        )}
        {this.state.loading && <Spinner />}

        {this.state.results.length == 0 && (
          <MembersText>
            There {this.props.channel.totalMembers == 1 ? 'is' : 'are'}{' '}
            <strong>{this.props.channel.totalMembers}</strong>{' '}
            {this.props.channel.totalMembers == 1 ? 'member' : 'members'} in this channel
          </MembersText>
        )}

        {this.state.results.length != 0 && (
          <MembersText>
            There {this.state.results.length == 1 ? 'is' : 'are'} <strong>{this.state.results.length}</strong>{' '}
            {this.state.results.length == 1 ? 'member' : 'members'} in your search
          </MembersText>
        )}

        <div className="p-20 w-100">
          <div className="row">
            <Input
              value={this.state.filter}
              onChange={this.onSearch}
              placeholder="Filter members by name"
              className="mr-5"
            />
            <div style={{ width: 10 }} />
            {this.props.hasAdminPermission && (
              <QuickUserComponent
                userId={this.props.user.id}
                teamId={this.props.team.id}
                visible={this.state.userMenu}
                width={250}
                direction="right-bottom"
                handleDismiss={() => this.setState({ userMenu: false })}
                handleAccept={member => this.handleAddUsersToChannel(member)}
              >
                <IconComponent
                  icon="plus-circle"
                  size={15}
                  color="#626d7a"
                  className="button"
                  onClick={() => this.setState({ userMenu: true })}
                />
              </QuickUserComponent>
            )}
          </div>
        </div>

        <Members>
          <MembersScrollContainer ref={ref => (this.scrollRef = ref)}>
            <div className="p-20 pt-0">
              {this.state.results.length == 0 && (
                <table width="100%" border="0" cellPadding={0} cellSpacing={0}>
                  <tbody>
                    {this.state.members.map((member, index) => {
                      if (
                        this.state.filter != '' &&
                        !member.user.name.toLowerCase().match(new RegExp(this.state.filter.toLowerCase() + '.*'))
                      )
                        return null

                      const memberId = member.id

                      return (
                        <TableRow
                          hasAdminPermission={this.props.hasAdminPermission}
                          key={index}
                          member={member}
                          user={this.props.user}
                          onLeave={() => this.handleChannelLeave(memberId)}
                          onDelete={userId => this.handleChannelMemberDelete(userId, memberId)}
                        />
                      )
                    })}
                  </tbody>
                </table>
              )}

              {this.state.results.length != 0 && (
                <table width="100%" border="0" cellPadding={0} cellSpacing={0}>
                  <tbody>
                    {this.state.results.map((member, index) => {
                      if (
                        this.state.filter != '' &&
                        !member.user.name.toLowerCase().match(new RegExp(this.state.filter.toLowerCase() + '.*'))
                      )
                        return null

                      return (
                        <TableRow
                          hasAdminPermission={this.props.hasAdminPermission}
                          key={index}
                          member={member}
                          user={this.props.user}
                          onLeave={() => this.handleChannelLeave()}
                          onDelete={userId => this.handleChannelMemberDelete(userId)}
                        />
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </MembersScrollContainer>
        </Members>
      </Container>
    )
  }
}

const mapDispatchToProps = {}

const mapStateToProps = state => {
  return {
    user: state.user,
    team: state.team,
    channel: state.channel,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MembersChannelComponent)

MembersChannelComponent.propTypes = {
  onClose: PropTypes.func,
  onMemberAdd: PropTypes.func,
  hasAdminPermission: PropTypes.bool,
  channelId: PropTypes.string,
  teamId: PropTypes.string,
  user: PropTypes.any,
  team: PropTypes.any,
  channel: PropTypes.any,
}

const Container = styled.div`
  display: flex;
  width: 300px;
  height: 100%;
  border-left: 1px solid #f1f3f5;

  @media only screen and (max-width: 768px) {
    width: 100%;
    position: absolute;
    left: 0px;
    trop: 0px;
    height: 100%;
    background: white;
    border-left: none;
    z-index: 5;
  }
`

const Header = styled.div`
  width: 100%;
  background: transparent;
  border-bottom: 1px solid #f1f3f5;
  background: white;
  padding 15px 25px 15px 25px;
  display: flex;
  position: relative;
`

const HeaderTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  font-style: normal;
  color: #040b1c;
  transition: opacity 0.5s;
  display: inline-block;
  margin-bottom: 2px;
  width: max-content;
  flex: 1;
`

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

const Members = styled.div`
  padding: 20px;
  padding-top: 10px;
  padding-bottom: 0px;
  flex: 1;
  width: 100%;
  position: relative;
`

const MembersText = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: #adb5bd;
  font-weight: regular;
  margin: 20px;
  margin-bottom: 0px;
`

const MembersScrollContainer = styled.div`
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  overflow: scroll;
`
