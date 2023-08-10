import produce from 'immer'
import { browserHistory } from '../services/browser-history.service'

const initialState = []

export default (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case 'THREADS':
        return [...action.payload.sort((a, b) => b.updatedAt - a.updatedAt)]

      case 'UPDATE_THREADS':
        return state
          .map(thread => {
            if (thread.id != action.payload.thread.id) return thread

            return {
              ...thread,
              ...action.payload.thread,
            }
          })
          .sort((a, b) => b.updatedAt - a.updatedAt)

      // If someone is replying to a thread, then update the updatedAt
      // This will get ste in the API as well
      // CREATE_MESSAGE_MESSAGES != CREATE_MESSAGES
      // CREATE_MESSAGE_MESSAGES = thread message actions
      case 'CREATE_MESSAGE_MESSAGES':
        let createChannelMessageMessages = state

        if (!!action.payload.message.parent) {
          createChannelMessageMessages = createChannelMessageMessages.map(message => {
            if (message.id != action.payload.message.parent.id) return message
            return { ...message, updatedAt: new Date().getTime() }
          })
        }

        return createChannelMessageMessages

      case 'CREATE_THREADS':
        // If the channelId is not in the URL
        // then don't do anything
        // This is a bit of a hack - but quickly check whether the channelID
        // is the one the user is currently
        if (!window) return
        if (!window.location) return
        if (!window.location.href) return
        if (!window.location.href.split) return
        if (window.location.href.split('/').indexOf(action.payload.channelId) == -1) return

        return [action.payload.thread, ...state]
    }
  })
