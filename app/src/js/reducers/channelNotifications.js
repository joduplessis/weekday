import produce from 'immer'

const initialState = []

export default (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case 'CHANNEL_NOTIFICATIONS':
        return action.payload

      case 'CREATE_CHANNEL_NOTIFICATION':
        draft.push(action.payload)
        break

      case 'UPDATE_CHANNEL_NOTIFICATION':
        return state.map(channelNotification => {
          if (channelNotification.id != action.payload.channelNotificationId) return channelNotification
          return { ...channelNotification, every: action.payload.every }
        })

      case 'DELETE_CHANNEL_NOTIFICATION':
        return state.filter(channelNotification => channelNotification.id != action.payload.channelNotificationId)
    }
  })
