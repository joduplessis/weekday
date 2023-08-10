import produce from 'immer'

const initialState = []

export default (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case 'ADD_NOTIFICATION':
        draft.push(action.payload)
        break

      case 'NOTIFICATIONS':
        draft.push(...action.payload)
        break

      case 'UPDATE_NOTIFICATION_READ':
        return state.map(notification => {
          if (notification.id != action.payload.notificationId) return notification

          return {
            ...notification,
            read: action.payload.read,
          }
        })
        break
    }
  })
