import React, { useState, useEffect, useRef } from 'react'
import { useRouter, withRouter } from 'next/router'
import Head from 'next/head'
import fetch from 'isomorphic-unfetch'
import { Button, Toggle, Modal, Input, Select, Spinner } from '@weekday/elements'
import { Link, Terminal, Paperclip, Sidebar, MessageSquare, ShoppingCart } from 'react-feather'
import ActionComponent from '../components/action.component'
import { getUploadUrl, uploadFile } from '../lib/upload.helper'

export default function ButtonModal(props) {
  const ref = useRef()
  const [loading, setLoading] = useState(false)
  const [icon, setIcon] = useState('')
  const [text, setText] = useState('')
  const [action, setAction] = useState({ type: '', name: '', payload: { width: 0, height: 0, url: '' } })

  const handleFileChange = async (e) => {
    if (e.target.files.length == 0) return

    try {
      setLoading(true)

      const file = e.target.files[0]
      const { name, type } = file
      const raw = await getUploadUrl(name, type, false)
      const { url } = await raw.json()
      const upload = await uploadFile(url, file, type)
      const iconUrl = upload.url.split('?')[0]

      setLoading(false)
      setIcon(iconUrl)
    } catch (e) {
      setError(e.toString())
    }
  }

  useEffect(() => {
    if (!props.button) return

    setIcon(props.button.icon)
    setText(props.button.text)
    setAction(props.button.action)
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

        .icon {
          width: 20px;
          height: 20px;
          background: url(${icon});
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center center;
          margin-right: 10px;
        }

        .seperator {
          width: 100%;
          height: 1px;
          border-top: 1px solid #edf0f2;
        }
      `}</style>

      <Modal
        title="Button Details"
        width="50%"
        height="95%"
        onClose={props.onClose}
        footer={(
          <div className="row">
            {props.button &&
              <Button
                text="Remove"
                theme="red"
                className="mr-10"
                onClick={() => props.onRemove(props.button)}
              />
            }

            <Button
              text={!props.button ? "Create" : "Save"}
              onClick={() => {
                if (!props.button) props.onCreate({ icon, text, action })
                if (props.button) props.onUpdate({ icon, text, action })
              }}
            />
          </div>
        )}>
        <div className="column flexer p-20">
          {loading && <Spinner />}

          <div className="row mb-20">
            <div className="icon" />

            <input
              type="file"
              className="hide"
              ref={ref}
              onChange={handleFileChange}
            />

            <div
              onClick={() => ref.current.click()}
              className="p color-blue bold ml-10 button">
              Change icon
            </div>
          </div>

          <Input
            placeholder="New button text"
            label="Button text & tooltip"
            className="mb-20"
            value={text}
            onChange={(e) => setText(e.target.value)}
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
