import React, { useState, useEffect, memo } from 'react'
import '../helpers/extensions'
import styled from 'styled-components'
import { logger, sortMessagesByCreatedAt } from '../helpers/util'
import { Popup, Menu, Avatar, Spinner } from '../elements'
import MessageComponent from '../components/message.component'
import moment from 'moment'
import { useSelector, useDispatch } from 'react-redux'
import { IconComponent } from './icon.component'

export const PinnedComponent = props => {
  const [messages, setMessages] = useState([])
  const dispatch = useDispatch()
  const channel = useSelector(state => state.channel)

  useEffect(() => {
    if (!props.messages) return

    const messages = props.messages.map((message, index) => {
      let append = false
      let showDate = false
      let previousDate = null
      let previousUserId = null
      const previousIndex = index - 1
      const currentDate = moment(props.messages[index].createdAt)
      const currentUserId = props.messages[index].user ? props.messages[index].user.id : null

      if (previousIndex >= 0) {
        previousDate = moment(props.messages[previousIndex].createdAt)
        previousUserId = props.messages[previousIndex].user ? props.messages[previousIndex].user.id : null

        if (previousUserId != null && currentUserId != null) {
          if (previousUserId == currentUserId && currentDate.format('X') - previousDate.format('X') <= 60) append = true
        }

        if (currentDate.format('DDD') != previousDate.format('DDD')) {
          showDate = true
        }
      }

      return {
        ...message,
        showDate,
        append,
        dateLabel: moment(message.createdAt).format('dddd, MMMM Do'),
      }
    })

    setMessages(sortMessagesByCreatedAt(messages))
  }, [props.messages])

  return (
    <Container className="column">
      <Header className="row">
        <HeaderTitle>Pinned Messages</HeaderTitle>
        <IconComponent icon="x" size={25} color="#040b1c" className="mr-5 button" onClick={props.onClose} />
      </Header>

      <Messages>
        {messages.map((message, index) => {
          return (
            <React.Fragment key={index}>
              {message.showDate && (
                <DateDivider>
                  <DateDividerText>{message.dateLabel}</DateDividerText>
                  <DateDividerLine />
                </DateDivider>
              )}

              <MessageComponent
                pinned
                hideParentMessages={props.hideParentMessages}
                message={message}
                append={message.append && !message.showDate}
                highlight={props.highlight}
                setUpdateMessage={props.setUpdateMessage}
                setReplyMessage={props.setReplyMessage}
              />
            </React.Fragment>
          )
        })}
      </Messages>
    </Container>
  )
}

const Messages = styled.div`
  padding: 20px;
  padding-top: 10px;
  padding-bottom: 0px;
  flex: 1;
  width: 100%;
  position: relative;
`

const DateDivider = styled.div`
  width: 100%;
  margin-top: 15px;
  margin-bottom: 20px;
  text-align: center;
  position: relative;
`

const DateDividerText = styled.span`
  font-size: 10px;
  z-index: 2;
  position: relative;
  font-weight: 600;
  color: #adb5bd;
  background: #f2f3f5;
  border-radius: 5px;
  padding: 7px;
  text-transform: uppercase;
`

const DateDividerLine = styled.div`
  z-index: 1;
  position: absolute;
  height: 1px;
  width: 100%;
  background-color: #f2f3f5;
  top: 50%;
  left: 0px;
`
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
