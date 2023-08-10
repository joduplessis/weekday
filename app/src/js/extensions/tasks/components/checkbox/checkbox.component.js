import './checkbox.component.css'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { IconComponent } from '../../../../components/icon.component'
import { classNames } from '../../../../helpers/util'
import * as chroma from 'chroma-js'

export const CheckboxComponent = props => {
  const channel = useSelector(state => state.channel)
  const classes = classNames({
    'checkbox-container': true,
    'done': !!props.done,
  })
  const channelColor = channel.color ? channel.color : '#065FBA'
  const doneBackgroundColor = chroma(channelColor)
    .saturate(2)
    .brighten(3.9)
    .toString()

  return (
    <div
      onClick={props.onClick}
      className={classes}
      style={{
        borderColor: props.done ? channelColor : '#CFD4D9',
        backgroundColor: props.done ? doneBackgroundColor : 'white',
      }}
    >
      <IconComponent icon="check" color={props.done ? channelColor : '#CFD4D9'} size={13} />
    </div>
  )
}
