import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { Router, Route, Link } from 'react-router-dom'
import { browserHistory } from './services/browser-history.service'
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { API_HOST, PUBLIC_VAPID_KEY, NODE_ENV, SENTRY_DSN } from './environment'
import { SILENCE, WEEKDAY_DRAGGED_TASK_ID } from './constants'
import { sync } from './middleware/sync'
import AuthPage from './pages/auth.page'
import TeamPage from './pages/team.page'
import AppPage from './pages/app.page'
import ChannelPage from './pages/channel.page'
import AuthService from './services/auth.service'
import common from './reducers/common'
import team from './reducers/team'
import task from './reducers/task'
import tasks from './reducers/tasks'
import threads from './reducers/threads'
import teams from './reducers/teams'
import meet from './reducers/meet'
import channel from './reducers/channel'
import message from './reducers/message'
import messages from './reducers/messages'
import channelNotifications from './reducers/channelNotifications'
import channelUnreads from './reducers/channelUnreads'
import app from './reducers/app'
import channels from './reducers/channels'
import user from './reducers/user'
import notifications from './reducers/notifications'
import { createLogger } from 'redux-logger'
import moment from 'moment'
import Zero from '@joduplessis/zero'
import AccountService from './services/account.service'
import * as Sentry from '@sentry/browser'

// Globally available setups
// Temporarily disable this for now ⚠️
// import '../styles/fonts.css'
import '../styles/index.css'
import './environment'
import './helpers/extensions'
import '../../node_modules/emoji-mart/css/emoji-mart.css'
import 'react-day-picker/lib/style.css'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'

// When we want to debug and nog have other logging pollute the console
// Set this to true - also affects util.js in the logger method
window[SILENCE] = NODE_ENV == 'production'

// Set up Sentry
if (NODE_ENV == 'production') Sentry.init({ dsn: SENTRY_DSN })

// Register our account service - only 1 for now
// See usage in account.modal
Zero.container().inject('AccountService', AccountService)

// Redux logger
const logger = createLogger({
  collapsed: true,
})

// Check for dev
const middleWare =
  NODE_ENV == 'development' && !window.SILENCE ? applyMiddleware(thunk, sync, logger) : applyMiddleware(thunk, sync)

// Redux with our middlewares
const store = createStore(
  combineReducers({
    common,
    task,
    tasks,
    team,
    teams,
    threads,
    channel,
    channels,
    notifications,
    user,
    app,
    message,
    messages,
    meet,
    channelNotifications,
    channelUnreads,
  }),
  middleWare
)

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}>
      {/* Check if user is logged in */}
      {/* Direct to the right place */}
      <Route
        path="/"
        render={props => {
          const { pathname } = props.history.location
          const isElectron = pathname.split('/')[pathname.split('/').length - 1] == 'index.html'
          const isRoot = pathname == '/'

          // See if we're at the root so we only do 1 redirect
          if (isElectron || isRoot) {
            AuthService.currentAuthenticatedUser()
              .then(res => {
                const { token } = res
                const { sub } = AuthService.parseJwt(token)

                props.history.push('/app')
              })
              .catch(err => {
                props.history.push('/auth')
              })
          }
        }}
      />

      <Route path="/auth" component={AuthPage} />
      <Route path="/t/:slug" component={TeamPage} />
      <Route path="/c/:shortcode" component={ChannelPage} />
      <Route path="/app" component={AppPage} />
    </Router>
  </Provider>,
  document.getElementById('root')
)
