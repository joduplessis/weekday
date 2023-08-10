import produce from 'immer'

const initialState = {
  members: [],
  channels: [
    {
      team: {},
      members: [],
    },
  ],
}

export default (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case 'TEAM':
        return action.payload

      case 'UPDATE_TEAM':
        if (action.payload.teamId != state.id) return
        draft = Object.assign(draft, action.payload)
        break

      case 'UPDATE_TEAM_MEMBER_ROLE':
        draft.role = action.payload.role
        break

      case 'UPDATE_TEAM_MEMBER_POSITION':
        draft.position = action.payload.position
        break
    }
  })
