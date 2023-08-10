import produce from 'immer'
import { v4 as uuidv4 } from 'uuid'

const initialState = {
  id: null,
  messages: [],
}

export default (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case 'MEET':
        return action.payload

      case 'MEET_MESSAGES':
        return {
          ...state,
          messages: [...action.payload.messages, ...state.messages],
        }

      case 'UPDATE_MEET_ADD_MESSAGE':
        if (action.payload.meetId != state.id) return

        // Add the message here
        return {
          ...state,
          messages: [...state.messages, action.payload.message],
        }
    }
  })
