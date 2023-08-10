import { STRIPE_KEY, PRICE_KEY } from './environment'
import * as moment from 'moment'

export const MIME_TYPES = {
  MEET: 'weekday/meet',
  TASK: 'weekday/task',
}
export const QUANTITY = 3
export const LAYOUTS = {
  SIDE: 'SIDE',
  MAIN: 'MAIN',
  FULL: 'FULL,',
}
export const DND_OPTIONS = [
  { option: 'Never', value: 0 },
  { option: '1 hour', value: 1 },
  { option: '8 hours', value: 8 },
  { option: '12 hours', value: 12 },
  { option: '24 hours', value: 24 },
]
export const MEMBER_PAGE_LIMIT = 10
export const IS_CORDOVA = window.hasOwnProperty('cordova')
export const DEVICE = window.hasOwnProperty('device') ? device.cordova.toUpperCase() : 'WEB'
export const IS_MOBILE =
  window.innerWidth <= 760 ||
  (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
    navigator.userAgent
  ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      navigator.userAgent.substr(0, 4)
    ))
export const TASK_ORDER_INDEX = 'TASK_ORDER_INDEX'
export const TASKS_ORDER = 'TASKS_ORDER'
export const CHANNELS_ORDER = 'CHANNELS_ORDER'
export const CHANNEL_ORDER_INDEX = 'CHANNEL_ORDER_INDEX'
export const TOGGLE_CHANNELS_DRAWER = 'TOGGLE_CHANNELS_DRAWER'
export const TASK_DRAGSTART_RESET_CHEVRON = 'TASK_DRAGSTART_RESET_CHEVRON'
export const PRESENCES = 'PRESENCES'
export const SILENCE = 'SILENCE'
export const WEEKDAY_DRAGGED_TASK_ID = 'WEEKDAY_DRAGGED_TASK_ID'
export const WEEKDAY_DRAGGED_SECTION_ID = 'WEEKDAY_DRAGGED_SECTION_ID'
export const NAVIGATE = 'NAVIGATE'
export const ONTOP = 'ONTOP'
export const OVER = 'OVER'
export const UNDER = 'UNDER'
export const STRIPE = STRIPE_KEY
export const PRICE = PRICE_KEY
export const SORT = {
  DATE: 'DATE',
  NONE: 'NONE',
}
export const FUTURE_DATE_UNIX_TIME = moment()
  .add(1, 'years')
  .toDate()
  .getTime()
export const MOMENT_TODAY = moment()

export const TEXT_VERY_FADED_WHITE = 'rgba(255, 255, 255, 0.1)'
export const TEXT_FADED_WHITE = 'rgba(255, 255, 255, 0.3)'
export const TEXT_OFF_WHITE = 'rgba(255, 255, 255, 0.8)'
export const BACKGROUND_FADED_BLACK = 'rgba(0, 0, 0, 0.075)'
export const SHOW_COMPLETED_TASKS = 'SHOW_COMPLETED_TASKS'
export const CHANNEL_NOTIFICATIONS = {
  MESSAGES: 'MESSAGES',
  NONE: 'NONE',
  MENTIONS: 'MENTIONS',
}
export const CREATE_MESSAGES = 'CREATE_MESSAGES'
export const CREATE_MESSAGE_MESSAGE = 'CREATE_MESSAGE_MESSAGE'
export const SYNC = 'SYNC'
export const JOIN_CHANNEL = 'JOIN_CHANNEL'
export const JOIN_TEAM = 'JOIN_TEAM'
export const LEAVE_CHANNEL = 'LEAVE_CHANNEL'
export const LEAVE_TEAM = 'LEAVE_TEAM'
export const JOIN_PUBLIC_CHANNEL = 'JOIN_PUBLIC_CHANNEL'
export const LEAVE_CHANNEL_IF_NOT_MEMBER = 'LEAVE_CHANNEL_IF_NOT_MEMBER'
export const UPDATE_PRESENCE = 'UPDATE_PRESENCE'
export const DEFAULT_PRESENCE = 'online'
export const DISPATCH_APP_ACTION = 'DISPATCH_APP_ACTION'
export const APP_ACTION_EVENTS = {
  MODAL_OPEN: 'modal',
  MODAL_CLOSE: 'modal-close',
  PANEL_OPEN: 'panel',
  PANEL_CLOSE: 'panel-close',
}
export const FOCUS_COMPOSE_INPUT = 'FOCUS_COMPOSE_INPUT'
export const USER_IS_TYPING = 'USER_IS_TYPING'
export const COLORS = [
  '#B9255F',
  '#DB4035',
  '#FF9933',
  '#FAD100',
  '#B0B73B',
  '#7FCC48',
  '#289438',
  '#6BCBBC',
  '#188FAD',
  '#16AAF5',
  '#98C3EA',
  '#4074FE',
  '#884EFF',
  '#B038EB',
  '#EB96EB',
  '#E15293',
  '#FE8C85',
  '#808080',
  '#B8B8B8',
]
export const CHANNEL_MESSAGE_REPLY = 'CHANNEL_MESSAGE_REPLY'
export const CHANNEL_MESSAGE_UPDATE = 'CHANNEL_MESSAGE_UPDATE'
export const SET_EDITOR_CONTENT = 'SET_EDITOR_CONTENT'
export const SYNC_MESSAGE_HEIGHT = 'SYNC_MESSAGE_HEIGHT'
export const TOAST = 'TOAST'
