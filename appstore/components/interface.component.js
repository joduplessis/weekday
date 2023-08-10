import React, { useState, useEffect } from 'react'
import { useRouter, withRouter } from 'next/router'
import Head from 'next/head'
import fetch from 'isomorphic-unfetch'
import { Button, Toggle, Modal } from '@weekday/elements'
import { Square, Link, Terminal, Paperclip, Sidebar, MessageSquare } from 'react-feather'

export default function InterfaceComponent(props) {
  return (
    <React.Fragment>
      <style jsx>{`
        .action-component {
          width: 15%;
          margin-right: 1%;
          height: 80px;
          margin-bottom: 5px;
          overflow: hidden;
          background: #F2F3F5;
          border-radius: 10px;
          border: 2px solid white;
          cursor: pointer;
          transition: border 0.25s;
        }

        .action-component:hover {
            border: 2px solid #007AF5;
          }
        }
      `}</style>
      <div className="action-component row align-items-stretch" onClick={props.onClick}>
        <div className="column pl-15 pr-15 justify-content-center flexer">
          <div className="row">
            {(() => {
              switch (props.type) {
                case "COMMAND":
                  return <Terminal color="#007af5" size={10} thickness={3} className="mr-5" />
                case "ATTACHMENT":
                    return <Paperclip color="#007af5" size={10} thickness={3} className="mr-5" />
                case "TOOL":
                  return <Sidebar color="#007af5" size={10} thickness={3} className="mr-5" style={{ transform: 'rotateZ(180deg)' }} />
                case "SHORTCUT":
                  return <Sidebar color="#007af5" size={10} thickness={3} className="mr-5" style={{ transform: 'rotateZ(90deg)' }} />
                case "MODAL":
                  return <Square color="#007af5" size={10} thickness={3} className="mr-5" />
                case "PANEL":
                  return <Sidebar color="#007af5" size={10} thickness={3} className="mr-5" style={{ transform: 'rotateZ(180deg)' }} />
                case "WEBHOOK":
                  return <Link color="#007af5" size={10} thickness={3} className="mr-5" />
              }
            })()}

            <span className="small color-blue bold">{props.type}</span>
          </div>
          <div className="h5 color-d4 mt-5 bold">{props.title}</div>
          <div className="p color-d0 mt-5 bold">{props.subtitle}</div>
        </div>
      </div>
    </React.Fragment>
  )
}
