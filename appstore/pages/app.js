import React, { useState, useEffect, useRef } from 'react'
import Router, { useRouter, withRouter } from 'next/router'
import Head from 'next/head'
import fetch from 'isomorphic-unfetch'
import { Tabbed, Button, Input, Select, Textarea, Toggle, Modal, Popup, Menu, Error, Spinner, Notification } from '@weekday/elements'
import AppComponent from '../components/app.component'
import InterfaceComponent from '../components/interface.component'
import ActionComponent from '../components/action.component'
import { ArrowLeft, Plus, ShoppingCart, Terminal, Paperclip, Sidebar, MessageSquare } from 'react-feather'
import ButtonModal from '../modals/button.modal'
import CommandModal from '../modals/command.modal'
import { getApp, createApp, updateApp, deleteApp } from '../lib/appstore.helper'
import { getUploadUrl, uploadFile } from '../lib/upload.helper'
import uuid from 'uuid/v4'

function App(props) {
  const { router: { query }} = props
  const ref = useRef()
  const [appId, setAppId] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [menu, setMenu] = useState(false)
  const [messageButtonIndex, setMessageButtonIndex] = useState(null)
  const [attachmentButtonIndex, setAttachmentButtonIndex] = useState(null)
  const [toolButtonIndex, setToolButtonIndex] = useState(null)
  const [shortcutButtonIndex, setShortcutButtonIndex] = useState(null)
  const [commandIndex, setCommandIndex] = useState(null)
  const categoryOptions = [
    {option: 'Please choose a category', value: ''},
    {option: 'Feedback', value: 'feedback'},
    {option: 'Documents', value: 'documents'},
    {option: 'Video & Audio', value: 'video-audio'},
    {option: 'Productivity', value: 'productivity'},
    {option: 'Other', value: 'other'}
  ]
  const [id, setId] = useState(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [token, setToken] = useState('')
  const [featured, setFeatured] = useState(false)
  const [support, setSupport] = useState('')
  const [categories, setCategories] = useState([])
  const [published, setPublished] = useState(false)
  const [visibility, setVisibility] = useState('none')
  const [verified, setVerified] = useState(false)
  const [team, setTeam] = useState(null)
  const [user, setUser] = useState(null)
  const [outgoing, setOutgoing] = useState('')
  const [commands, setCommands] = useState([])
  const [attachments, setAttachments] = useState([])
  const [tools, setTools] = useState([])
  const [shortcuts, setShortcuts] = useState([])
  const [message, setMessage] = useState({
    url: '',
    width: '',
    height: '',
    buttons: [],
  })
  const router = useRouter()
  const { userId, teamId, channelId, jwt } = router.query

  const handlePublishToggle = async () => {
    try {
      setLoading(true)

      await updateApp(appId, { published: !published })

      setPublished(!published)
      setLoading(false)
      setNotification('Successfully saved')
    } catch(e) {
      setError(e.toString())
      setLoading(false)
      setNotification(null)
    }
  }

  const handleAppDelete = async () => {
    if (confirm('Are you sure (this cannot be undone)?')) {
      try {
        setLoading(true)
        await deleteApp(appId)
        setLoading(false)
        Router.push(`/?userId=${userId}&teamId=${teamId}&channelId=${channelId}&jwt=${jwt}`)
      } catch(e) {
        setError(e.toString())
        setLoading(false)
        setNotification(null)
      }
    }
  }

  const stripSpecialChars = text => {
    return text ? text.replace(/[`~!@#$%^&*()|+\= ?;:'",.<>\{\}\[\]\\\/]/gi, '') : ''
  }

  const handleSaveOrCreate = async () => {
    try {
      setLoading(true)
      setError(null)
      setNotification(null)

      // Creating
      if (!appId) {
        const result1 = await createApp({
          name,
          slug,
          description,
          image,
          token,
          featured,
          support,
          categories,
          published,
          visibility,
          verified,
          team: teamId,
          user: userId,
          outgoing,
          commands,
          attachments,
          tools,
          shortcuts,
          message,
        })
        const res = await result1.json()        

        if (result1.status == 200) {
          const updatedAppId = res.app._id

          setLoading(false)
          setError(null)
          setNotification('Successfully saved')
          setAppId(updatedAppId)

          // Take the user straight there
          Router.push(`/app?userId=${userId}&teamId=${teamId}&channelId=${channelId}&jwt=${jwt}&appId=${updatedAppId}`)
        } else {
          setError('Please use another unique slug')
          setLoading(false)
          setNotification(null)
        }
      }

      // Updating
      if (appId) {
        const result2 = await updateApp(appId, {
          name,
          slug,
          description,
          image,
          token,
          featured,
          support,
          categories,
          published,
          visibility,
          verified,
          team: teamId,
          user: userId,
          outgoing,
          commands,
          attachments,
          tools,
          shortcuts,
          message,
        })

        if (result2.status == 200) {
          setLoading(false)
          setError(null)
          setNotification('Successfully saved')
        } else {
          setLoading(false)
          setNotification(null)
          setError('Error')
        }
      }
    } catch(e) {
      setError(e.toString())
      setLoading(false)
      setNotification(null)
    }
  }

  const handleFileChange = async (e) => {
    if (e.target.files.length == 0) return

    try {
      setLoading(true)

      const file = e.target.files[0]
      const { name, type } = file
      const raw = await getUploadUrl(name, type, false)
      const { url } = await raw.json()
      const upload = await uploadFile(url, file, type)
      const imageUrl = upload.url.split('?')[0]

      setLoading(false)
      setImage(imageUrl)
    } catch (e) {
      setLoading(false)
      setError(e.toString())
    }
  }

  const renderMessageButtonModal = () => {
    if (messageButtonIndex == null) return null

    return (
      <ButtonModal
        button={messageButtonIndex == -1 ? null : message.buttons[messageButtonIndex]}
        onClose={() => setMessageButtonIndex(null)}
        onCreate={(button) => {
          setMessage({ ...message, buttons: [...message.buttons, button] })

          // And then close the modal
          setMessageButtonIndex(null)
        }}
        onRemove={(button) => {
          // Remove our message button
          setMessage({
            ...message,
            buttons: message.buttons.filter((button, index) => messageButtonIndex != index)
          })

          // And close the modal
          setMessageButtonIndex(null)
        }}
        onUpdate={(updatedButton) => {
          // Update our message (button)
          setMessage({
            ...message,
            buttons: message.buttons.map((button, index) => {
              if (messageButtonIndex == index) return updatedButton
              if (messageButtonIndex != index) return button
            })
          })

          // And then close the modal
          setMessageButtonIndex(null)
        }}
      />
    )
  }

  const renderToolButtonModal = () => {
    if (toolButtonIndex == null) return null

    return (
      <ButtonModal
        button={toolButtonIndex == -1 ? null : tools[toolButtonIndex]}
        onClose={() => setToolButtonIndex(null)}
        onRemove={() => {
          setTools(tools.filter((button, index) => toolButtonIndex != index))

          // And then close the modal
          setToolButtonIndex(null)
        }}
        onCreate={(button) => {
          setTools([...tools, button])

          // And then close the modal
          setToolButtonIndex(null)
        }}
        onUpdate={(updatedButton) => {
          // Update our button
          setTools(
            tools.map((button, index) => {
              if (toolButtonIndex == index) return updatedButton
              if (toolButtonIndex != index) return button
            })
          )

          // And then close the modal
          setToolButtonIndex(null)
        }}
      />
    )
  }

  const renderShortcutButtonModal = () => {
    if (shortcutButtonIndex == null) return null

    return (
      <ButtonModal
        button={shortcutButtonIndex == -1 ? null : shortcuts[shortcutButtonIndex]}
        onClose={() => setShortcutButtonIndex(null)}
        onRemove={() => {
          setShortcuts(shortcuts.filter((button, index) => shortcutButtonIndex != index))

          // And then close the modal
          setShortcutButtonIndex(null)
        }}
        onCreate={(button) => {
          setShortcuts([...shortcuts, button])

          // And then close the modal
          setShortcutButtonIndex(null)
        }}
        onUpdate={(updatedButton) => {
          // Update our button
          setShortcuts(
            shortcuts.map((button, index) => {
              if (shortcutButtonIndex == index) return updatedButton
              if (shortcutButtonIndex != index) return button
            })
          )

          // And then close the modal
          setShortcutButtonIndex(null)
        }}
      />
    )
  }

  const renderCommandModal = () => {
    if (commandIndex == null) return null

    return (
      <CommandModal
        command={commandIndex == -1 ? null : commands[commandIndex]}
        onClose={() => setCommandIndex(null)}
        onRemove={() => {
          setCommands(commands.filter((command, index) => commandIndex != index))

          // And then close the modal
          setCommandIndex(null)
        }}
        onCreate={(command) => {
          setCommands([...commands, command])

          // And then close the modal
          setCommandIndex(null)
        }}
        onUpdate={(updatedCommand) => {
          // Update our button
          setCommands(
            commands.map((command, index) => {
              if (commandIndex == index) return updatedCommand
              if (commandIndex != index) return command
            })
          )

          // And then close the modal
          setCommandIndex(null)
        }}
      />
    )
  }

  const renderAttachmentButtonModal = () => {
    if (attachmentButtonIndex == null) return null

    return (
      <ButtonModal
        button={attachmentButtonIndex == -1 ? null : attachments[attachmentButtonIndex]}
        onRemove={() => {
          setAttachments(attachments.filter((button, index) => attachmentButtonIndex != index))

          // And then close the modal
          setAttachmentButtonIndex(null)
        }}
        onClose={() => {
          setAttachmentButtonIndex(null)

          // And then close the modal
          setAttachmentButtonIndex(null)
        }}
        onCreate={(button) => setAttachments([...attachments, button])}
        onUpdate={(updatedButton) => {
          // Update our button
          setAttachments(
            attachments.map((button, index) => {
              if (attachmentButtonIndex == index) return updatedButton
              if (attachmentButtonIndex != index) return button
            })
          )

          // And then close the modal
          setAttachmentButtonIndex(null)
        }}
      />
    )
  }

  useEffect(() => {
    if (!props.router.query.appId) {
      setToken(uuid())

      return
    }

    (async () => {
      try {
        setLoading(true)
        setAppId(props.router.query.appId)

        const raw = await getApp(props.router.query.appId)
        const result = await raw.json()
        const { app } = result

        setId(props.router.query.appId)
        setName(app.name)
        setSlug(app.slug)
        setDescription(app.description)
        setImage(app.image)
        setToken(app.token)
        setFeatured(app.featured)
        setSupport(app.support)
        setCategories(app.categories)
        setPublished(app.published)
        setVisibility(app.visibility)
        setVerified(app.verified)
        setTeam(app.team)
        setUser(app.user)
        setOutgoing(app.outgoing)
        setCommands(app.commands)
        setAttachments(app.attachments)
        setTools(app.tools)
        setShortcuts(app.shortcuts)
        setMessage(app.message)
        setLoading(false)
      } catch (e) {
        setLoading(false)
        setError(e.toString())
      }
    })()
  }, [props.router.query])

  return (
    <React.Fragment>
      {renderMessageButtonModal()}
      {renderToolButtonModal()}
      {renderShortcutButtonModal()}
      {renderAttachmentButtonModal()}
      {renderCommandModal()}

      <Head>
        <title>Appstore</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link href="/static/css/styles.css" rel="stylesheet" />
        <link href="/static/images/favicon.png" rel="shortcut icon" />
        <link rel="stylesheet" href="https://use.typekit.net/ycb3zss.css" />
      </Head>

      <style global jsx>{`
        * {
          margin: 0px;
          padding: 0px;
          font-family: proxima-nova, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji;
        }

        body {
          background: white;
        }

        .container {
          background: white;
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0px;
          top: 0px;
          display: flex;
          align-items: stretch;
          align-content: center;
          justify-content: center;
          overflow: scroll;
        }

        code {
          font-family: monospace;
          background-color: #edf0f2;
          padding: 0px 3px 0px 3px;
          border-radius: 4px;
          font-weight: 300 !important;
        }

        .input-disclaimer {
          color: #202629;
          font-weight: 600;
          font-size: 10px;
          position: relative;
          top: -15px;
        }

        .input-disclaimer i {
          font-size: 10px;
        }

        .input-disclaimer code {
          font-family: monospace;
          font-size: 10px;
        }

        .error {
          position: absolute;
          top: 0px;
          left: 0px;
          width: 100%;
        }

        .image {
          width: 400px;
          height: 300px;
          background-color: #edf0f2;
          border-radius: 15px;
          margin-right: 30px;
          background: #edf0f2 url(${image});
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center center;
        }
      `}</style>

      {loading && <Spinner />}

      <div className="container">
        <div className="flexer pt-30 pl-30 pr-40">
          <div className="pb-30">
            {error && <Error message={error} />}
            {notification && <Notification text={notification} />}
          </div>

          <div className="row align-items-start">
            <ArrowLeft
              size={30}
              color="#202529"
              className="mt-5 mr-20 button"
              onClick={() => window.history.back()}
            />
            <div className="column flexer">
              <div className="row w-100 mb-30">
                <div className="column flexer">
                  <div className="h3 color-d4 mb-5">{props.router.query.appId ? `Update ${name} app` : "Create a new app"}</div>
                  <div className="h4 color-d0 hide">The following apps are available for this channel</div>
                </div>

                <div className="row">
                  {appId &&
                    <React.Fragment>
                      <div className="p color-d1 pr-20">{published ? "This app is live" : "This app is not published"}</div>
                      <Button
                        text={published ? "Unpublish" : "Publish"}
                        theme={published ? "red" : "blue"}
                        onClick={handlePublishToggle}
                      />
                    </React.Fragment>
                  }
                </div>
              </div>

              <div className="row flexer align-items-start w-100 mt-20 mb-30">
                <div className="column">
                  <div className="image" />

                  <input
                    type="file"
                    className="hide"
                    ref={ref}
                    onChange={handleFileChange}
                  />

                  <Button
                    text="Change app image"
                    className="mt-20"
                    theme="blue-border"
                    size="small"
                    onClick={() => ref.current.click()}
                  />
                </div>
                <div className="column flexer">
                  <Input
                    placeholder="Foo"
                    label="Name"
                    className="mb-20"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <Input
                    placeholder="foo"
                    label="Unique slug"
                    className="mb-20"
                    value={slug}
                    onChange={(e) => setSlug(stripSpecialChars(e.target.value))}
                  />

                  <Textarea
                    rows={3}
                    placeholder="My new app description"
                    label="Description"
                    className="mb-20"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />

                  <Input
                    placeholder="http://support.link"
                    label="Support URL"
                    className="mb-20"
                    value={support}
                    onChange={(e) => setSupport(e.target.value)}
                  />

                  <Input
                    disabled
                    placeholder="Token"
                    label="App Token"
                    className="mb-20"
                    value={token}
                    onChange={(e) => console.log('Sorry')}
                  />

                  <Button
                    text="Reset token"
                    className="mt-0"
                    theme="blue-border"
                    size="small"
                    onClick={() => setToken(uuid())}
                  />
                </div>
              </div>

              <div className="h3 color-d4 mb-5 mt-20">Categories</div>
              <div className="h4 color-d0 mb-20">Choose a category your app falls into</div>

              <div className="column flexer w-100 mb-30">
                <Select
                  selected={categoryOptions.map(option => option.value).indexOf(categories[0] || "")}
                  options={categoryOptions}
                  onSelect={(index) => setCategories([categoryOptions[index].value])}
                />
              </div>

              <div className="row w-100">
                <div className="column flexer">
                  <div className="h3 color-d4 mb-5 mt-20">Visibility</div>
                  <div className="h4 color-d0 mb-20">Make your app available to everyone or only your team</div>
                </div>
              </div>

              <div className="column mb-20 w-100">
                <div className="row w-100 mb-10">
                  <div className="h5 color-blue flexer">This app is available for anyone to install</div>
                  <Toggle
                    on={visibility == "community"}
                    onChange={() => {
                      if (visibility == "community") setVisibility("none")
                      if (visibility != "community") setVisibility("community")
                    }}
                  />
                </div>
                <div className="row w-100 mb-10">
                  <div className="h5 color-blue flexer">Make this app available only to this team</div>
                  <Toggle
                    on={visibility == "team"}
                    onChange={() => {
                      if (visibility == "team") setVisibility("none")
                      if (visibility != "team") setVisibility("team")
                    }}
                  />
                </div>
              </div>

              <div className="h3 color-d4 mb-5 mt-20">Incoming Webhooks</div>
              <div className="h4 color-d0 mb-20">
                You are able to send messages to the channel from the app using our <a href="https://github.com/WeekdayApp/dev-kit/blob/master/docs/index.md#createChannelMessage" target="_blank" className="h4">DevKit</a>. 
                More information <a href="https://api.weekday.work/v1/api-docs/" target="_blank" className="h4">here</a>. This channel token will be passed to a modal or panel via a <strong><code className="h4">token</code></strong> query string parameter.
              </div>

              <div className="h3 color-d4 mb-5 mt-20">Outgoing Webhooks</div>
              <div className="h4 color-d0 mb-20">
                Every outgoing webhook that you host will be called with the <i className="h4">channel installation token</i> as the <strong><code className="h4">token</code></strong> query string parameter. 
              </div>

              <div className="row w-100 mb-20">
                <div className="h5 color-blue flexer">This app uses an outgoing webhook that I host</div>
                <Toggle
                  on={outgoing != ""}
                  onChange={() => setOutgoing(outgoing ? "" : "http://")}
                />
              </div>

              <div className="column flexer w-100 mb-30">
                {outgoing != "" &&
                  <Input
                    placeholder="https://your.webhook.url"
                    label="Outgoing webhook"
                    className="mb-20"
                    value={outgoing}
                    onChange={(e) => setOutgoing(e.target.value)}
                  />
                }
              </div>

              <div className="row w-100">
                <div className="column flexer">
                  <div className="h3 color-d4 mb-5 mt-10">Message view</div>
                  <div className="h4 color-d0 mb-20">Extend the UI of Weekday by adding icons & commands users can interact with</div>
                </div>
              </div>

              <div className="column flexer w-100 mb-30">
                <Input
                  placeholder="Pixels or percent"
                  label="Height"
                  className="mb-20"
                  value={message.height}
                  onChange={(e) => setMessage({ ...message, height: e.target.value })}
                />
                <div className="input-disclaimer">Leave this blank or as <i>0</i> to auto adjust the message view height using the <code>syncMessageHeight()</code> DevKit method.</div>

                <Input
                  placeholder="Pixels or percent"
                  label="Width"
                  className="mb-20"
                  value={message.width}
                  onChange={(e) => setMessage({ ...message, width: e.target.value })}
                />

                <Input
                  placeholder="https://message.view.url"
                  label="URL"
                  className="mb-00"
                  value={message.url}
                  onChange={(e) => setMessage({ ...message, url: e.target.value })}
                />
              </div>

              <div className="row w-100 mb-20">
                {message.buttons.length == 0 &&
                  <div className="h4 color-d0 flexer">No message action buttons</div>
                }

                <Button
                  text="Add button"
                  size="small"
                  theme="blue-border"
                  onClick={() => setMessageButtonIndex(-1)}
                />
              </div>

              <div className="row wrap w-100 mb-30">
                {message.buttons.map((button, index) => {
                  return (
                    <InterfaceComponent
                      key={index}
                      type={button.action.type.toUpperCase()}
                      title={button.text}
                      subtitle={button.action.name}
                      onClick={() => setMessageButtonIndex(index)}
                    />
                  )
                })}
              </div>

              <div className="row w-100">
                <div className="column flexer">
                  <div className="h3 color-d4 mb-5 mt-20">User interface extensions</div>
                  {shortcuts.length == 0 &&
                    tools.length == 0 &&
                    commands.length == 0 &&
                    attachments.length == 0 &&
                    <div className="h4 color-d0 mb-20">There are no added buttons</div>
                  }
                </div>

                <Popup
                  handleDismiss={() => setMenu(false)}
                  visible={menu}
                  width={200}
                  direction="right-bottom"
                  content={
                    <Menu
                      items={[
                        {
                          icon: <Terminal color="#acb5bd" size={15} thickness={2} className="mr-5" />,
                          text: "Slash command",
                          onClick: () => {
                            setMenu(false)
                            setCommandIndex(-1)
                          }
                        },
                        {
                          icon: <Paperclip color="#acb5bd" size={15} thickness={2} className="mr-5" />,
                          text: "Attachment button",
                          onClick: () => {
                            setMenu(false)
                            setAttachmentButtonIndex(-1)
                          }
                        },
                        {
                          icon: <Sidebar color="#acb5bd" size={15} thickness={2} className="mr-5" style={{ transform: 'rotateZ(180deg)' }}  />,
                          text: "Toolbar button",
                          onClick: () => {
                            setMenu(false)
                            setToolButtonIndex(-1)
                          }
                        },
                        {
                          icon: <Sidebar color="#acb5bd" size={15} thickness={2} className="mr-5" style={{ transform: 'rotateZ(90deg)' }} />,
                          text: "Shortcut button",
                          onClick: () => {
                            setMenu(false)
                            setShortcutButtonIndex(-1)
                          }
                        },
                      ]}
                    />
                  }>
                  <Button
                    onClick={() => setMenu(true)}
                    text="Add extension"
                    size="small"
                    theme="blue-border"
                  />
                </Popup>
              </div>

              <div className="row wrap w-100 mb-30">
                {shortcuts.map((button, index) => {
                  return (
                    <InterfaceComponent
                      key={index}
                      type="SHORTCUT"
                      title={button.text}
                      subtitle={button.action.name}
                      onClick={() => setShortcutButtonIndex(index)}
                    />
                  )
                })}
                {tools.map((button, index) => {
                  return (
                    <InterfaceComponent
                      key={index}
                      type="TOOL"
                      title={button.text}
                      subtitle={button.action.name}
                      onClick={() => setToolButtonIndex(index)}
                    />
                  )
                })}
                {attachments.map((button, index) => {
                  return (
                    <InterfaceComponent
                      key={index}
                      type="ATTACHMENT"
                      title={button.text}
                      subtitle={button.action.name}
                      onClick={() => setAttachmentButtonIndex(index)}
                    />
                  )
                })}
                {commands.map((command, index) => {
                  return (
                    <InterfaceComponent
                      key={index}
                      type="COMMAND"
                      title={command.name}
                      subtitle={command.action.name}
                      onClick={() => setCommandIndex(index)}
                    />
                  )
                })}
              </div>

              <div className="row wrap w-100 mb-30 mt-30">
                {appId && (
                  <Button
                    theme="red"
                    text="Delete app"
                    className=""
                    onClick={handleAppDelete}
                  />
                )}               

                <Button
                  className="ml-5"
                  theme="muted"
                  text={props.router.query.appId ? "Save" : "Create"}
                  onClick={handleSaveOrCreate}
                />

                {error && <div className="color-red p pl-30">{error}</div>}
                {notification && <div className="color-blue p pl-30">{notification}</div>}
              </div>
            </div>
          </div>

          <div style={{ height: 100 }} />
        </div>
      </div>
    </React.Fragment>
  )
}

export default withRouter(App)
