import React from 'react'
import { User } from './user'
export class Members extends React.Component {
  static getDerivedStateFromProps(props, state) {
    return {
      members: props.members.filter((member, index) => (index <= 5 ? true : false)),
    }
  }
  constructor(props) {
    super(props)
    this.state = { index: 0, members: [] }
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }
  handleKeyPress(e) {
    // Move up
    if (e.keyCode == 38)
      this.setState({ index: this.state.index - 1 < 0 ? this.state.members.length - 1 : this.state.index - 1 })
    // Move down
    if (e.keyCode == 40)
      this.setState({ index: this.state.index + 1 == this.state.members.length ? 0 : this.state.index + 1 })
    // Press enter
    if (e.keyCode == 13) {
      if (this.state.members.length > 0) this.props.handleAccept(this.state.members[this.state.index])
    }
  }
  componentDidMount() {
    document.addEventListener('keyup', this.handleKeyPress)
  }
  componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyPress)
  }

  render() {
    return (
      <React.Fragment>
        {this.state.members.map((member, index) => {
          return (
            <User
              key={index}
              active={index == this.state.index}
              image={member.user.image}
              name={member.user.name}
              label={'@' + member.user.username}
              onClick={() => this.props.handleAccept(member)}
            />
          )
        })}
      </React.Fragment>
    )
  }
}
