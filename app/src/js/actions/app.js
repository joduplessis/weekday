export function openApp(appAction) {
  return (dispatch, getState) => {
    switch (appAction.type) {
      case 'webhook':
        let url
        const { user } = getState()

        // If a user has submitted a command
        // then this will be attached to the webhook, panel or modal
        // appAction.token = channel token
        if (appAction.payload.url.indexOf('?') == -1) {
          url = `${appAction.payload.url}?token=${appAction.token}&userId=${user.id}`
        } else {
          url = `${appAction.payload.url}&token=${appAction.token}&userId=${user.id}`
        }

        fetch(url, {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json',
          },
          redirect: 'follow',
          referrer: 'no-referrer',
          body: JSON.stringify(appAction),
        })
        break

      case 'modal':
        dispatch({
          type: 'APP_MODAL',
          payload: appAction,
        })
        break

      case 'panel':
        dispatch({
          type: 'APP_PANEL',
          payload: appAction,
        })
        break
    }
  }
}

export function closeAppModal() {
  return {
    type: 'APP_MODAL',
    payload: null,
  }
}

export function closeAppPanel() {
  return {
    type: 'APP_PANEL',
    payload: null,
  }
}
