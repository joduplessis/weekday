import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { connect } from 'react-redux'
import styled from 'styled-components'
import moment from 'moment'
import ModalPortal from '../portals/modal.portal'
import PropTypes from 'prop-types'
import { Attachment, Popup, Button, Modal, Error, Spinner } from '../elements'
import { IconComponent } from './icon.component'
import PreviewComponent from './preview.component'
import { shortenMarkdownText } from '../helpers/util'
import GraphqlService from '../services/graphql.service'
import { useParams, useHistory } from 'react-router-dom'
import { MIME_TYPES } from '../constants'

class AttachmentsComponent extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      error: null,
      preview: null,
      busy: false,
      page: 0,
      messages: [],
    }

    this.scrollRef = React.createRef()

    this.fetchChannelAttachments = this.fetchChannelAttachments.bind(this)
    this.handleScrollEvent = this.handleScrollEvent.bind(this)
  }

  componentDidMount() {
    this.fetchChannelAttachments()

    this.scrollRef.addEventListener('scroll', this.handleScrollEvent)
  }

  componentWillUnmount() {
    this.scrollRef.removeEventListener('scroll', this.handleScrollEvent)
  }

  async handleScrollEvent(e) {
    // If the user scvrolls up - then fetch more messages
    // 0 = the top of the container
    if (this.scrollRef.scrollTop + this.scrollRef.clientHeight >= this.scrollRef.scrollHeight)
      this.fetchChannelAttachments()
  }

  async fetchChannelAttachments() {
    // Don't refetch messages every time it's triggered
    // We need to wait if there's already a fetch in progress
    if (this.state.busy) return

    // Set it as busy to not allow more messages to be fetch
    this.setState({
      busy: true,
      loading: true,
    })

    try {
      const teamId = this.props.teamId
      const channelId = this.props.channelId
      const { data } = await GraphqlService.getInstance().channelAttachments(channelId, this.state.page)

      // Only keep messages with valid attachments
      // If users' delete tasks, the message attachment will be null
      const messagesWithValidAttachments = data.channelAttachments
        ? data.channelAttachments.filter(message => {
            // Attachments can't be null
            // And can't be WEEKDAY mime types
            const allValidAttachments = message.attachments
              .filter(attachment => !!attachment)
              .filter(attachment => attachment.mime != MIME_TYPES.MEET && attachment.mime != MIME_TYPES.TASK)

            if (allValidAttachments.length == 0) {
              return false
            } else {
              return true
            }
          })
        : []

      // Add the new messages to the channel
      // Increase the next page & open the scroll event for more messages fetches
      this.setState({
        messages: [...messagesWithValidAttachments, ...this.state.messages],
        page: this.state.page + 1,
        busy: false,
        loading: false,
      })
    } catch (e) {
      this.setState({
        error: e.message,
        busy: false,
        loading: false,
      })
    }
  }

  render() {
    return (
      <Container className="column">
        <Header className="row">
          <HeaderTitle>Channel Files</HeaderTitle>
          <IconComponent icon="x" size={25} color="#040b1c" className="mr-5 button" onClick={this.props.onClose} />
        </Header>

        {this.state.preview && (
          <PreviewComponent onClose={() => this.setState({ preview: null })} image={this.state.preview} />
        )}
        {this.state.error && <Error message={this.state.error} />}
        {this.state.loading && <Spinner />}

        <AttachmentsText>
          There {this.state.messages.length == 1 ? 'is' : 'are'} <strong>{this.state.messages.length}</strong>{' '}
          {this.state.messages.length == 1 ? 'message' : 'messages'} with attachments
        </AttachmentsText>

        <Attachments>
          <AttachmentsScrollContainer ref={ref => (this.scrollRef = ref)}>
            <div className="p-20">
              {this.state.messages.map((message, index1) => {
                if (!message.attachments) return null

                return (
                  <React.Fragment key={index1}>
                    {message.attachments.map((attachment, index2) => {
                      if (!attachment) return null
                      if (!attachment.mime) return null

                      const { mime } = attachment

                      return (
                        <Attachment
                          key={index2}
                          fullwidth={true}
                          size={attachment.size}
                          mime={attachment.mime}
                          preview={attachment.preview}
                          uri={attachment.uri}
                          name={attachment.name}
                          createdAt={attachment.createdAt}
                          onPreviewClick={
                            mime.split('/')[0] == 'image' ? () => this.setState({ preview: attachment.uri }) : null
                          }
                        />
                      )
                    })}

                    <div className="row pt-0">
                      <span className="color-d2 p regular">{message.user.name} -&nbsp;</span>
                      <span className="color-d2 p bold">
                        {moment(message.createdAt)
                          .tz(this.props.user.timezone)
                          .fromNow()}
                      </span>
                    </div>

                    <Text>{shortenMarkdownText(message.body)}</Text>
                  </React.Fragment>
                )
              })}
            </div>
          </AttachmentsScrollContainer>
        </Attachments>
      </Container>
    )
  }
}

const mapDispatchToProps = {}

const mapStateToProps = state => {
  return {
    user: state.user,
    team: state.team,
    channel: state.channel,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AttachmentsComponent)

AttachmentsComponent.propTypes = {
  onClose: PropTypes.func,
  user: PropTypes.any,
  team: PropTypes.any,
  channel: PropTypes.any,
  channelId: PropTypes.string,
  teamId: PropTypes.string,
}

const Container = styled.div`
  display: flex;
  width: 300px;
  height: 100%;
  border-left: 1px solid #f1f3f5;

  @media only screen and (max-width: 768px) {
    width: 100%;
    position: absolute;
    left: 0px;
    trop: 0px;
    height: 100%;
    background: white;
    border-left: none;
    z-index: 5;
  }
`

const Header = styled.div`
  width: 100%;
  background: transparent;
  border-bottom: 1px solid #f1f3f5;
  background: white;
  padding 15px 25px 15px 25px;
  display: flex;
  position: relative;
`

const HeaderTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  font-style: normal;
  color: #040b1c;
  transition: opacity 0.5s;
  display: inline-block;
  margin-bottom: 2px;
  width: max-content;
  flex: 1;
`

const Text = styled.div`
  font-size: 14px;
  color: #acb5bd;
  font-weight: 400;
  line-height: 1.2;
  padding: 0px 0px 20px 0px;
  margin-top: 5px;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  width: 100%;
`

const Attachments = styled.div`
  padding: 20px;
  padding-top: 10px;
  padding-bottom: 0px;
  flex: 1;
  width: 100%;
  position: relative;
`

const AttachmentsText = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: #adb5bd;
  font-weight: regular;
  margin: 20px;
  margin-bottom: 0px;
`

const AttachmentsScrollContainer = styled.div`
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  overflow: scroll;
`
