import produce from 'immer'

const initialState = {
  modal: null,
  panel: null,
}

export default (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case 'APP_MODAL':
        draft.modal = action.payload
        break

      case 'APP_PANEL':
        draft.panel = action.payload
        break
    }
  })
