import React, { useState, useEffect } from 'react'
import { useRouter, withRouter } from 'next/router'
import Head from 'next/head'
import fetch from 'isomorphic-unfetch'
import { Button, Toggle, Modal, Input, Select, Spinner } from '@weekday/elements'
import { Link, Terminal, Paperclip, Sidebar, MessageSquare, ShoppingCart } from 'react-feather'
import ActionComponent from '../components/action.component'

export default function CommandModal(props) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [description, setDescription] = useState('')
  const [action, setAction] = useState({ type: '', name: '', payload: { width: 0, height: 0, url: '' } })

  useEffect(() => {
    if (!props.command) return

    setName(props.command.name)
    setDescription(props.command.description)
    setAction(props.command.action)
  }, [])

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

      <Modal
        title="New Command"
        width="50%"
        height="90%"
        onClose={props.onClose}
        footer={(
          <div className="row">
            {props.command &&
              <Button
                text="Remove"
                theme="red"
                className="mr-10"
                onClick={() => props.onRemove(props.command)}
              />
            }

            <Button
              text={!props.command ? "Create" : "Save"}
              onClick={() => {
                if (!props.command) props.onCreate({ name, description, action })
                if (props.command) props.onUpdate({ name, description, action })
              }}
            />
          </div>
        )}>
        <div className="column flexer p-20">
          <Input
            placeholder="create-something"
            label="Command"
            className="mb-20"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            placeholder="really : really : cool"
            label="Command arguments"
            className="mb-20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="seperator mb-20 mt-10" />

          <ActionComponent
            type={action.type}
            name={action.name}
            payload={action.payload}
            updateAction={(updatedAction) => setAction(updatedAction)}
          />
        </div>
      </Modal>
    </React.Fragment>
  )
}
