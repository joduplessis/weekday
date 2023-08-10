import React from 'react'
import styled from 'styled-components'
const LabelText = styled.div`
  font-size: 10px;
  font-weight: ${props => (props.bold ? '900' : '700')};
  color: ${props => (props.bold ? '#ACB5BD' : '#CFD4D9')};
  text-transform: uppercase;
`
export const Label = props => {
  const styles = props.style ? props.style : {}
  return (
    <LabelText style={styles} bold={!!props.bold}>
      {props.children}
    </LabelText>
  )
}
