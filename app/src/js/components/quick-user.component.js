import React from 'react'
import styled from 'styled-components'
import { Subject } from 'rxjs'
import PropTypes from 'prop-types'
import { debounceTime } from 'rxjs/operators'
import GraphqlService from '../services/graphql.service'
import { Popup, User, Members, Spinner } from '../elements'

export default class QuickUser extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      filter: '',
      index: 0,
      members: [],
      loading: false,
      error: false,
    }

    this.filterRef = React.createRef()
    this.onSearch = this.onSearch.bind(this)
    this.onSearch$ = new Subject()
    this.subscription = null
  }

  onSearch(e) {
    const search = e.target.value
    this.setState({ filter: search })
    this.onSearch$.next(search)
  }

  componentWillUnmount() {
    if (this.subscription) this.subscription.unsubscribe()
  }

  componentDidMount() {
    this.subscription = this.onSearch$.pipe(debounceTime(250)).subscribe(debounced => this.fetchResults())
  }

  componentDidUpdate() {
    if (!this.filterRef) return
    if (this.filterRef.focus) this.filterRef.focus()
  }

  async fetchResults() {
    if (this.state.filter == '') return this.setState({ members: [] })
    this.setState({ loading: true })

    try {
      const { data } = await GraphqlService.getInstance().searchTeamMembers(this.props.teamId, this.state.filter, 0)

      // Create a results object for the users
      // Dedupe existing users
      const members = data.searchTeamMembers.filter(member => member.user.id != this.props.userId)

      // Update our UI with our results
      this.setState({
        loading: false,
        members,
      })
    } catch (e) {}
  }

  render() {
    // So far this is ONLY coming from the modal.component for the tasks.extension
    // Nowhere else - but good idea to maybe extend this to handle an array
    const members = this.props.stickyUser
      ? [{ user: this.props.stickyUser }, ...this.state.members]
      : this.state.members

    return (
      <Popup
        visible={this.props.visible}
        handleDismiss={() => {
          this.setState({ filter: '', members: [] }, () => this.props.handleDismiss())
        }}
        width={this.props.width || 200}
        direction={this.props.direction || 'right-bottom'}
        content={
          <React.Fragment>
            {this.state.loading && <Spinner />}

            <Filter
              autoFocus
              ref={ref => (this.filterRef = ref)}
              placeholder="Search for users"
              value={this.state.filter}
              onChange={this.onSearch}
            />

            <MembersContainer>
              <Members
                members={members}
                handleAccept={member => {
                  this.setState(
                    {
                      filter: '',
                      members: [],
                    },
                    () => {
                      // Process the choice
                      this.props.handleAccept(member)
                    }
                  )
                }}
              />
            </MembersContainer>
          </React.Fragment>
        }
      >
        {this.props.children}
      </Popup>
    )
  }
}

QuickUser.propTypes = {
  visible: PropTypes.bool,
  width: PropTypes.number,
  direction: PropTypes.string,
  userId: PropTypes.string,
  teamId: PropTypes.string,
  handleAccept: PropTypes.func,
  handleDismiss: PropTypes.func,
  children: PropTypes.any,
  stickyUser: PropTypes.any, // This is a USER type (not member type)
}

const MembersContainer = styled.div`
  width: 100%;

  @media only screen and (max-width: 768px) {
    border-radius: 0px;
    bottom: none !important;
    transform: translateY(0%);
    position: relative;
    top: 0px !important;
    left: 0px;
    height: fit-content;
  }
`

const Filter = styled.input`
  border: none;
  background: transparent;
  color: #acb5bd;
  font-size: 15px;
  font-weight: 400;
  padding: 15px;

  @media only screen and (max-width: 768px) {
    font-size: 16px;
  }

  &::placeholder {
    color: #acb5bd;
  }
`
