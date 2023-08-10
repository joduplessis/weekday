import produce from 'immer'

const initialState = []

export default (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case 'CHANNEL_UNREADS':
        return action.payload

      case 'CHANNEL_CREATE_UNREAD':
        draft.push(action.payload)
        break

      case 'CHANNEL_DELETE_UNREAD':
        return state.filter(unread => {
          const { channelId, parentId, threaded } = action.payload
          let matched = false

          if (parentId) {
            matched = channelId == unread.channelId && parentId == unread.parentId && threaded == unread.threaded
          } else {
            matched = channelId == unread.channelId && threaded == unread.threaded
          }

          // Exclude the matched results
          return !matched
        })
    }
  })
