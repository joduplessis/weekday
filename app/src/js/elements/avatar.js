import React from 'react'
import styled from 'styled-components'
import chroma from 'chroma-js'
const Container = styled.div`
  position: relative;
  cursor: pointer;
  display: inline-block;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  box-sizing: border-box;
`
const Inner = styled.div`
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  border-radius: ${props => props.borderRadius}px;
  display: inline-block;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: center;
  justify-content: center;
  z-index: 1;
  background-size: cover;
  background-position: center center;
  /*background-image: ${props => props.image};*/
  background-color: ${props => props.background};
  overflow: hidden;
  transition: opacity 0.25s;
  position: relative;
  box-sizing: border-box;
  opacity: ${props => (props.over && props.onClick ? 0.75 : 1)};

  &.overlap-right {
    margin-right: -7px;
  }

  &.outline {
    border: 1.5px solid ${props => props.outlineInnerColor};
    box-shadow: 0px 0px 0px 1.5px ${props => props.outlineOuterColor};
  }
`
const Text = styled.div`
  font-weight: 500;
  color: ${props => (props.color ? props.color : props.background)};
  position: relative;
  top: 0px;
  margin: 0px;
  padding: 0px;
  outline: none;
  box-sizing: border-box;
  text-decoration: none;
  mix-blend-mode: multiply;
  font-size: ${props => {
    if (props.size === 'xx-small') return '4'
    if (props.size === 'x-small') return '6'
    if (props.size === 'small') return '8'
    if (props.size === 'small-medium') return '10'
    if (props.size === 'medium') return '12'
    if (props.size === 'medium-large') return '14'
    if (props.size === 'large') return '16'
    if (props.size === 'x-large') return '24'
    if (props.size === 'xx-large') return '32'
    if (props.size === 'xxx-large') return '40'
    return '12'
  }}px;
`
const Presence = styled.span`
  position: absolute;
  right: -3px;
  bottom: -3px;
  width: 10px;
  height: 10px;
  box-sizing: border-box;
  border-radius: 50%;
  cursor: ${props => (props.onClick ? 'pointer' : 'default')};
  z-index: 3;
  background-color: ${props => {
    switch (props.presence) {
      case 'online':
        return '#36C5AB'
      case 'away':
        return '#FD9A00'
      case 'busy':
        return '#FC1449'
      case 'invisible:user':
        return props.dark ? '#333333' : '#EAEDEF'
      default:
        return 'transparent'
    }
  }};
  opacity: 1;
  transition: opacity 0.25s;

  &:hover {
    opacity: ${props => (props.onClick ? '0.75' : '1')};
  }
`
const Muted = styled.span`
  position: absolute;
  right: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 2;
  background-repeat: repeat;
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='5' height='5'><rect width='5' height='5' fill='transparent'/><path style='opacity: .5;' d='M0 5L5 0ZM6 4L4 6ZM-1 1L1 -1Z' stroke='${props =>
    props.color.replace('#', '%23')}' stroke-width='1.25'/></svg>");
  border-radius: ${props => props.borderRadius}px;
`
const ImageMemo = React.memo(props => {
  return (
    <div
      style={{
        zIndex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
        backgroundImage: props.image,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }}
    />
  )
})
/**
 * Avatar component. Displays a circle or square container for users,
 * channels, or anything else
 */
export const AvatarComponent = props => {
  const [over, setOver] = React.useState(false)
  const [presence, setPresence] = React.useState('')
  const [textColor, setTextColor] = React.useState(props.color || props.dark ? 'white' : 'black')
  const image = props.image ? 'url(' + props.image + ')' : ''
  const background = props.color ? props.color : props.dark ? '#07101D' : '#f1f3f5'
  const className = props.outlineInnerColor || props.outlineOuterColor ? props.className + ' outline' : props.className
  let width = 35
  let height = 35
  let borderRadius = 35
  const PRESENCES = 'PRESENCES'
  const TIMER = 5000
  /* tslint:disable:no-string-literal */
  React.useEffect(() => {
    const timer = setInterval(() => {
      if (!window) return
      if (!window[PRESENCES]) return
      if (!window[PRESENCES][props.userId]) return
      if (!window[PRESENCES][props.userId].p) return
      setPresence(window[PRESENCES][props.userId].p)
    }, TIMER)
    return () => clearInterval(timer)
  }, [])
  React.useEffect(() => {
    if (props.color) {
      setTextColor(
        chroma(props.color)
          .saturate(3)
          .brighten(2)
          .toString()
      )
    } else {
      setTextColor('#CFD4D9')
    }
  }, [props.color])
  React.useEffect(() => {
    if (props.presence) setPresence(props.presence)
  }, [props.presence])
  const generateInitials = str => {
    return str
      .split(' ')
      .map((part, _) => {
        return part[0] ? part[0].toUpperCase() : ''
      })
      .splice(0, 2)
      .toString()
      .replace(',', '')
      .trim()
  }
  switch (props.size) {
    case 'xx-small':
      width = 10
      height = 10
      borderRadius = props.circle ? 200 : 5
      break
    case 'x-small':
      width = 15
      height = 15
      borderRadius = props.circle ? 200 : 5
      break
    case 'small':
      width = 20
      height = 20
      borderRadius = props.circle ? 200 : 6
      break
    case 'small-medium':
      width = 25
      height = 25
      borderRadius = props.circle ? 200 : 7
      break
    case 'medium':
      width = 30
      height = 30
      borderRadius = props.circle ? 200 : 8
      break
    case 'medium-large':
      width = 35
      height = 35
      borderRadius = props.circle ? 200 : 9
      break
    case 'large':
      width = 40
      height = 40
      borderRadius = props.circle ? 200 : 10
      break
    case 'x-large':
      width = 80
      height = 80
      borderRadius = props.circle ? 200 : 12
      break
    case 'xx-large':
      width = 120
      height = 120
      borderRadius = props.circle ? 200 : 16
      break
    case 'xxx-large':
      width = 180
      height = 180
      borderRadius = props.circle ? 200 : 18
      break
    default:
      width = 30
      height = 30
      borderRadius = props.circle ? 200 : 5
  }
  return (
    <Container width={width} height={height} onMouseEnter={() => setOver(true)} onMouseLeave={() => setOver(false)}>
      {presence && (
        <React.Fragment>
          {presence != 'offline' && presence != 'invisible' && (
            <Presence onClick={props.onPresenceClick || null} presence={String(presence)} dark={props.dark || false} />
          )}
        </React.Fragment>
      )}

      {props.muted && <Muted color={textColor} borderRadius={borderRadius} />}

      <Inner
        over={over}
        onClick={props.onClick}
        width={width}
        height={height}
        borderRadius={borderRadius}
        className={className}
        image={image}
        background={background}
        outlineInnerColor={props.outlineInnerColor ? props.outlineInnerColor : 'transparent'}
        outlineOuterColor={props.outlineOuterColor ? props.outlineOuterColor : 'transparent'}
        style={props.style}
      >
        {image && <ImageMemo image={image} />}

        <div
          style={{
            zIndex: 2,
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
          }}
        >
          {props.children}
          {((!props.children && !props.image && props.title) ||
            (!props.children && !props.image && props.title && !over)) && (
            <Text color={textColor} size={props.size} background={background}>
              {generateInitials(props.title)}
            </Text>
          )}
        </div>
      </Inner>
    </Container>
  )
}
export const Avatar = React.memo(props => <AvatarComponent {...props} />)
