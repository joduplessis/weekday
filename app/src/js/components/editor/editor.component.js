import React, { Component, useMemo, useCallback, useRef, useEffect, useState } from 'react'
import UploadService from '../../services/upload.service'
import GraphqlService from '../../services/graphql.service'
import { IconComponent } from '../../components/icon.component'
import { Button, Popup, Attachment, Spinner, Menu } from '../../elements'
import ContextPortal from '../../portals/context.portal'
import { Picker } from 'emoji-mart'
import { classNames, replaceLast, notifyChannelOfTyping } from '../../helpers/util'
import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import Keg from '@joduplessis/keg'
import ReactQuill from 'react-quill'
import QuillMention from 'quill-mention'
import Quill from 'quill'
import MarkdownShortcuts from 'quill-markdown-shortcuts'
import EventService from '../../services/event.service'
import { FOCUS_COMPOSE_INPUT, SET_EDITOR_CONTENT } from '../../constants'
import TurndownService from 'turndown'

import './editor.component.css'
import './editor.quill.css'

Quill.register('modules/markdownShortcuts', MarkdownShortcuts)

const atValues = [{ id: 1, value: 'Fredrik Sundqvist' }, { id: 2, value: 'Patrik Sjölin' }]
const hashValues = [{ id: 3, value: 'Fredrik Sundqvist 2' }, { id: 4, value: 'Patrik Sjölin 2' }]

const turndownService = new TurndownService()

turndownService.addRule('strikethrough', {
  filter: ['del', 's', 'strike'],
  replacement: function(content) {
    return '~~' + content + '~~'
  },
})

export class EditorComponent extends Component {
  constructor(props) {
    super(props)

    this.mentionModule = {
      allowedChars: /^[A-Za-z\s]*$/,
      mentionDenotationChars: ['@', '#'],
      source: async (searchTerm, renderList) => {
        const { channelId } = this.props
        const { data } = await GraphqlService.getInstance().searchChannelMembers(channelId, searchTerm, 0)
        const users = data.searchChannelMembers.map(m => {
          return { id: m.user.id, value: m.user.username }
        })

        if (users.length == 0) {
          this.mentions = false
        } else {
          this.mentions = true
        }

        renderList(users)
      },
      /*     
      source: function(searchTerm, renderList, mentionChar) {
        let values

        if (mentionChar === '@') {
          values = atValues
        } else {
          values = hashValues
        }

        if (searchTerm.length === 0) {
          renderList(values, searchTerm)
        } else {
          const matches = []
          for (i = 0; i < values.length; i++)
            if (~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase()))
              matches.push(values[i])
          renderList(matches, searchTerm)
        }
      }, 
      */
    }

    /*
    Placeholder attachment for testing:
    {
      uri: "https://weekday-user-assets.s3-us-west-2.amazonaws.com/20-12-2020/4d7e8b30-42fd-11eb-abe5-7dc762bdb7d3.zapier.png?AWSAccessKeyId=AKIASVCBLB7GH6JHCIWJ&Expires=1608498254&Signature=6gJfBrP7qwIhGsgtCQefZpdAN1o%3D",
      mime: "image/jpeg",
      size: 17361,
      name: "tester.jpg",
    }
    */

    this.state = {
      loading: false,
      text: '',
      attachments: [],
      members: [],
      emoticonMenu: false,
      appsMenu: false,
    }

    this.keyboard = {
      bindings: {
        tab: false,
        handleEnter: {
          key: 13,
          handler: function() {
            // Do nothing
          },
        },
      },
    }

    this.fileRef = null
    this.quillRef = null
    this.reactQuillRef = null

    this.handleFileChange = this.handleFileChange.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.attachQuillRefs = this.attachQuillRefs.bind(this)
    this.fetchResults = this.fetchResults.bind(this)
    this.handleAddEmoji = this.handleAddEmoji.bind(this)
    this.initAttachmentQueue = this.initAttachmentQueue.bind(this)
    this.shouldBeHidden = this.shouldBeHidden.bind(this)
    this.onSearch$ = new Subject()
    this.subscription = this.onSearch$.pipe(debounceTime(2000)).subscribe(username => fetchResults(username))
    this.shift = false
    this.enter = false
    this.mentions = false
  }

  async fetchResults(username) {
    if (username == '') return

    try {
      const { channelId } = this.props
      const { data } = await GraphqlService.getInstance().searchChannelMembers(channelId, username, 0)
      const members = data.searchChannelMembers.map(m => m.user.username)

      this.setState({ members })
    } catch (e) {
      console.log(e)
    }
  }

