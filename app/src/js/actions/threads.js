export function hydrateThreads(threads) {
  return {
    type: 'THREADS',
    payload: threads,
  }
}

export function createThread(channelId, thread) {
  return {
    type: 'CREATE_THREADS',
    payload: {
      channelId,
      thread,
    },
    sync: channelId,
  }
}

export function updateThread(channelId, thread) {
  return {
    type: 'UPDATE_THREADS',
    payload: {
      channelId,
      thread,
    },
    sync: channelId,
  }
}
