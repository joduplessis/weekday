import React from 'react'
import styled from 'styled-components'
const Container = styled.div`
  background: white;
  width: 35px !important;
  position: relative;
  height: 24px !important;
  border: 1px solid #f1f3f5;
  box-shadow: 0px 0px 16px -9px rgba(0, 0, 0, 0.75);
  cursor: pointer;
  overflow: hidden;
  border-radius: 35px !important;
  box-sizing: border-box;
`
const Circle = styled.div`
  position: absolute;
  top: 3px !important;
  left: ${props => (props.on ? '13px' : '4px')} !important;
  background-color: ${props => (props.on ? '#007af5' : '#CFD6DD')};
  border-radius: 50%;
  transition: left 0.5s, background-color 0.5s;
  width: 16px !important;
  height: 16px !important;
  box-sizing: border-box;
`
export const Toggle = props => {
  const [on, setOn] = React.useState(props.on)
  React.useEffect(() => setOn(props.on), [props.on])
  return (
    <Container
      onClick={() => {
        props.onChange(!on)
        setOn(!on)
      }}
    >
      <Circle on={on} />
    </Container>
  )
}
