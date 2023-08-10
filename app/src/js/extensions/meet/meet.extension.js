import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { useSelector, useDispatch, ReactReduxContext } from 'react-redux'
import './meet.extension.css'
import { Avatar, Tooltip, Button, Input, Spinner, Error, Notification } from '../../elements'
import { IconComponent } from '../../components/icon.component'
import { Janus } from './lib/janus'
import { getQueryStringValue, logger, getMentions } from '../../helpers/util'
import GraphqlService from '../../services/graphql.service'
import { updateChannel, createMessages, hydrateMeet } from '../../actions'
import adapter from 'webrtc-adapter'
import PropTypes from 'prop-types'
import moment from 'moment'
import { DEVICE, WEBRTC } from '../../environment'
import { MIME_TYPES } from '../../constants'
import { hydrate } from 'react-dom'
import { default as MeetModalComponent } from './components/modal/modal.component'
import StorageService from '../../services/storage.service'

// Master Janus object
let JANUS = null

// Variables from the Janus videoroom example
const JANUS_VIDEO_PLUGIN = 'janus.plugin.videoroom'
const JANUS_OPAQUE_ID = 'videoroom-' + Janus.randomString(12)

// these are the SFU handles
// API is simply for managing rooms
let JANUS_SFU_API = null
let JANUS_SFU_CAMERA = null
let JANUS_SFU_SCREEN = null

// var bitrate = 0 (unlimited) / 128 / 256 / 1014 / 1500 / 2000
const DEFAULT_BITRATE = 1014

// Media streams
let CAMERA_STREAM = null
let SCREEN_STREAM = null

// Use these to map the subscriptions to us
let JOINED_ID = null
let PRIVATE_ID = null
let JOINED_ID_SCREEN = null
let PRIVATE_ID_SCREEN = null

// Janus bitrate timers
let BITRATE_TIMER = []

// Not 100% implemented yet
let doSimulcast = getQueryStringValue('simulcast') === 'yes' || getQueryStringValue('simulcast') === 'true'
let doSimulcast2 = getQueryStringValue('simulcast2') === 'yes' || getQueryStringValue('simulcast2') === 'true'

const Video = ({ stream, poster, viewable }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    console.log('REMOTE VIDEO COMPONENT --> UPDATING STREAM: ', stream)
    Janus.attachMediaStream(videoRef.current, stream)
  }, [stream])

  return (
    <React.Fragment>
      {!viewable && (
        <div className="not-viewable">
          <IconComponent icon="video-off" color="#11161c" size={20} />
        </div>
      )}
      <video ref={videoRef} width="100%" height="100%" autoPlay poster={poster} />
    </React.Fragment>
  )
}

