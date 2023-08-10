import produce from 'immer'

const initialState = {
  id: null,
  starred: [],
  archived: [],
  muted: [],
}

export default (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case 'USER':
        return action.payload
        break

      case 'UPDATE_USER':
        return {
          ...state,
          ...action.payload,
        }
        break

      case 'UPDATE_USER_MUTED':
        draft.muted = action.payload.muted
          ? [...state.muted, action.payload.channelId]
          : state.muted.filter(channelId => channelId != action.payload.channelId)
        break

      case 'UPDATE_USER_ARCHIVED':
        draft.archived = action.payload.archived
          ? [...state.archived, action.payload.channelId]
          : state.archived.filter(channelId => channelId != action.payload.channelId)
        break

      case 'UPDATE_USER_STARRED':
        draft.starred = action.payload.starred
          ? [...state.starred, action.payload.channelId]
          : state.starred.filter(channelId => channelId != action.payload.channelId)
        break
    }
  })
