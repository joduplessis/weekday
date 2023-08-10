export function hydrateMeet(meet) {
  return {
    type: 'MEET',
    payload: meet,
  }
}

export function hydrateMeetMessages(messages) {
  return {
    type: 'MEET_MESSAGES',
    payload: { messages },
  }
}

export function updateMeetAddMessage(meetId, message, channelId) {
  return {
    type: 'UPDATE_MEET_ADD_MESSAGE',
    payload: { message, meetId },
    sync: channelId,
  }
}