class VideoExtension extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      participantFocus: false,
      participantToFocus: -1, // Always us
      topic: '',
      participants: [],
      error: null,
      notification: null,
      loading: false,
      view: '',
      muted: false,
      published: false,
      roomId: null,
      screenSharing: false,
      viewable: true,
      meets: [],
      chat: false,
    }

    this.screenVideoRef = React.createRef() // Small screen
    this.focusVideoRef = React.createRef() // Big screen (when user is clicked on)

    this.shareToChannel = this.shareToChannel.bind(this)
    this.stopCall = this.stopCall.bind(this)
    this.hangup = this.hangup.bind(this)
    this.leave = this.leave.bind(this)
    this.exitCall = this.exitCall.bind(this)
    this.resetGlobalValues = this.resetGlobalValues.bind(this)
    this.destroyRoom = this.destroyRoom.bind(this)
    this.mute = this.mute.bind(this)
    this.publish = this.publish.bind(this)
    this.registerScreensharing = this.registerScreensharing.bind(this)
    this.registerUsername = this.registerUsername.bind(this)
    this.publishOwnFeed = this.publishOwnFeed.bind(this)
    this.publishOwnScreenFeed = this.publishOwnScreenFeed.bind(this)
    this.unpublishOwnFeed = this.unpublishOwnFeed.bind(this)
    this.unpublishOwnScreenFeed = this.unpublishOwnScreenFeed.bind(this)
    this.toggleMute = this.toggleMute.bind(this)
    this.toggleVideo = this.toggleVideo.bind(this)
    this.newRemoteFeed = this.newRemoteFeed.bind(this)
    this.getRoomParticipants = this.getRoomParticipants.bind(this)
    this.getServerRoomList = this.getServerRoomList.bind(this)
    this.removeRemoteFeed = this.removeRemoteFeed.bind(this)
    this.initJanusCamera = this.initJanusCamera.bind(this)
    this.attachLocalStreamToVideoEl = this.attachLocalStreamToVideoEl.bind(this)
    this.toggleScreenSharing = this.toggleScreenSharing.bind(this)
    this.stopCapture = this.stopCapture.bind(this)
    this.initJanusScreen = this.initJanusScreen.bind(this)
    this.checkIfRoomExistsFirst = this.checkIfRoomExistsFirst.bind(this)
    this.handleCreateMeet = this.handleCreateMeet.bind(this)
    this.handleDeleteMeet = this.handleDeleteMeet.bind(this)
    this.renderMeetList = this.renderMeetList.bind(this)
    this.renderStartMeet = this.renderStartMeet.bind(this)
    this.renderMeet = this.renderMeet.bind(this)
    this.fetchMeets = this.fetchMeets.bind(this)
    this.joinMeet = this.joinMeet.bind(this)
    this.renderMeetModal = this.renderMeetModal.bind(this)
    this.createRoom = this.createRoom.bind(this)
    this.deleteRoom = this.deleteRoom.bind(this)
    this.initJanusVideoRoom = this.initJanusVideoRoom.bind(this)
  }

  async shareToChannel() {
    const { roomId, topic } = this.state
    const body = `> ${topic}`
    const userName = this.props.user.name
    const userId = this.props.user.id
    const excerpt = userName.toString().split(' ')[0] + ': ' + body || body
    const teamId = this.props.team.id
    const channelId = this.props.channel.id
    const device = DEVICE
    const parentId = null
    const mentions = getMentions(body)
    const attachments = [
      {
        name: topic,
        uri: roomId,
        preview: '',
        mime: MIME_TYPES.MEET,
        size: 0,
      },
    ]

    try {
      const { data } = await GraphqlService.getInstance().createChannelMessage({
        device,
        mentions,
        channel: channelId,
        user: userId,
        team: teamId,
        parent: parentId,
        body,
        excerpt,
        attachments,
      })

      // Catch it
      if (!data.createChannelMessage) return logger('data.createChannelMessage is null')

      // The extra values are used for processing other info
      const channelMessage = {
        message: data.createChannelMessage,
        channelId,
        teamId,
      }

      // Create the message
      this.props.createMessages(channelId, channelMessage)
      this.props.updateChannel(channelId, { excerpt })
    } catch (e) {
      console.log(e)
    }
  }

  stopCall() {}

  leave() {
    const { roomId } = this.props.meet

    // Leave our main camera
    JANUS_SFU_CAMERA.send({
      message: {
        request: 'leave',
        room: Number(roomId),
      },
    })

    // Leave our screen sharing
    if (JANUS_SFU_SCREEN) {
      JANUS_SFU_SCREEN.send({
        message: {
          request: 'leave',
          room: Number(roomId),
        },
      })
    }
  }

  hangup() {
    // Handup our main camera feed
    JANUS_SFU_CAMERA.hangup()

    // Hand up our screen sharing feed if it's there
    if (JANUS_SFU_SCREEN) JANUS_SFU_SCREEN.hangup()

    // Reset our global values
    this.resetGlobalValues()
  }

  exitCall() {
    this.setState(
      {
        view: '',
        participants: [],
        published: false,
      },
      () => {
        this.unpublishOwnFeed()
        this.unpublishOwnScreenFeed()
        this.leave()
        // this.hangup() <-- This breaks things
      }
    )
  }

  resetGlobalValues() {
    if (JANUS) JANUS.destroy()

    JOINED_ID = null
    PRIVATE_ID = null
    JOINED_ID_SCREEN = null
    PRIVATE_ID_SCREEN = null
    JANUS_SFU_CAMERA = null
    JANUS_SFU_SCREEN = null
    CAMERA_STREAM = null
    SCREEN_STREAM = null
    JANUS = null
  }

  destroyRoom(roomId) {
    JANUS_SFU_CAMERA.send({
      message: {
        request: 'destroy',
        room: Number(roomId),
        secret: '',
        permanent: true,
      },
      success: ({ videoroom, room, permanent, error_code, error }) => {
        console.log('Deleted: ', videoroom, room, permanent, error_code, error)
      },
    })
  }

  mute(muted) {
    console.log('setting mute to ', muted)
    this.setState({ muted })
    this.toggleMute()
  }

  publish(published) {
    console.log('setting video to ', published)
    this.setState({ published })
    this.toggleVideo()
  }

  registerScreensharing() {
    // Get some fo the user details we'll use
    // | This is not allowed in URLs
    const { image, name } = this.props.user
    const display = btoa(`${name}|${image}`)
    const { roomId } = this.props.meet

    // there is no sucecss callback here
    // Base 64 encode
    JANUS_SFU_SCREEN.send({
      message: {
        request: 'join',
        room: Number(roomId),
        ptype: 'publisher',
        display: display,
      },
    })
  }

  publishOwnScreenFeed(useAudio, useVideo) {
    JANUS_SFU_SCREEN.createOffer({
      media: {
        audioRecv: false,
        videoRecv: false,
        audioSend: useAudio,
        videoSend: useVideo,
        video: 'screen',
      },
      simulcast: doSimulcast,
      simulcast2: doSimulcast2,
      success: jsep => {
        JANUS_SFU_SCREEN.send({
          message: {
            request: 'configure',
            audio: useAudio,
            video: useVideo,
          },
          jsep: jsep,
        })
      },
      error: error => {
        this.setState({
          screenSharing: false,
          error: error.message,
        })
      },
    })
  }

  unpublishOwnFeed() {
    JANUS_SFU_CAMERA.send({
      message: {
        request: 'unpublish',
      },
    })
  }

  unpublishOwnScreenFeed() {
    if (!JANUS_SFU_SCREEN) return

    JANUS_SFU_SCREEN.send({
      message: {
        request: 'unpublish',
      },
    })
  }

  toggleMute() {
    var muted = JANUS_SFU_CAMERA.isAudioMuted()
    Janus.log('Audio: ' + (muted ? 'Unmuting' : 'Muting') + ' local stream...')
    if (muted) JANUS_SFU_CAMERA.unmuteAudio()
    else JANUS_SFU_CAMERA.muteAudio()
    muted = JANUS_SFU_CAMERA.isAudioMuted()
  }

  toggleVideo() {
    var muted = JANUS_SFU_CAMERA.isVideoMuted()
    Janus.log('Video: ' + (muted ? 'Unmuting' : 'Muting') + ' local stream...')
    if (muted) JANUS_SFU_CAMERA.unmuteVideo()
    else JANUS_SFU_CAMERA.muteVideo()
    muted = JANUS_SFU_CAMERA.isVideoMuted()
    this.setState({ viewable: !muted })
  }

  getRoomParticipants(roomId, callback) {
    JANUS_SFU_API.send({
      message: {
        request: 'listparticipants',
        room: roomId,
      },
      success: res => {
        if (res.error) callback(null, res.error)
        if (!res.error) callback(res.participants, null)
      },
    })
  }

  getServerRoomList() {
    JANUS_SFU_API.send({
      message: {
        request: 'list',
      },
      success: res => {
        console.log('All rooms: ', res)
      },
    })
  }

  removeRemoteFeed(rfid) {
    var remoteFeed = this.state.participants.filter(participant => participant.rfid == rfid)[0]

    // Only if they exist & they're not us
    // msg['leaving'] == "ok" if it's us leaving
    if (remoteFeed) {
      this.setState({
        participants: this.state.participants.filter(participant => participant.rfid != remoteFeed.rfid),
      })

      // Remove the participant
      remoteFeed.detach()
    }
  }

  registerUsername(roomId) {
    // Get some fo the user details we'll use
    // This is not allowed in URLs
    const { image, name } = this.props.user

    // Base64 encode it
    // We will decode it when recieving
    const display = btoa(`${name}|${image}`)

    // there is no sucecss callback here
    // Base 64 encode
    JANUS_SFU_CAMERA.send({
      message: {
        request: 'join',
        ptype: 'publisher',
        room: Number(roomId),
        display: display,
      },
    })
  }

  attachLocalStreamToVideoEl(stream) {
    if (!this.screenVideoRef) return this.setState({ error: 'Video not present' })

    // Set this globallly so that any messages can access it
    CAMERA_STREAM = stream

    // Get this element as a native ref
    const videoElement = this.screenVideoRef

    // So no echo (because it's us)
    videoElement.muted = 'muted'

    // Atthac the MediaStram to the video
    Janus.attachMediaStream(videoElement, stream)
  }

  publishOwnFeed(useAudio, useVideo) {
    JANUS_SFU_CAMERA.createOffer({
      media: {
        audioRecv: false,
        videoRecv: false,
        audioSend: useAudio,
        videoSend: useVideo,
      },
      simulcast: doSimulcast,
      simulcast2: doSimulcast2,
      success: jsep => {
        JANUS_SFU_CAMERA.send({
          message: {
            request: 'configure',
            audio: useAudio,
            video: useVideo,
          },
          jsep: jsep,
        })
      },
      error: error => {
        if (useAudio) {
          this.publishOwnFeed(false, true)
        } else {
          this.setState({ error: error.message })
        }
      },
    })
  }

  newRemoteFeed(id, display, audio, video) {
    let remoteFeed = null
    const { roomId } = this.props.meet

    JANUS.attach({
      plugin: 'janus.plugin.videoroom',
      opaqueId: JANUS_OPAQUE_ID,
      success: pluginHandle => {
        remoteFeed = pluginHandle
        remoteFeed.simulcastStarted = false

        // We wait for the plugin to send us an offer
        var subscribe = {
          request: 'join',
          room: Number(roomId),
          ptype: 'subscriber',
          feed: id,
          private_id: PRIVATE_ID,
        }

        // For example, if the publisher is VP8 and this is Safari, let's avoid video
        if (
          Janus.webRTCAdapter.browserDetails.browser === 'safari' &&
          (video === 'vp9' || (video === 'vp8' && !Janus.safariVp8))
        ) {
          if (video) video = video.toUpperCase()
          subscribe['offer_video'] = false
        }

        remoteFeed.videoCodec = video
        remoteFeed.send({ message: subscribe })
      },
      error: error => {
        this.setState({ error: 'Error getting remote feed' })
      },
      onmessage: (msg, jsep) => {
        var event = msg['videoroom']

        if (msg['error']) {
          console.log('newRemoteFeed error: ', msg['error'])
        } else if (event) {
          if (event === 'attached') {
            remoteFeed.rfid = msg['id']
            remoteFeed.rfdisplay = msg['display']

            // Not sure what the spinner here is?
            // I think loading event hitching a ride on remoteFeed ⚠️
            // TODO: Implement loading mechanism
            if (!remoteFeed.spinner) {
              // Target is the video element ref for the remote feed that we create
              // var target = document.getElementById('videoremote' + remoteFeed.id)
              // remoteFeed.spinner = new Spinner({ top: 100 }).spin(target)
            } else {
              remoteFeed.spinner.spin()
            }

            // Update our state with the new remote feed
            this.setState({ participants: [...this.state.participants, remoteFeed] })
          } else if (event === 'event') {
            var substream = msg['substream']
            var temporal = msg['temporal']

            if ((substream !== null && substream !== undefined) || (temporal !== null && temporal !== undefined)) {
              if (!remoteFeed.simulcastStarted) {
                // remoteFeed.simulcastStarted = true
                // Add some new buttons
                // Unsupported FOR NOW ⚠️
                // addSimulcastButtons(remoteFeed.id, remoteFeed.videoCodec === 'vp8' || remoteFeed.videoCodec === 'h264')
              }
              // We just received notice that there's been a switch, update the buttons
              // Unsupported FOR NOW ⚠️
              // updateSimulcastButtons(remoteFeed.id, substream, temporal)
            }
          } else {
            // What has just happened?
          }
        }

        if (jsep) {
          remoteFeed.createAnswer({
            jsep: jsep,
            // Add data:true here if you want to subscribe to datachannels as well
            // (obviously only works if the publisher offered them in the first place)
            media: { audioSend: false, videoSend: false }, // We want recvonly audio/video
            success: jsep => {
              var body = { request: 'start', room: Number(roomId) }
              remoteFeed.send({ message: body, jsep: jsep })
            },
            error: error => {},
          })
        }
      },
      iceState: state => {
        Janus.log('ICE state of this WebRTC PeerConnection (feed #' + remoteFeed.id + ') changed to ' + state)
      },
      webrtcState: on => {
        Janus.log(
          'Janus says this WebRTC PeerConnection (feed #' + remoteFeed.id + ') is ' + (on ? 'up' : 'down') + ' now'
        )
      },
      onlocalstream: stream => {
        // The subscriber stream is recvonly, we don't expect anything here
      },
      onremotestream: stream => {
        Janus.log('Remote feed #' + remoteFeed.id + ', stream:', stream, remoteFeed)
        console.log('Current remote particicpants: ', this.state.participants)

        // Look for existing remoteParticipants
        const remoteParticipant = this.state.participants.filter(
          remoteParticipant => remoteParticipant.id == remoteFeed.id
        )

        if (remoteParticipant.length === 0) {
          // Firefox Stable has a bug: width and height are not immediately available after a playing
          if (Janus.webRTCAdapter.browserDetails.browser === 'firefox') {
            setTimeout(() => {
              // Adjust width & height here --> we do this with CSS
            }, 2000)
          }
        }

        // Janus.attachMediaStream($('#remotevideo' + remoteFeed.id).get(0), stream)
        // Now we update the state and add the stream
        this.setState(
          {
            participants: this.state.participants.map(remoteParticipant => {
              return remoteParticipant.id == remoteFeed.id
                ? { ...remoteFeed, stream, viewable: true }
                : remoteParticipant
            }),
          },
          () => {
            // AFTER our state update
            // Handle bitrate / streams
            let bitrates = {}
            const videoTracks = stream.getVideoTracks()
            const makeRemoteParticipantViewable = viewable => {
              this.setState({
                participants: this.state.participants.map(remoteParticipant => {
                  return remoteParticipant.id == remoteFeed.id ? { ...remoteParticipant, viewable } : remoteParticipant
                }),
              })
            }

            // Handle whether or not there are video tracks
            if (!videoTracks || videoTracks.length === 0) {
              // No remote video
              // Hide the remote video feed
              console.log('HIDE THE REMOTE VIDEO')
              makeRemoteParticipantViewable(false)
            } else {
              // Show the remote video
              console.log('SHOW THE REMOTE VIDEO')
              makeRemoteParticipantViewable(true)
            }

            // Handle bitrate display
            if (
              Janus.webRTCAdapter.browserDetails.browser === 'chrome' ||
              Janus.webRTCAdapter.browserDetails.browser === 'firefox' ||
              Janus.webRTCAdapter.browserDetails.browser === 'safari'
            ) {
              BITRATE_TIMER[remoteFeed.id] = setInterval(() => {
                // Strip the stirng off
                const bitrate = remoteFeed.getBitrate().split(' ')[0]

                // Only deal with numbers
                if (isNaN(bitrate)) return

                // If the bitrate drop below 10
                // Then don't show anything
                // But only do this once (so it doesn't stress the browsaer out)
                if (bitrate < 10) {
                  if (bitrates[remoteFeed.id]) {
                    bitrates[remoteFeed.id] = false
                    makeRemoteParticipantViewable(false)
                  }
                }

                // If the bitrate exceeds 10
                // Then show the video feed
                // But only do this once (so it doesn't stress the browsaer out
                if (bitrate > 10) {
                  if (!bitrates[remoteFeed.id]) {
                    bitrates[remoteFeed.id] = true
                    makeRemoteParticipantViewable(true)
                  }
                }

                // console.log(remoteFeed.id, bitrate, bitrates[remoteFeed.id])
              }, 1000)
            }
          }
        )
      },
      oncleanup: () => {
        Janus.log(' ::: Got a cleanup notification (remote feed ' + id + ') :::', remoteFeed.id)

        // Not sure what spinner is - think jQuery object
        // ⚠️ TODO: invesigate and remove
        if (remoteFeed.spinner) remoteFeed.spinner.stop()
        remoteFeed.spinner = null

        // Remove the video
        this.setState({
          participants: this.state.participants.filter(remoteParticipant => remoteParticipant.id != remoteFeed.id),
        })

        if (BITRATE_TIMER[remoteFeed.id]) clearInterval(BITRATE_TIMER[remoteFeed.id])
        BITRATE_TIMER[remoteFeed.id] = null
        remoteFeed.simulcastStarted = false
        // We don't handle simulcast yet
        // $('#simulcast' + remoteFeed.id).remove()
      },
    })
  }

  initJanusVideoRoom(meet, cb) {
    Janus.init({
      debug: 'all',
      callback: () => {
        JANUS = new Janus({
          server: meet.location,
          token: meet.token,
          success: () => {
            // Make sure we can
            if (!Janus.isWebrtcSupported()) return this.setState({ view: '', error: 'No WebRTC support.' })

            // Otherwise carry on
            JANUS.attach({
              plugin: JANUS_VIDEO_PLUGIN,
              opaqueId: JANUS_OPAQUE_ID,
              success: pluginHandle => {
                // Register the API handle
                JANUS_SFU_API = pluginHandle

                // Debug
                console.log('JANUS_SFU_API', pluginHandle.id)

                // After it's done
                cb()
              },
              error: error => console.error('ATTACH ERROR', error),
              consentDialog: on => {},
              iceState: state => {},
              mediaState: (medium, on) => {},
              webrtcState: on => {},
              onmessage: (msg, jsep) => {},
              onlocalstream: stream => {},
            })
          },
          error: error => console.log('INIT ERROR', error),
          destroyed: () => {},
        })
      },
    })
  }

  initJanusCamera(cb) {
    JANUS.attach({
      plugin: 'janus.plugin.videoroom',
      opaqueId: JANUS_OPAQUE_ID,
      success: pluginHandle => {
        // Attach thee camera hcnale
        JANUS_SFU_CAMERA = pluginHandle

        // Debug
        console.log('JANUS_SFU_CAMERA', pluginHandle.id)

        // After it's done
        cb()
      },
      error: error => this.setState({ error }),
      consentDialog: on => {},
      iceState: state => {},
      mediaState: (medium, on) => {},
      webrtcState: on => {
        if (!on) return

        // Cofigure our connection bitrate
        JANUS_SFU_CAMERA.send({
          message: {
            request: 'configure',
            bitrate: DEFAULT_BITRATE,
          },
        })
      },
      onmessage: (msg, jsep) => {
        var event = msg['videoroom']

        if (event) {
          if (event === 'joined') {
            JOINED_ID = msg['id']
            PRIVATE_ID = msg['private_id']

            // We have the feed
            this.publishOwnFeed(true, true)

            // Set the call to active
            this.setState({ view: 'meet' })

            // These attach all the exisitng publishers that are there when the room starts
            // So once we join, then we get this list of people already in the call
            if (msg['publishers']) {
              const publishers = msg['publishers']

              for (var publisher in publishers) {
                const id = publishers[publisher]['id']
                const display = publishers[publisher]['display']
                const audio = publishers[publisher]['audio_codec']
                const video = publishers[publisher]['video_codec']

                // Add the publishers to the remote feed list
                // This will base64 DECODE their display too
                this.newRemoteFeed(id, display, audio, video)
              }
            }
          } else if (event === 'destroyed') {
            // Call has been destroyed
            this.setState({
              participants: [],
              view: '',
            })
          } else if (event === 'event') {
            if (msg['publishers']) {
              var publishers = msg['publishers']

              // Any new publishers, we also add here
              for (var publisher in publishers) {
                var id = publishers[publisher]['id']
                var display = publishers[publisher]['display']
                var audio = publishers[publisher]['audio_codec']
                var video = publishers[publisher]['video_codec']

                // And then this will again base64 decode the display name
                this.newRemoteFeed(id, display, audio, video)
              }
            } else if (msg['leaving']) {
              this.removeRemoteFeed(msg['leaving'])
            } else if (msg['unpublished']) {
              var unpublished = msg['unpublished']

              // Remove it from the list
              this.removeRemoteFeed(unpublished)

              // If we are unpublished - so if we leave then we
              // will send Janus a leaving feed and we will need to be removed
              if (unpublished === 'ok') return this.exitCall()
            } else if (msg['error']) {
              switch (msg['error_code']) {
                // If the room doesn't exist, then direct them to the list
                // We should show an error here - but we'll simply debug it
                case 430:
                  console.error('WRONG ROOMID: ', msg)
                  this.setState({ view: '' })
                  break

                // If the room doesn't exist, then direct them to the list
                // We should show an error here - but we'll simply debug it
                case 426:
                  console.error('ROOM DOES NOT EXIST: ', msg)
                  this.setState({ view: '' })
                  break

                // User already a publisher here
                // The room ID would have been updated from the "Join" button
                case 425:
                  console.error('ALREADY PUBLISHED IN ROOM: ', msg)
                  this.setState({ view: 'meet' })
                  this.publishOwnFeed(true, true)
                  break

                default:
                  console.error('ERROR: ', msg)
              }
            }
          }
        }

        if (jsep) {
          JANUS_SFU_CAMERA.handleRemoteJsep({ jsep })

          // Check if any of the media we wanted to publish has
          // been rejected (e.g., wrong or unsupported codec)
          var audio = msg['audio_codec']
          var video = msg['video_codec']

          // Audio has been rejected
          if (CAMERA_STREAM && CAMERA_STREAM.getAudioTracks() && CAMERA_STREAM.getAudioTracks().length > 0 && !audio) {
            this.setState({ error: "Our audio stream has been rejected, viewers won't hear us" })
          }

          // Video has been rejected
          // Hide the webcam video element REF - see below where it attached
          if (CAMERA_STREAM && CAMERA_STREAM.getVideoTracks() && CAMERA_STREAM.getVideoTracks().length > 0 && !video) {
            this.setState({ error: "Our video stream has been rejected, viewers won't see us" })
          }
        }
      },
      onlocalstream: stream => {
        this.attachLocalStreamToVideoEl(stream)

        // Handle the ice connection - making sure we're published here for the user
        if (
          JANUS_SFU_CAMERA.webrtcStuff.pc.iceConnectionState !== 'completed' &&
          JANUS_SFU_CAMERA.webrtcStuff.pc.iceConnectionState !== 'connected'
        ) {
          // Show an indicator/notice for the user to say we're publishing
          // Do nothing here for now
          // Will be handled by the loading indicator
          this.setState({ published: true })
        }

        // Get all the video trackcs from this device
        var videoTracks = stream.getVideoTracks()

        // Get our video tracks
        if (!videoTracks || videoTracks.length === 0) {
          this.setState({ error: 'Webcam feed is off, or not present.' })
        }
      },
      onremotestream: stream => {},
      oncleanup: () => {
        CAMERA_STREAM = null
      },
    })
  }

  initJanusScreen() {
    // Set up our screen
    // Save this globally
    // this is not used - but kept as reference
    // This gets the stream vanilla
    /* 
    SCREEN_STREAM = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    }) 
    */

    // Tell janus we're sharing
    this.setState({ screenSharing: true }, () => {
      JANUS.attach({
        plugin: 'janus.plugin.videoroom',
        opaqueId: JANUS_OPAQUE_ID,
        success: pluginHandle => {
          JANUS_SFU_SCREEN = pluginHandle

          // Debug
          console.log('JANUS_SFU_SCREEN', pluginHandle.id)

          // Join the room as a screen
          this.registerScreensharing()
        },
        error: error => {
          this.setState({
            error,
            loading: false,
          })
        },
        consentDialog: on => {},
        iceState: state => {},
        mediaState: (medium, on) => {},
        webrtcState: on => {
          if (!on) return
          // This controls allows us to override the global room bitrate cap
          // 0 == unlimited
          // var bitrate = 0 / 128 / 256 / 1014 / 1500 / 2000
          JANUS_SFU_SCREEN.send({
            message: {
              request: 'configure',
              bitrate: 1014,
            },
          })
        },
        onmessage: (msg, jsep) => {
          var event = msg['videoroom']

          if (event) {
            if (event === 'joined') {
              JOINED_ID_SCREEN = msg['id']
              PRIVATE_ID_SCREEN = msg['private_id']

              // We have the feed
              this.publishOwnScreenFeed(true, true)
            } else if (event === 'destroyed') {
            } else if (event === 'event') {
              // Attach any new feeds that join
              if (msg['publishers']) {
              } else if (msg['leaving']) {
              } else if (msg['unpublished']) {
              } else if (msg['error']) {
              }
            }
          }

          if (jsep) {
            JANUS_SFU_SCREEN.handleRemoteJsep({ jsep: jsep })

            var audio = msg['audio_codec']
            var video = msg['video_codec']

            // Audio has been rejected
            if (
              SCREEN_STREAM &&
              SCREEN_STREAM.getAudioTracks() &&
              SCREEN_STREAM.getAudioTracks().length > 0 &&
              !audio
            ) {
              this.setState({ error: "Our audio stream has been rejected, viewers won't hear us" })
            }

            // Video has been rejected
            // Hide the webcam video element REF - see below where it attached
            if (
              SCREEN_STREAM &&
              SCREEN_STREAM.getVideoTracks() &&
              SCREEN_STREAM.getVideoTracks().length > 0 &&
              !video
            ) {
              this.setState({ error: "Our video stream has been rejected, viewers won't see us" })
            }
          }
        },
        onlocalstream: stream => {
          SCREEN_STREAM = stream

          // Handle the ice connection - making sure we're published here for the user
          if (
            JANUS_SFU_SCREEN.webrtcStuff.pc.iceConnectionState !== 'completed' &&
            JANUS_SFU_SCREEN.webrtcStuff.pc.iceConnectionState !== 'connected'
          ) {
            // Show an indicator/notice for the user to say we're publishing
            // Do nothing here for now
            // Will be handled by the loading indicator
          }

          // Get all the video trackcs from this device
          var videoTracks = SCREEN_STREAM.getVideoTracks()

          // Get our video tracks
          if (!videoTracks || videoTracks.length === 0) {
            this.setState({ error: 'Screensharing feed is off, or not present.' })
          }
        },
        onremotestream: stream => {},
        oncleanup: () => {
          SCREEN_STREAM = null
        },
      })
    })
  }

  componentWillUnmount() {
    this.resetGlobalValues()
  }

  componentDidMount() {
    // Get a list of all meets from the normal API
    // Any new meets will be locationed by the server API
    this.fetchMeets()

    // Debug
    setTimeout(() => {
      // this.joinMeet("112427")
    }, 500)
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.channelId != prevProps.match.params.channelId) {
      this.fetchMeets()
    }
  }

  async fetchMeets() {
    try {
      const { channelId, teamId } = this.props.match.params
      let searchCriteria = {}

      if (channelId) searchCriteria['channel'] = channelId
      if (teamId) searchCriteria['team'] = teamId

      // Get the list of meets & display them
      const {
        data: { meets },
      } = await GraphqlService.getInstance().meets(searchCriteria)
      const view = ''

      this.setState({
        meets,
        view,
      })
    } catch (e) {
      logger(e)
    }
  }

  toggleScreenSharing() {
    if (this.state.screenSharing) {
      this.stopCapture()
    } else {
      this.initJanusScreen()
    }
  }

  stopCapture() {
    this.unpublishOwnScreenFeed()
  }

  createRoom(roomId, topic, cb, cbe) {
    JANUS_SFU_API.send({
      message: {
        request: 'create',
        description: topic,
        record: false,
        room: Number(roomId),
        ptype: 'publisher',
        is_private: false,
        secret: '',
        permanent: false,
      },
      success: ({ videoroom, room, permanent, error_code, error }) => {
        if (error) cbe({ ...error, error_code })
        if (!error) cb()
      },
    })
  }

  deleteRoom(roomId, cb, cbe) {
    JANUS_SFU_API.send({
      message: {
        request: 'destroy',
        room: Number(roomId),
        permanent: false,
        secret: '',
      },
      success: ({ videoroom, room, permanent, error_code, error }) => {
        if (error) cbe({ ...error, error_code })
        if (!error) cb()
      },
    })
  }

  checkIfRoomExistsFirst(roomId, cb, cbe) {
    console.log('checkIfRoomExistsFirst', roomId)

    JANUS_SFU_CAMERA.send({
      message: {
        request: 'exists',
        room: Number(roomId),
      },
      success: ({ videoroom, room, exists, error_code, error }) => {
        if (error) cbe({ ...error, error_code })
        if (!error) cb({ videoroom, room, exists })
      },
    })
  }

  async joinMeet(meetId) {
    this.setState({
      error: null,
      notification: null,
    })

    try {
      const {
        data: { meet },
      } = await GraphqlService.getInstance().meet(meetId)
      const { roomId, topic } = meet

      // Update Redux
      this.props.hydrateMeet(meet)

      // Update our UI - this will show the actual call UI
      this.setState({ view: 'meet' })

      // Get an API handle
      this.initJanusVideoRoom(meet, () => {
        // And start the room
        this.initJanusCamera(() => {
          // Now check if the room exists
          this.checkIfRoomExistsFirst(
            roomId,
            ({ videoroom, room, exists }) => {
              console.log('checkIfRoomExistsFirst', videoroom, room, exists)

              if (!exists) {
                console.log('checkIfRoomExistsFirst: does not exist')

                // Create the room
                this.createRoom(
                  roomId,
                  topic,
                  () => {
                    this.registerUsername(roomId)
                  },
                  error => {
                    console.log('createRoom ERROR', error)
                  }
                )
              } else {
                this.registerUsername(roomId)
              }
            },
            error => {
              console.log('checkIfRoomExistsFirst ERROR', error)
            }
          )
        })
      })
    } catch (e) {
      this.setState({ error: 'Error getting meet' })
    }
  }

  async handleCreateMeet() {
    this.setState({
      error: null,
      notification: null,
    })

    try {
      const { channelId, teamId } = this.props.match.params
      const { topic } = this.state
      const payload = {
        topic,
        channel: channelId,
        team: teamId,
      }
      const {
        data: { createMeet },
      } = await GraphqlService.getInstance().createMeet(payload)

      // Check for validity
      if (!createMeet) return
      if (!createMeet.location) return

      // Add it to our state & reset the view
      this.setState({
        meets: [...this.state.meets, createMeet],
        view: '',
        topic: '',
      })
    } catch (e) {
      console.log('>>', e)
      this.setState({ error: 'Error creating call from API' })
    }
  }

  async handleDeleteMeet(meetId) {
    if (!confirm('Are you sure?')) return

    this.setState({
      error: null,
      notification: null,
    })

    try {
      const { data } = await GraphqlService.getInstance().deleteMeet(meetId)

      // Remove it from our state & reset the view
      this.setState({
        meets: this.state.meets.filter(meet => meet.id != meetId),
        view: '',
        topic: '',
      })
    } catch (e) {
      console.log('>>', e)
      this.setState({ error: 'Error deleting call from API' })
    }
  }

  // These manage the views
  renderMeetList() {
    if (this.state.view != '') return null
    if (!this.state.meets) return null

    return (
      <div className="flexer w-100">
        <div className="header">
          <div className="title">Meet</div>
          <div className="flexer"></div>
          <Button
            text="Create"
            size="small"
            theme="muted"
            className="mr-25"
            onClick={() => this.setState({ view: 'start' })}
          />
        </div>

        {this.state.meets.map((meet, index) => {
          return (
            <div className="call" key={index}>
              <div className="column flexer">
                <div className="topic">{meet.topic}</div>
                <div className="date">
                  Started {moment(meet.createdAt).fromNow()} - #{meet.roomId}
                </div>
              </div>
              <Button theme="muted" text="Join" className="mr-10" size="small" onClick={() => this.joinMeet(meet.id)} />
              <Button theme="red" text="Remove" size="small" onClick={() => this.handleDeleteMeet(meet.id)} />
            </div>
          )
        })}

        {this.state.meets.length == 0 && (
          <div className="list">
            <img src="icon-muted.svg" height="200" className="mb-20" />
            <div className="pb-30 color-d0 h5">There are no meets</div>
          </div>
        )}
      </div>
    )
  }

  renderStartMeet() {
    if (this.state.view != 'start') return null

    return (
      <div className="flexer w-100">
        <div className="header">
          <Button
            text="Go back"
            theme="muted"
            className="ml-25"
            onClick={() => this.setState({ view: '' })}
            icon={<IconComponent icon="chevron-left" color="#617691" size={16} />}
          />
          <div className="flexer"></div>
        </div>

        <div className="join-start">
          <img src="icon-muted.svg" height="200" className="mb-20" />
          <div className="pb-30 color-d0 h5">Create a new meet</div>
          <div className="row w-100 pl-30 pr-30 pt-10 pb-10">
            <Input
              placeholder="Enter meet topic"
              inputSize="large"
              value={this.state.topic}
              onChange={e => this.setState({ topic: e.target.value })}
              className="mb-20"
            />
          </div>
          <Button text="Create now" size="large" theme="muted" onClick={() => this.handleCreateMeet()} />
        </div>
      </div>
    )
  }

  renderMeet() {
    if (this.state.view != 'meet') return null

    return (
      <React.Fragment>
        <div className="header">
          <div className="subtitle">Meet</div>
          <div className="title">{this.props.meet.topic}</div>
          <div className="flexer"></div>
          <Tooltip text="End call" direction="left">
            <div className="control-button red" onClick={() => this.exitCall()}>
              <IconComponent icon="x" color="white" size={20} />
            </div>
          </Tooltip>
        </div>

        <div className="flexer column w-100">
          {this.state.participantFocus && <div className="flexer" />}

          <div className="participants">
            <div className="scroll-container">
              <div className="inner-content">
                {/* The first one is always us */}
                <div
                  className={
                    this.state.participantFocus && this.state.participantToFocus == -1
                      ? 'participant focus'
                      : 'participant'
                  }
                  onClick={() =>
                    this.setState({ participantFocus: !this.state.participantFocus, participantToFocus: -1 })
                  }
                >
                  <div className="name">
                    <div className="text">{this.props.user.name}</div>
                  </div>

                  {this.state.participantFocus && this.state.participantToFocus == -1 && (
                    <div
                      className="close-main-screen button"
                      onClick={() => this.setState({ participantFocus: false })}
                    >
                      <IconComponent icon="x" color="white" size={20} />
                    </div>
                  )}

                  {!this.state.viewable && (
                    <div className="not-viewable">
                      <IconComponent icon="video-off" color="#11161c" size={20} />
                    </div>
                  )}

                  {/* local video stream */}
                  <video
                    ref={ref => (this.screenVideoRef = ref)}
                    width="100%"
                    height="100%"
                    autoPlay
                    muted="muted"
                    poster={this.props.user.image}
                  />
                </div>

                {/* the rest of them - iterate over them */}
                {this.state.participants.map((remoteParticipant, index) => {
                  let userFullName = 'NA'
                  let userAvatar = null

                  // These get passed everytime they join
                  // We decode the base64 values
                  if (remoteParticipant.rfdisplay) {
                    const normalString = atob(remoteParticipant.rfdisplay)
                    const displayNameParts = normalString.split('|')

                    userFullName = displayNameParts[0]
                    userAvatar = displayNameParts[1]
                  }

                  return (
                    <div
                      className={
                        this.state.participantFocus && this.state.participantToFocus == index
                          ? 'participant focus'
                          : 'participant'
                      }
                      onClick={() =>
                        this.setState({ participantFocus: !this.state.participantFocus, participantToFocus: index })
                      }
                      key={index}
                    >
                      <div className="name">
                        <div className="text">{userFullName}</div>
                      </div>

                      {this.state.participantFocus && this.state.participantToFocus == index && (
                        <div
                          className="close-main-screen button"
                          onClick={() => this.setState({ participantFocus: false })}
                        >
                          <IconComponent icon="x" color="white" size={20} />
                        </div>
                      )}

                      {/* remote participant video stream */}
                      {remoteParticipant.stream && (
                        <Video
                          stream={remoteParticipant.stream}
                          viewable={remoteParticipant.viewable}
                          poster={userAvatar}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="controls">
            {/* toggle video media publishing */}
            <Tooltip text="Toggle video feed" direction="top">
              <div className="control-button" onClick={() => this.publish(!this.state.published)}>
                <IconComponent icon={this.state.published ? 'video' : 'video-off'} color="#343a40" size={20} />
              </div>
            </Tooltip>

            {/* toggle audio media publishing */}
            <Tooltip text="Toggle muting" direction="top">
              <div className="control-button" onClick={() => this.mute(!this.state.muted)}>
                <IconComponent icon={this.state.muted ? 'mic-off' : 'mic'} color="#343a40" size={20} />
              </div>
            </Tooltip>

            {/* share to channel */}
            <div className="control-button" onClick={() => this.toggleScreenSharing()}>
              {this.state.screenSharing ? 'Stop sharing' : 'Share screen'}
            </div>

            {/* share screen */}
            <div className="control-button" onClick={() => this.shareToChannel()}>
              Share to channel
            </div>

            {/* Chat */}
            <div className="control-button" onClick={() => this.setState({ chat: true })}>
              <IconComponent icon="message-circle" color="#343a40" size={20} />
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  renderMeetModal() {
    if (!this.state.chat) return null

    return <MeetModalComponent onClose={() => this.setState({ chat: false })} />
  }

  render() {
    return (
      <div className={`meet-extension ${this.state.participantFocus ? '' : 'all'}`}>
        {this.state.error && <Error message={this.state.error} onDismiss={() => this.setState({ error: null })} />}
        {this.state.loading && <Spinner />}
        {this.state.notification && (
          <Notification text={this.state.notification} onDismiss={() => this.setState({ notification: null })} />
        )}

        {this.renderMeetList()}
        {this.renderStartMeet()}
        {this.renderMeetModal()}
        {this.renderMeet()}
      </div>
    )
  }
}

VideoExtension.propTypes = {
  user: PropTypes.any,
  team: PropTypes.any,
  meet: PropTypes.any,
  channel: PropTypes.any,
  createMessages: PropTypes.func,
  updateChannel: PropTypes.func,
  hydrateMeet: PropTypes.func,
}

const mapDispatchToProps = {
  updateChannel: (channelId, channel) => updateChannel(channelId, channel),
  hydrateMeet: meet => hydrateMeet(meet),
  createMessages: (channelId, channelMessage) => createMessages(channelId, channelMessage),
}

const mapStateToProps = state => {
  return {
    user: state.user,
    team: state.team,
    meet: state.meet,
    channel: state.channel,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VideoExtension)

/* 

  These are the simulcast s from the Janus videoroom example
  They still need to be refactored & integrated into the React codebase
  Keeping them here for the meantime

   addSimulcastButtons(feed, temporal) {
    var index = feed
    $('#remote' + index)
      .parent()
      .append(  
        '<div id="simulcast' +
          index +
          '" class="btn-group-vertical btn-group-vertical-xs pull-right">' +
          '	<div class"row">' +
          '		<div class="btn-group btn-group-xs" style="width: 100%">' +
          '			<button id="sl' +
          index +
          '-2" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to higher quality" style="width: 33%">SL 2</button>' +
          '			<button id="sl' +
          index +
          '-1" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to normal quality" style="width: 33%">SL 1</button>' +
          '			<button id="sl' +
          index +
          '-0" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to lower quality" style="width: 34%">SL 0</button>' +
          '		</div>' +
          '	</div>' +
          '	<div class"row">' +
          '		<div class="btn-group btn-group-xs hide" style="width: 100%">' +
          '			<button id="tl' +
          index +
          '-2" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 2" style="width: 34%">TL 2</button>' +
          '			<button id="tl' +
          index +
          '-1" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 1" style="width: 33%">TL 1</button>' +
          '			<button id="tl' +
          index +
          '-0" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 0" style="width: 33%">TL 0</button>' +
          '		</div>' +
          '	</div>' +
          '</div>'
      )
    // Enable the simulcast selection buttons
    $('#sl' + index + '-0')
      .removeClass('btn-primary btn-success')
      .addClass('btn-primary')
      .unbind('click')
      .click(() {
        console.info('Switching simulcast substream, wait for it... (lower quality)', null, { timeOut: 2000 })
        if (!$('#sl' + index + '-2').hasClass('btn-success'))
          $('#sl' + index + '-2')
            .removeClass('btn-primary btn-info')
            .addClass('btn-primary')
        if (!$('#sl' + index + '-1').hasClass('btn-success'))
          $('#sl' + index + '-1')
            .removeClass('btn-primary btn-info')
            .addClass('btn-primary')
        $('#sl' + index + '-0')
          .removeClass('btn-primary btn-info btn-success')
          .addClass('btn-info')
        feeds[index].send({ message: { request: 'configure', substream: 0 } })
      })
    $('#sl' + index + '-1')
      .removeClass('btn-primary btn-success')
      .addClass('btn-primary')
      .unbind('click')
      .click(() {
        console.info('Switching simulcast substream, wait for it... (normal quality)', null, { timeOut: 2000 })
        if (!$('#sl' + index + '-2').hasClass('btn-success'))
          $('#sl' + index + '-2')
            .removeClass('btn-primary btn-info')
            .addClass('btn-primary')
        $('#sl' + index + '-1')
          .removeClass('btn-primary btn-info btn-success')
          .addClass('btn-info')
        if (!$('#sl' + index + '-0').hasClass('btn-success'))
          $('#sl' + index + '-0')
            .removeClass('btn-primary btn-info')
            .addClass('btn-primary')
        feeds[index].send({ message: { request: 'configure', substream: 1 } })
      })
    $('#sl' + index + '-2')
      .removeClass('btn-primary btn-success')
      .addClass('btn-primary')
      .unbind('click')
      .click(() {
        console.info('Switching simulcast substream, wait for it... (higher quality)', null, { timeOut: 2000 })
        $('#sl' + index + '-2')
          .removeClass('btn-primary btn-info btn-success')
          .addClass('btn-info')
        if (!$('#sl' + index + '-1').hasClass('btn-success'))
          $('#sl' + index + '-1')
            .removeClass('btn-primary btn-info')
            .addClass('btn-primary')
        if (!$('#sl' + index + '-0').hasClass('btn-success'))
          $('#sl' + index + '-0')
            .removeClass('btn-primary btn-info')
            .addClass('btn-primary')
        feeds[index].send({ message: { request: 'configure', substream: 2 } })
      })
    if (!temporal)
      // No temporal layer support
      return
    $('#tl' + index + '-0')
      .parent()
      .removeClass('hide')
    $('#tl' + index + '-0')
      .removeClass('btn-primary btn-success')
      .addClass('btn-primary')
      .unbind('click')
      .click(() {
        console.info('Capping simulcast temporal layer, wait for it... (lowest FPS)', null, { timeOut: 2000 })
        if (!$('#tl' + index + '-2').hasClass('btn-success'))
          $('#tl' + index + '-2')
            .removeClass('btn-primary btn-info')
            .addClass('btn-primary')
        if (!$('#tl' + index + '-1').hasClass('btn-success'))
          $('#tl' + index + '-1')
            .removeClass('btn-primary btn-info')
            .addClass('btn-primary')
        $('#tl' + index + '-0')
          .removeClass('btn-primary btn-info btn-success')
          .addClass('btn-info')
        feeds[index].send({ message: { request: 'configure', temporal: 0 } })
      })
    $('#tl' + index + '-1')
      .removeClass('btn-primary btn-success')
      .addClass('btn-primary')
      .unbind('click')
      .click(() {
        console.info('Capping simulcast temporal layer, wait for it... (medium FPS)', null, { timeOut: 2000 })
        if (!$('#tl' + index + '-2').hasClass('btn-success'))
          $('#tl' + index + '-2')
            .removeClass('btn-primary btn-info')
            .addClass('btn-primary')
        $('#tl' + index + '-1')
          .removeClass('btn-primary btn-info')
          .addClass('btn-info')
        if (!$('#tl' + index + '-0').hasClass('btn-success'))
          $('#tl' + index + '-0')
            .removeClass('btn-primary btn-info')
            .addClass('btn-primary')
        feeds[index].send({ message: { request: 'configure', temporal: 1 } })
      })
    $('#tl' + index + '-2')
      .removeClass('btn-primary btn-success')
      .addClass('btn-primary')
      .unbind('click')
      .click(() {
        console.info('Capping simulcast temporal layer, wait for it... (highest FPS)', null, { timeOut: 2000 })
        $('#tl' + index + '-2')
          .removeClass('btn-primary btn-info btn-success')
          .addClass('btn-info')
        if (!$('#tl' + index + '-1').hasClass('btn-success'))
          $('#tl' + index + '-1')
            .removeClass('btn-primary btn-info')
            .addClass('btn-primary')
        if (!$('#tl' + index + '-0').hasClass('btn-success'))
          $('#tl' + index + '-0')
            .removeClass('btn-primary btn-info')
            .addClass('btn-primary')
        feeds[index].send({ message: { request: 'configure', temporal: 2 } })
      })
  }

   updateSimulcastButtons(feed, substream, temporal) {
    // Check the substream
    var index = feed
    if (substream === 0) {
      console.success('Switched simulcast substream! (lower quality)', null, { timeOut: 2000 })
      $('#sl' + index + '-2')
        .removeClass('btn-primary btn-success')
        .addClass('btn-primary')
      $('#sl' + index + '-1')
        .removeClass('btn-primary btn-success')
        .addClass('btn-primary')
      $('#sl' + index + '-0')
        .removeClass('btn-primary btn-info btn-success')
        .addClass('btn-success')
    } else if (substream === 1) {
      console.success('Switched simulcast substream! (normal quality)', null, { timeOut: 2000 })
      $('#sl' + index + '-2')
        .removeClass('btn-primary btn-success')
        .addClass('btn-primary')
      $('#sl' + index + '-1')
        .removeClass('btn-primary btn-info btn-success')
        .addClass('btn-success')
      $('#sl' + index + '-0')
        .removeClass('btn-primary btn-success')
        .addClass('btn-primary')
    } else if (substream === 2) {
      console.success('Switched simulcast substream! (higher quality)', null, { timeOut: 2000 })
      $('#sl' + index + '-2')
        .removeClass('btn-primary btn-info btn-success')
        .addClass('btn-success')
      $('#sl' + index + '-1')
        .removeClass('btn-primary btn-success')
        .addClass('btn-primary')
      $('#sl' + index + '-0')
        .removeClass('btn-primary btn-success')
        .addClass('btn-primary')
    }
    // Check the temporal layer
    if (temporal === 0) {
      console.success('Capped simulcast temporal layer! (lowest FPS)', null, { timeOut: 2000 })
      $('#tl' + index + '-2')
        .removeClass('btn-primary btn-success')
        .addClass('btn-primary')
      $('#tl' + index + '-1')
        .removeClass('btn-primary btn-success')
        .addClass('btn-primary')
      $('#tl' + index + '-0')
        .removeClass('btn-primary btn-info btn-success')
        .addClass('btn-success')
    } else if (temporal === 1) {
      console.success('Capped simulcast temporal layer! (medium FPS)', null, { timeOut: 2000 })
      $('#tl' + index + '-2')
        .removeClass('btn-primary btn-success')
        .addClass('btn-primary')
      $('#tl' + index + '-1')
        .removeClass('btn-primary btn-info btn-success')
        .addClass('btn-success')
      $('#tl' + index + '-0')
        .removeClass('btn-primary btn-success')
        .addClass('btn-primary')
    } else if (temporal === 2) {
      console.success('Capped simulcast temporal layer! (highest FPS)', null, { timeOut: 2000 })
      $('#tl' + index + '-2')
        .removeClass('btn-primary btn-info btn-success')
        .addClass('btn-success')
      $('#tl' + index + '-1')
        .removeClass('btn-primary btn-success')
        .addClass('btn-primary')
      $('#tl' + index + '-0')
        .removeClass('btn-primary btn-success')
        .addClass('btn-primary')
    }
  }
 */
