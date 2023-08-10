import React from 'react'
import styled from 'styled-components'
import GraphqlService from '../services/graphql.service'
import { Popup } from '../elements'
import PropTypes from 'prop-types'

export default class QuickInputComponent extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      filter: '',
    }

    this.filterRef = React.createRef()
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  handleKeyDown(e) {
    if (e.keyCode == 27) this.props.handleDismiss()
    if (e.keyCode == 13) {
      this.props.handleAccept(this.state.filter)
      this.setState({ filter: '' })
    }
  }

  componentDidUpdate() {
    if (!this.filterRef) return
    if (this.filterRef.focus) this.filterRef.focus()
  }

  render() {
    return (
      <Popup
        visible={this.props.visible}
        handleDismiss={this.props.handleDismiss}
        width={this.props.width || 250}
        direction={this.props.direction || 'right-bottom'}
        content={
          <React.Fragment>
            <Filter
              autoFocus
              ref={ref => (this.filterRef = ref)}
              onKeyDown={this.handleKeyDown}
              placeholder={this.props.placeholder}
              value={this.state.filter}
              onChange={e => this.setState({ filter: e.target.value })}
            />
          </React.Fragment>
        }
      >
        {this.props.children}
      </Popup>
    )
  }
}

QuickInputComponent.propTypes = {
  visible: PropTypes.bool,
  handleDismiss: PropTypes.func,
  width: PropTypes.number,
  direction: PropTypes.string,
  placeholder: PropTypes.string,
  handleAccept: PropTypes.func,
  children: PropTypes.any,
}

const Filter = styled.input`
  border: none;
  flex: 1;
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