  handleAddEmoji(emoji) {
    this.setState({ emoticonMenu: false })
    this.quillRef.focus()
    setTimeout(() => {
      var range = this.quillRef.getSelection()
      let position = range ? range.index : 0
      this.quillRef.insertText(position, emoji.native)
    }, 100)
  }

  async handleFileChange(e) {
    const files = e.target.files || []

    if (files.length == 0) return

    for (let file of files) {
      Keg.keg(this.props.editorId).refill('uploads', file)
    }
  }

  handleBlur() {
    this.props.onBlur({
      markdown: turndownService.turndown(this.state.text),
      html: this.state.text,
      attachments: this.state.attachments,
    })
  }

  // Fires 1st
  handleKeyDown = e => {
    const { keyCode } = e
    const { userName, channelId } = this.props

    if (keyCode == 16) this.shift = true
    if (keyCode == 13) this.enter = true
    if (keyCode == 13 && !this.shift && !this.mentions && this.props.messageMode) {
      const html = this.state.text.replace('<p><br></p>', '')
      const { attachments } = this.state
      const markdown = turndownService.turndown(html)

      // Submit the text - but remove the last <p><br></p>
      // that gets inserted
      this.props.onSubmit({ attachments, html, markdown })
      this.setState({ text: '', attachments: [] })
    }
    if (keyCode == 13) this.mentions = false

    // Update typing only with alpha numeric - not the following (can change)
    if (
      (keyCode > 47 && keyCode < 58) || // number keys
      (keyCode == 32 || keyCode == 13) || // spacebar & return key(s)
      (keyCode > 64 && keyCode < 91) // letter keys
    ) {
      notifyChannelOfTyping(channelId, userName)
    }
  }

  // Fires 2nd
  handleChange = value => {
    this.setState({ text: value })

    // If there is a populateCommands prop
    // We first conver to markdown as well
    if (!!this.props.populateCommands) this.props.populateCommands(turndownService.turndown(value))
  }

  // Fires 3nd
  handleKeyUp(e) {
    const { keyCode } = e
    if (keyCode == 16) this.shift = false
    if (keyCode == 13) this.enter = false
  }

  componentDidUpdate() {
    this.attachQuillRefs()
  }

  attachQuillRefs() {
    // Ensure React-Quill reference is available:
    if (typeof this.reactQuillRef.getEditor !== 'function') return
    // Skip if Quill reference is defined:
    if (this.quillRef != null) return

    const quillRef = this.reactQuillRef.getEditor()
    if (quillRef != null) this.quillRef = quillRef
  }

  initAttachmentQueue() {
    Keg.keg(this.props.editorId).tap(
      'uploads',
      (file, pour) => {
        this.setState({ loading: true })

        const { name, type, size } = file
        const secured = true

        UploadService.getUploadUrl(name, type, secured)
          .then(raw => raw.json())
          .then(res => {
            const { url } = res

            UploadService.uploadFile(url, file, type)
              .then(upload => {
                const mime = type
                const urlParts = upload.url.split('?')
                const rawUri = urlParts[0]
                let uriParts = rawUri.replace('https://', '').split('/')

                // Remove the first index value (AWS URL)
                uriParts.shift()

                // Combine the KEY for aws
                const uri = uriParts.join('/')

                // Get the signed URL for this key
                UploadService.getSignedGetUrl(uri)
                  .then(raw => raw.json())
                  .then(res1 => {
                    // Add the new files & increase the index
                    // And pour again to process the next file
                    this.setState({
                      attachments: [...this.state.attachments, { uri: res1.url, mime, size, name }],
                    })

                    // Move onto the next one
                    pour()
                  })
                  .catch(err => {
                    console.log(err)
                    this.setState({ loading: false })
                  })
              })
              .catch(err => {
                console.log(err)
                this.setState({ loading: false })
              })
          })
          .catch(err => {
            console.log(err)
            this.setState({ loading: false })
          })
      },
      () => {
        // This is the empty() callback
        // Stop loading when all is done
        this.setState({ loading: false })
      }
    )
  }

