import React from 'react'
import styled from 'styled-components'
import { Popup } from './popup'
const Label = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: #cfd4d9;
  text-transform: uppercase;
  padding-bottom: 5px;
`
const ListContainer = styled.div`
  width: 100%;
  background: white;
  position: relative;
  height: ${props => {
    switch (props.size) {
      case 'large':
        return props.height * 41
      default:
        return props.height * 31
    }
  }}px;
  max-height: ${props => {
    switch (props.size) {
      case 'large':
        return 5 * 41
      default:
        return 5 * 31
    }
  }}px;
  overflow: scroll;
`
const Item = styled.div`
  padding-left: 10px;
  padding-right: 10px;
  height: ${props => {
    switch (props.size) {
      case 'large':
        return '40px'
      default:
        return '30px'
    }
  }};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: flex-start;
  border-top: 1px solid #edf0f2;
  opacity: 1;
  transition: background 0.25s;
  background: ${props => (props.active ? '#f8f9fa' : 'transparent')};

  &:hover {
    background: #f8f9fa;
  }
`
const ItemText = styled.div`
  color: #485056;
  font-size: ${props => {
    switch (props.size) {
      case 'large':
        return '23px'
      default:
        return '13px'
    }
  }};
  font-weight: 500;
`
const InnerContainer = styled.div`
  width: 100%;
  background: white;
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;
  position: relative;
  border-radius: 7px;
  height: ${props => {
    switch (props.size) {
      case 'large':
        return '40px'
      default:
        return '30px'
    }
  }};
`
const Text = styled.div`
  color: #333b3f;
  font-size: ${props => {
    switch (props.size) {
      case 'large':
        return '23px'
      default:
        return '13px'
    }
  }};
  font-weight: 600;
  padding-left: 10px;
  padding-right: 10px;
  flex: 1;
  cursor: pointer;
  opacity: 1;
  transition: opacity 0.25s;

  &:hover {
    opacity: 0.75;
  }
`
const Button = styled.div`
  cursor: pointer;
  padding-left: 5px;
  padding-right: 15px;
  height: 20px;
  opacity: 1;
  transition: opacity 0.25s;

  &:hover {
    opacity: 0.5;
  }
`
const Container = styled.div`
  width: 100%;
  background: white;
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;
  position: relative;
  border: 1px solid #edf0f2;
  border: 3px solid #f1f3f5;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.02);
  border-radius: 7px;
  position: relative;
  transition: border 0.2s;

  &:focus {
    outline: none;
    /*box-shadow: inset 0px 0px 0px 3px #F0F3F5;*/
    border: 3px solid #dee2e5;
  }
`
export class Select extends React.Component {
  constructor(props) {
    super(props)
    this.state = { index: 0, visible: false }
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }
  handleKeyPress(e) {
    // Move up
    if (e.keyCode == 38)
      this.setState({ index: this.state.index - 1 < 0 ? this.props.options.length - 1 : this.state.index - 1 })
    // Move down
    if (e.keyCode == 40)
      this.setState({ index: this.state.index + 1 == this.props.options.length ? 0 : this.state.index + 1 })
    // Press enter
    if (e.keyCode == 13) {
      if (this.props.options.length > 0) this.props.onSelect(this.state.index)
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
        {this.props.label && <Label bold={true}>{this.props.label}</Label>}

        <Container>
          <Popup
            visible={this.state.visible}
            handleDismiss={() => this.setState({ visible: false })}
            direction="left-bottom"
            width="100%"
            content={
              <ListContainer size={this.props.size} height={this.props.options.length}>
                {this.props.options.map((item, index) => {
                  return (
                    <Item
                      size={this.props.size}
                      active={index == this.state.index}
                      key={index}
                      onClick={() => {
                        this.setState({ visible: false })
                        this.props.onSelect(index)
                      }}
                    >
                      <ItemText size={this.props.size}>{item.option}</ItemText>
                    </Item>
                  )
                })}
              </ListContainer>
            }
          >
            <InnerContainer size={this.props.size}>
              <Text size={this.props.size} onClick={() => this.setState({ visible: true })}>
                {this.props.options[this.props.selected].option}
              </Text>
              <Button onClick={() => this.setState({ visible: true })}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  style={{ fill: '#343a40', transform: ';-ms-filter:' }}
                >
                  <path d="M16.939 7.939L12 12.879 7.061 7.939 4.939 10.061 12 17.121 19.061 10.061z"></path>
                </svg>
              </Button>
            </InnerContainer>
          </Popup>
        </Container>
      </React.Fragment>
    )
  }
}
