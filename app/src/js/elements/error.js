import React from 'react'
import styled from 'styled-components'
import { THEMES } from './themes'
const Container = styled.div`
  position: relative;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 30px;
  background: ${props => THEMES.ERROR[props.theme].BACKGROUND_COLOR};
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: center;
  justify-content: center;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 30px;
  visibility: visible;
  opacity: 1;
  transition: visibility 0s, opacity 0.1s linear;
  z-index: 10000;
`
const Text = styled.div`
  color: ${props => THEMES.ERROR[props.theme].COLOR};
  font-size: ${props => THEMES.ERROR[props.theme].FONT_SIZE}px;
  font-weight: 400;
`
export const Error = props => {
  if (!props.message) return null
  const theme = props.theme ? props.theme : 'default'
  const [errorMessage, setErrorMessage] = React.useState('')
  React.useEffect(() => {
    if (props.message != errorMessage) {
      // update our error message
      setErrorMessage(props.message)
    }
  }, [props.message])
  return (
    <Container theme={theme} onClick={() => (props.onDismiss ? props.onDismiss() : null)}>
      <Text theme={theme}>{errorMessage}</Text>
    </Container>
  )
}