  componentWillUnmount() {
    this.subscription.unsubscribe()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.initialValue && !this.state.text) {
      this.setState({ text: this.props.initialValue })
    }
  }

  componentDidMount() {
    this.attachQuillRefs()
    this.initAttachmentQueue()

    // Set the value if there is one
    if (!!this.props.initialValue) this.setState({ text: this.props.initialValue })
    if (this.props.messageMode) this.keyboard.bindings = {}

    // Listen for focus messages (from message.component)
    EventService.getInstance().on(FOCUS_COMPOSE_INPUT, data => {
      // this.focusComposeInput()
      // Focus the input
    })

    // Set content manually
    EventService.getInstance().on(SET_EDITOR_CONTENT, html => {
      this.setState({ text: html })
    })
  }

  shouldBeHidden(icon) {
    return this.props.hidden.indexOf(icon) !== -1
  }

  renderToolbar() {
    const appsMenu = !!this.props.appsMenu ? (this.props.appsMenu.length != 0 ? true : false) : false

    return (
      <div className="formatting-toolbar">
        {appsMenu && (
          <Popup
            handleDismiss={() => this.setState({ appsMenu: false })}
            visible={this.state.appsMenu}
            width={275}
            direction="right-top"
            content={<Menu items={this.props.appsMenu} />}
          >
            <IconComponent
              icon="more-v"
              size={16}
              color="#565456"
              className="button"
              onClick={() => this.setState({ appsMenu: true })}
            />
          </Popup>
        )}

        <div style={{ width: 10 }} />

        {!this.shouldBeHidden('emoji') && (
          <Popup
            handleDismiss={() => {
              this.setState({ emoticonMenu: false })
            }}
            visible={this.state.emoticonMenu}
            width={250}
            direction={this.props.emojiDirection}
            content={
              <Picker
                style={{ width: 250 }}
                set="emojione"
                title=""
                emoji=""
                showPreview={false}
                showSkinTones={false}
                onSelect={this.handleAddEmoji}
              />
            }
          >
            <div className="formatting-icon active" onClick={() => this.setState({ emoticonMenu: true })}>
              <IconComponent icon="smile" size={16} color="#565456" />
            </div>
          </Popup>
        )}

        {/* If hide attachments are set */}
        {/* Then don't show this - only really applicable with task descriptions */}
        {/* Because attachments are kept to comments */}
        {!this.shouldBeHidden('attachments') && (
          <div className="formatting-icon active" onClick={() => this.fileRef.click()}>
            <IconComponent icon="attachment" size={16} color="#565456" />
            <input
              className="hide"
              ref={ref => (this.fileRef = ref)}
              type="file"
              multiple
              onChange={this.handleFileChange}
            />
          </div>
        )}

        {!!this.props.onSubmit && (
          <Button
            text={this.props.submit ? this.props.submit : 'Send'}
            theme="muted"
            size="small"
            onClick={() => {
              this.props.onSubmit({
                attachments: this.state.attachments,
                html: this.state.text,
                markdown: turndownService.turndown(this.state.text),
              })
              this.setState({ text: '', attachments: [] })
            }}
          />
        )}
      </div>
    )
  }

  renderAttachments() {
    if (this.state.attachments.length == 0) return null

    return (
      <div className="attachments-toolbar">
        {this.state.attachments.map((attachment, index) => {
          return (
            <Attachment
              key={index}
              uri={attachment.uri}
              mime={attachment.mime}
              size={null}
              name={attachment.name}
              createdAt={null}
              onDeleteClick={() =>
                this.setState({
                  attachments: this.state.attachments.filter((a, _) => {
                    return attachment.uri != a.uri
                  }),
                })
              }
            />
          )
        })}
      </div>
    )
  }

  render() {
    return (
      <div className="editor-component">
        {this.renderAttachments()}

        <div className="editor-inner">
          {this.state.loading && <Spinner />}

          <ReactQuill
            ref={el => {
              this.reactQuillRef = el
            }}
            placeholder="Enter some text"
            theme="snow"
            value={this.state.text}
            onKeyDown={this.handleKeyDown}
            onChange={this.handleChange}
            onKeyUp={this.handleKeyUp}
            onBlur={this.handleBlur}
            formats={[
              'background',
              'bold',
              'color',
              'font',
              'code',
              'italic',
              'link',
              'size',
              'strike',
              'script',
              'underline',
              'blockquote',
              'header',
              'indent',
              'list',
              'align',
              'direction',
              'code-block',
              'formula',
              'mention',
            ]}
            modules={{
              mention: this.mentionModule,
              keyboard: this.keyboard,
              markdownShortcuts: {},
              toolbar: [
                [
                  { list: 'ordered' },
                  { list: 'bullet' },
                  'bold',
                  'strike',
                  'italic',
                  'link',
                  'underline',
                  'code-block',
                  'blockquote',
                  'clean',
                ],
              ],
              clipboard: {
                matchVisual: false,
              },
            }}
          />
        </div>
        {this.renderToolbar()}
      </div>
    )
  }
}
