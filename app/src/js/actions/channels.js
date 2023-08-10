export function hydrateChannels(channels) {
  return {
    type: 'CHANNELS',
    payload: channels,
  }
}
