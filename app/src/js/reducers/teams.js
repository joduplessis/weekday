import produce from 'immer'

const initialState = []

export default (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case 'TEAMS':
        return action.payload

      case 'DELETE_TEAM':
        return state.filter(team => team.id != action.payload.teamId)
        break

      case 'CREATE_TEAM':
        draft.push(action.payload)
        break

      case 'UPDATE_TEAM':
        return state.map(team => {
          if (team.id != action.payload.teamId) return team

          return {
            ...team,
            ...action.payload,
          }
        })
        break
    }
  })
