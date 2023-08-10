import React, { useState, useEffect, memo } from 'react'
import '../helpers/extensions'
import styled from 'styled-components'
import { logger, sortMessagesByCreatedAt } from '../helpers/util'
import { Popup, Menu, Avatar, Spinner } from '../elements'
import MessageComponent from '../components/message.component'
import moment from 'moment'

export default props => {
  const [messages, setMessages] = useState([])

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
    <React.Fragment>
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
              thread={props.thread}
              hideParentMessages={props.hideParentMessages}
              message={message}
              pinned={false}
              append={message.append && !message.showDate}
              highlight={props.highlight}
              setUpdateMessage={props.setUpdateMessage}
              setReplyMessage={props.setReplyMessage}
            />
          </React.Fragment>
        )
      })}
    </React.Fragment>
  )
}

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
