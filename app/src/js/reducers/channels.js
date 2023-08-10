import produce from 'immer'

const initialState = []

export default (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case 'CHANNELS':
        return action.payload

      case 'UPDATE_CHANNEL_USER_NAME_IMAGE':
        return state.map(channel => {
          // Only do private channels
          // Because there will be 2 members
          if (!channel.private) return channel
          if (!channel.members) return channel
          if (!channel.members.length) return channel

          return {
            ...channel,
            members: channel.members.map(member => {
              return {
                ...member,
                user: {
                  ...member.user,
                  name: action.payload.name,
                  image: action.payload.image,
                },
              }
            }),
          }
        })

      case 'UPDATE_CHANNEL':
        return state.map(channel => {
          if (channel.id != action.payload.channelId) return channel

          return {
            ...channel,
            ...action.payload,
          }
        })

      case 'DELETE_CHANNEL':
        return state.filter(channel => channel.id != action.payload.channelId)

      case 'CREATE_CHANNEL':
        draft.push(action.payload)
        break

      case 'CREATE_CHANNEL_MEMBER':
        return state.map(channel => {
          if (channel.id != action.payload.channelId) return channel

          return {
            ...channel,
            members: [...channel.members, action.payload.member],
          }
        })
        break

      case 'DELETE_CHANNEL_MEMBER':
        return state.map(channel => {
          if (channel.id != action.payload.channelId) return channel

          return {
            ...channel,
            members: channel.members.filter(member => member.id != action.payload.memberId),
          }
        })
        break
    }
  })
