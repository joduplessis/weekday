import React from 'react'
import styled from 'styled-components'
const Container = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
`
const Inner = styled.div`
  flex: 1;
  padding: 5px;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  align-content: center;
  justify-content: flex-start;
  position: relative;
`
const Bar = styled.div`
  flex: 1;
  border-radius: 5px;
  width: ${props => props.percentage}%;
  height: 100%;
  background-color: ${props => props.color}
  display: flex;
  flex-direction: row;
  align-items: stretch;
  align-content: center;
  justify-content: flex-start;
  position: absolute;
  left: 0px;
  top: 0px;
  z-index: 1;
`
const Text = styled.div`
  font-weight: 400;
  font-style: normal;
  color: #404c5a;
  display: inline-block;
  font-size: 13px;
  position: relative;
  z-index: 2;
  flex: 2;
  padding: 5px;
`
const Percentage = styled.div`
  font-weight: 700;
  font-style: normal;
  color: #404c5a;
  display: inline-block;
  font-size: 10px;
  position: relative;
  z-index: 2;
  padding: 5px;
`
const ProgressComponent = props => {
  return (
    <Container>
      <Bar percentage={props.percentage} color={props.color} />
      <Inner>
        {props.labels && (
          <React.Fragment>
            <Text>{props.text}</Text>
            <Percentage>{props.percentage}%</Percentage>
          </React.Fragment>
        )}
      </Inner>
    </Container>
  )
}
ProgressComponent.defaultProps = {
  color: '#F8F9FA',
}
export const Progress = React.memo(props => <ProgressComponent {...props} />)
