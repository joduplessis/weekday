import EventService from './event.service'
import { TOAST } from '../constants'

export default class ToastService {
  ee = null

  static show(message) {
    EventService.getInstance().emit(TOAST, message)
  }
}
