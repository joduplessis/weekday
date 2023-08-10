import React from 'react'
import styled from 'styled-components'
const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: center;
  justify-content: center;
  width: max-content;
`
const Children = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: center;
  justify-content: center;
`
const Content = styled.div`
  position: absolute;
  visibility: hidden;
  opacity: 0;
  transition: visibility 0s, opacity 0.25s linear;
  z-index: 1000;
  padding: 10px;
  background: white;
  border-radius: 5px;
  width: max-content;
  max-width: 200px;
  background: #212832;
  padding: 10px 0px 10px 0px;
  box-shadow: 0px 0px 50px -25px rgba(0, 0, 0, 1);
  display: none;
  visibility: visible;
  opacity: 0;
  transition: visibility 0s, opacity 0.1s linear;

  &.over {
    display: flex;
    visibility: visible;
    opacity: 1;
    transition: visibility 0s, opacity 0.1s linear;
  }

  &.top {
    bottom: 10px;
    right: 50%;
    transform: translate(50%, -100%);
  }
  &.right {
    top: 50%;
    right: -10px;
    transform: translate(100%, -50%);
  }
  &.left {
    top: 50%;
    left: -10px;
    transform: translate(-100%, -50%);
  }
  &.bottom {
    bottom: -10px;
    right: 50%;
    transform: translate(50%, 100%);
  }

  &.bottom:after {
    top: 0%;
    right: 50%;
    border: solid transparent;
    content: ' ';
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-color: transparent;
    border-top-color: #212832;
    border-width: 5px;
    margin-top: -10px;
    transform: translateX(50%) rotate(180deg);
  }

  &.top:after {
    top: 100%;
    right: 50%;
    border: solid transparent;
    content: ' ';
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-color: transparent;
    border-top-color: #212832;
    border-width: 5px;
    margin-top: 0px;
    transform: translateX(50%) rotate(0deg);
  }

  &.left:after {
    top: 50%;
    right: 0%;
    border: solid transparent;
    content: ' ';
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-color: transparent;
    border-top-color: #212832;
    border-width: 5px;
    margin-right: -10px;
    transform: translateY(-50%) rotate(-90deg);
  }

  &.right:after {
    top: 50%;
    left: 0%;
    border: solid transparent;
    content: ' ';
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-color: transparent;
    border-top-color: #212832;
    border-width: 5px;
    margin-left: -10px;
    transform: translateY(-50%) rotate(90deg);
  }
`
const Text = styled.div`
  color: white;
  font-size: 12px;
  text-align: center;
  width: 100%;
  padding-left: 10px;
  padding-right: 10px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`
/**
 * Button component.
 */
export const Tooltip = props => {
  const [over, setOver] = React.useState(false)
  const { direction, containerClassName, children, text } = props
  return (
    <Container className={containerClassName}>
      <Children onClick={() => setOver(false)} onMouseEnter={() => setOver(true)} onMouseLeave={() => setOver(false)}>
        {children}
      </Children>

      <Content className={over ? 'over ' + direction : direction}>
        <Text>{text}</Text>
      </Content>
    </Container>
  )
}
