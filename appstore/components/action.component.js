import React from 'react'
import { Input, Select } from '@weekday/elements'

export default function ActionComponent(props) {
  const options = [
    {option: 'Please choose an action type', value: ''},
    {option: 'Webhook', value: 'webhook'},
    {option: 'Modal', value: 'modal'},
    {option: 'Panel', value: 'panel'}
  ]

  return (
    <React.Fragment>
      <style jsx>{`
        .image {
          width: 400px;
          height: 300px;
          background: #edf0f2;
          border-radius: 15px;
          margin-right: 30px;
        }

        .seperator {
          width: 100%;
          height: 1px;
          border-top: 1px solid #edf0f2;
        }
      `}</style>

      <div className="h4 color-d4 mb-10">Action</div>
      <div className="h5 color-d0 mb-20">Actions are created when a user presses the icon</div>

      <Input
        placeholder="Do something"
        label="Action name"
        className="mb-20"
        value={props.name}
        onChange={(e) => {
          props.updateAction({
            type: props.type,
            name: e.target.value,
            payload: props.payload,
          })
        }}
      />

      <Select
        label="Action type"
        selected={options.map(option => option.value).indexOf(props.type || "")}
        options={options}
        onSelect={(index) => {
          props.updateAction({
            type: options[index].value,
            name: props.name,
            payload: props.payload,
          })
        }}
      />

      {(props.type != "") &&
        <React.Fragment>
          <div className="h5 color-d0 mt-30">Add more information about your {props.type}</div>
          <div className="small color-red mb-20 mt-10 bold">Every webhook & iframe source URL will contain a token & user identifier you can use to identify this channel & the current user - you do not need to add these.</div>

          {props.type.toLowerCase() == "modal" &&
            <React.Fragment>
              <Input
                placeholder="Pixels or percentage"
                label="Modal or panel width"
                className="mb-20"
                value={props.payload.width}
                onChange={(e) => {
                  props.updateAction({
                    type: props.type,
                    name: props.name,
                    payload: {
                      ...props.payload,
                      width: e.target.value,
                    }
                  })
                }}
              />

              <Input
                placeholder="Pixels or percentage"
                label="Modal or panel height"
                className="mb-20"
                value={props.payload.height}
                onChange={(e) => {
                  props.updateAction({
                    type: props.type,
                    name: props.name,
                    payload: {
                      ...props.payload,
                      height: e.target.value,
                    }
                  })
                }}
              />
            </React.Fragment>
          }

          <Input
            placeholder="https://your.webhook?query+strings=allowed"
            label="Webhook URL"
            className="mb-20"
            value={props.payload.url}
            onChange={(e) => {
              props.updateAction({
                type: props.type,
                name: props.name,
                payload: {
                  ...props.payload,
                  url: e.target.value,
                }
              })
            }}
          />
        </React.Fragment>
      }
    </React.Fragment>
  )
}
