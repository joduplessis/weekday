import produce from 'immer'
import { MIME_TYPES } from '../constants'

export const initialState = {
  id: '',
  name: '',
  description: '',
  image: '',
  public: false,
  private: false,
  readonly: false,
  isMember: false,
  totalMembers: 0,
  messages: [],
  pinnedMessages: [],
  members: [],
  apps: [],
  user: {},
  team: {},
  calls: [],
  sections: [],
  tasks: [],
}

export default (state = initialState, action) =>
  produce(state, draft => {
    if (action.type == 'CHANNEL') return action.payload

    // Only if these are valid
    // We only process messages that are for the current channel
    if (!action.payload) return
    if (!action.payload.channelId) return
    if (state.id != action.payload.channelId) return

    // These are actions that get dispatched against the laoded channel
    // They come from the user or the SocketIO server
    switch (action.type) {
      case 'CHANNEL':
        return action.payload

      case 'UPDATE_CHANNEL':
        draft = Object.assign(draft, action.payload)
        break

      case 'UPDATE_CHANNEL_CREATE_MESSAGE_PIN':
        draft.pinnedMessages = [action.payload.channelMessage, ...state.pinnedMessages]
        break

      case 'UPDATE_CHANNEL_DELETE_MESSAGE_PIN':
        draft.pinnedMessages = state.pinnedMessages.filter(
          pinnedMessage => pinnedMessage.id != action.payload.messageId
        )
        break

      case 'UPDATE_CHANNEL_UPDATE_MESSAGE_PIN':
        draft.pinnedMessages = state.pinnedMessages.map(pinnedMessage => {
          if (pinnedMessage.id != action.payload.channelMessage.messageId) return pinnedMessage
          if (pinnedMessage.id == action.payload.channelMessage.messageId) {
            return {
              ...pinnedMessage,
              ...action.payload.channelMessage.message,
            }
          }
        })
        break

      case 'CREATE_CHANNEL_SECTION':
        draft.sections = [...state.sections, action.payload.section]
        break

      case 'UPDATE_CHANNEL_SECTIONS':
        draft.sections = action.payload.sections
        break

      case 'UPDATE_CHANNEL_SECTION':
        // Update the normal section
        draft.sections = state.sections.map((section, _) => {
          // If it's the correct section
          if (section.id == action.payload.section.id) {
            return {
              ...section,
              ...action.payload.section,
            }
          } else {
            return section
          }
        })
        break

      case 'DELETE_CHANNEL_SECTION':
        draft.sections = state.sections.filter(section => section.id != action.payload.sectionId)
        break

      case 'CREATE_CHANNEL_MEMBER':
        draft.members = [...state.members, action.payload.member]
        break

      case 'DELETE_CHANNEL_MEMBER':
        draft.members = state.members.filter(member => member.id != action.payload.memberId)
        break

      case 'DECREASE_CHANNEL_TOTAL_MEMBERS':
        draft.totalMembers = state.totalMembers - 1
        break

      case 'INCREASE_CHANNEL_TOTAL_MEMBERS':
        draft.totalMembers = state.totalMembers + 1
        break

      case 'UPDATE_CHANNEL_USER_NAME_IMAGE':
        // Only do private channels
        // Because there will be 2 members
        if (!state.private) return state
        if (!state.members) return state
        if (!state.members.length) return state

        return {
          ...state,
          members: state.members.map(member => {
            return {
              ...member,
              user: {
                ...member.user,
                name: action.payload.name,
                image: action.payload.image,
              },
            }
          }),
        }

      // These are sent from appstore.route
      // -----------------------------------

      case 'CREATE_CHANNEL_APP':
        draft.apps = [...state.apps, action.payload.app]
        break

      case 'DELETE_CHANNEL_APP':
        // Delete app
        draft.apps = state.apps.filter(app => app.app.id != action.payload.appId)

        // Delete messages
        draft.messages = state.messages.filter(message => {
          if (message.app) {
            return message.app.app.id != action.payload.appId
          } else {
            return true
          }
        })
        break

      case 'UPDATE_CHANNEL_APP_APP':
        draft.apps = state.apps.map((app, _) => {
          if (app.app.id == action.payload.appId) {
            return {
              ...app,
              app: {
                ...action.payload.app,
              },
            }
          } else {
            return app
          }
        })
        break

      case 'UPDATE_CHANNEL_APP_ACTIVE':
        draft.apps = state.apps.map((app, _) => {
          if (app.app.id == action.payload.appId) {
            return {
              ...app,
              active: action.payload.active,
            }
          } else {
            return app
          }
        })
        break

      // These are sent from app.route --> need to be migrated to messages ⚠️
      // -----------------------------------

      case 'UPDATE_CHANNEL_APP_MESSAGES_WITH_RESOURCE_ID':
        draft.messages = state.messages.map((message, _) => {
          if (action.payload.messageIds.indexOf(message.id) != -1) {
            // This is the base of the new message object
            // attachments/message will always be there
            let updatedMessage = message

            // Because these aren\t guaranteed
            if (action.payload.message.body) updatedMessage.body = action.payload.message.body
            if (action.payload.message.attachments) updatedMessage.attachments = action.payload.message.attachments

            // If there is an app - there should be
            // Just change the RESOURCE ID (not app.app object)
            if (updatedMessage.app) {
              if (action.payload.message.app) {
                updatedMessage.app.resourceId = action.payload.message.app.resourceId
              }
            }

            // Now return the new updated message
            return updatedMessage
          } else {
            return message
          }
        })
        break

      case 'DELETE_CHANNEL_APP_MESSAGES_WITH_RESOURCE_ID':
        draft.messages = state.messages.filter(message => {
          const { resourceId } = action.payload

          // const messageIdPresentWithmessageIds = messageIds.indexOf(message.id) != -1
          // Remove it if it's there
          // return !messageIdPresentWithmessageIds
          return message.app ? message.app.resourceId != resourceId : true
        })
        break
    }
  })
