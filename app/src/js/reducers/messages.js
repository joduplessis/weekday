import '../helpers/extensions'
import { getChannelIdFromUrl } from '../helpers/util'
import produce from 'immer'
import { MIME_TYPES } from '../constants'

const initialState = []

export default (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case 'MESSAGES':
        return action.payload.messages

      case 'CREATE_MESSAGES':
        const channelId = getChannelIdFromUrl()

        // Make sure to add a new message to the current channel only
        if (!channelId || channelId != action.payload.channelId) return

        // Othewise add it
        return [...state, action.payload.message]

      case 'UPDATE_MESSAGES':
        // Update the normal message
        // First check if there is messages
        return state.map((message, _) => {
          // If it's the correct message
          if (message.id == action.payload.messageId) {
            return {
              ...message,
              ...action.payload.message,
            }
          }

          // If it's the parent (replied to) message
          if (message.parent) {
            if (message.parent.id == action.payload.messageId) {
              return {
                ...message,
                parent: {
                  ...message.parent,
                  ...action.payload.message,
                },
              }
            }
          }

          // Otherwise default
          return message
        })

      case 'DELETE_MESSAGES':
        return state.filter(message => message.id != action.payload.messageId)

      case 'CREATE_MESSAGES_REACTION':
        return state.map((message, _) => {
          if (message.id == action.payload.messageId) {
            return {
              ...message,
              reactions: [...message.reactions, action.payload.reaction],
            }
          } else {
            return message
          }
        })

      case 'DELETE_MESSAGES_REACTION':
        return state.map((message, _) => {
          if (message.id == action.payload.messageId) {
            return {
              ...message,
              reactions: message.reactions.filter(reaction => reaction != action.payload.reaction),
            }
          } else {
            return message
          }
        })

      case 'CREATE_MESSAGES_LIKE':
        return state.map((message, _) => {
          if (message.id == action.payload.messageId) {
            return {
              ...message,
              likes: [...message.likes, action.payload.userId],
            }
          } else {
            return message
          }
        })

      case 'DELETE_MESSAGES_LIKE':
        return state.map((message, _) => {
          if (message.id == action.payload.messageId) {
            return {
              ...message,
              likes: message.likes.filter(like => like != action.payload.userId),
            }
          } else {
            return message
          }
        })

      // This is only used for main message thread
      // So not present in message.reducer

      case 'UPDATE_MESSAGES_TASK_ATTACHMENT':
        return state.map(message => {
          const attachments = message.attachments ? message.attachments : []

          return {
            ...message,
            attachments: attachments.map(attachment => {
              // Find the right task & update the meta info
              if (attachment.mime == MIME_TYPES.TASK) {
                if (attachment.uri == action.payload.taskId) {
                  return {
                    ...attachment,
                    meta: action.payload.task,
                  }
                }
              }

              return attachment
            }),
          }
        })
        break

      case 'DELETE_MESSAGES_TASK_ATTACHMENT':
        return state.map(message => {
          return {
            ...message,
            attachments: message.attachments.filter(attachment => {
              // Filter the right task
              if (attachment.mime == MIME_TYPES.TASK) {
                if (attachment.uri == action.payload.taskId) {
                  return false
                }
              }

              return true
            }),
          }
        })

      // This is sent from the API
      // So there is no action creator method for this

      case 'V1_UPLOAD_MESSAGE_ATTACHMENT_PREVIEW':
        return state.map((message, _) => {
          if (message.id == action.payload.messageId) {
            return {
              ...message,

              // We need to use the _id because attachments is a schema-only of message
              // Not a child object - the "id" accessor only gets added to Models
              // Usually this is fine - but we need the _id of the child object here to
              // know which attachment to update the preview of
              attachments: message.attachments.map(attachment => {
                if (attachment._id == action.payload.attachmentId) {
                  return {
                    ...attachment,
                    preview: action.payload.preview,
                  }
                } else {
                  return attachment
                }
              }),
            }
          } else {
            return message
          }
        })

      // Here we manage the child message counter
      // When the message is threaded

      case 'CREATE_MESSAGE_MESSAGES':
        return state.map(message => {
          if (message.id != action.payload.message.parent.id) return message

          return {
            ...message,
            childMessageCount: message.childMessageCount + 1,
          }
        })

      case 'DELETE_MESSAGE_MESSAGES':
        return state.map(message => {
          if (message.id != action.payload.parentMessageId) return message

          return {
            ...message,
            childMessageCount: message.childMessageCount - 1,
          }
        })
    }
  })
