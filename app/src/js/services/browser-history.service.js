import { createBrowserHistory, createHashHistory } from 'history'
import { HASH_HISTORY } from '../environment'

export const browserHistory = HASH_HISTORY ? createHashHistory() : createBrowserHistory()
