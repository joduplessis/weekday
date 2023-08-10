import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import EventService from '../services/event.service'
import { TOAST } from '../constants'

export default function ToastComponent(props) {
  const [text, setText] = useState(null)

  useEffect(() => {
    EventService.getInstance().on(TOAST, message => {
      setText(message)
      setTimeout(() => setText(null), 2000)
    })
  }, [])

  if (!text) return null

  return <Toast onClick={() => setText(null)}>{text}</Toast>
}

const Toast = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #11171d;
  padding: 10px 20px 10px 20px;
  border-radius: 5px;
  z-index: 99999999999;
  color: #edf0f2;
  font-weight: 600;
  font-size: 14px;
  transition: opacity 1s;
`
