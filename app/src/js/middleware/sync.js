import MessagingService from '../services/messaging.service'

export const sync = store => next => action => {
  // So we can delete teh sync
  let mutableAction = action

  // Store it seperately - so that we don't send along every time
  const sync = mutableAction.sync || null

  // Delete it so it doesn't loop
  delete mutableAction.sync

  // This sends this action to the sync channel in SO
  // So everybody that is subscribed to that channel
  // will receive this action
  // Every sync will NOT dispatch the action locally
  if (sync) return MessagingService.getInstance().sync(sync, mutableAction)

  // Move along
  return next(action)
}
