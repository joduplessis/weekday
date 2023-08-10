import ApolloClient from 'apollo-client'
import { createHttpLink, HttpLink } from 'apollo-link-http'
import { ApolloLink, concat } from 'apollo-link'
import gql from 'graphql-tag'
import { InMemoryCache } from 'apollo-cache-inmemory'
import AuthService from './auth.service'
import StorageService from './storage.service'
import { API_HOST, JWT } from '../environment'
import { logger } from '../helpers/util'

export default class GraphqlService {
  static instance
  client

  constructor() {
    const defaultOptions = {
      watchQuery: {
        fetchPolicy: 'network-only',
        errorPolicy: 'ignore',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
    }

    const token = StorageService.getStorage(JWT)
    const authMiddleware = new ApolloLink((operation, forward) => {
      operation.setContext({
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      return forward(operation)
    })

    this.client = new ApolloClient({
      cache: new InMemoryCache(),
      defaultOptions: defaultOptions,
      link: concat(
        authMiddleware,
        createHttpLink({
          fetch: fetch,
          uri: API_HOST + '/graphql',
          onError: ({ networkError, graphQLErrors }) => {
            logger('graphql.service', 'graphQLErrors', graphQLErrors)
            logger('graphql.service', 'networkError', networkError)
          },
        })
      ),
    })
  }

  static getInstance() {
    if (this.instance) return this.instance

    this.instance = new GraphqlService()

    return this.instance
  }

  static signout() {
    this.instance = null
  }

  /**
   * Queries
   */

  user(userId) {
    logger('graphql.service', 'user')
    return this.client.query({
      query: gql`
        query user($userId: String!) {
          user(userId: $userId) {
            id
            emails {
              address
              confirmed
            }
            channelNotifications {
              id
              channelId
              every
            }
            username
            timezone
            password
            name
            theme
            starred
            muted
            archived
            description
            status
            presence
            dnd
            dndUntil
            timezone
            image
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        userId,
      },
    })
  }

  users(userIds) {
    logger('graphql.service', 'users')
    return this.client.query({
      query: gql`
        query users($userIds: String!) {
          users(userIds: $userIds) {
            id
            name
            image
          }
        }
      `,
      variables: {
        userIds,
      },
    })
  }

  teamSlug(slug) {
    logger('graphql.service', 'teamSlug')
    return this.client.query({
      query: gql`
        query teamSlug($slug: String) {
          teamSlug(slug: $slug) {
            id
            name
            description
            image
            customer
            current_period_start
            current_period_end
            quantity
            customer
            active
          }
        }
      `,
      variables: {
        slug,
      },
    })
  }

  teamChannelsComponent(teamId, userId) {
    logger('graphql.service', 'teamChannelsComponent')
    return this.client.query({
      query: gql`
        query team($teamId: String!, $userId: String) {
          team(teamId: $teamId, userId: $userId) {
            id
            name
            shortcode
            position(userId: $userId)
            role(userId: $userId)
            slug
            image
            channels(userId: $userId) {
              id
              name
              image
              public
              color
              icon
              excerpt
              private
              readonly
              members {
                id
                user {
                  id
                  name
                  username
                  timezone
                  image
                  status
                  presence
                }
              }
            }
          }
        }
      `,
      variables: {
        teamId,
        userId,
      },
    })
  }

  team(teamId, userId) {
    logger('graphql.service', 'team')
    return this.client.query({
      query: gql`
        query team($teamId: String!, $userId: String) {
          team(teamId: $teamId, userId: $userId) {
            id
            name
            shortcode
            slug
            totalMembers
            description
            image
            customer
            current_period_start
            current_period_end
            quantity
            customer
            active
            role(userId: $userId)
            position(userId: $userId)
            channels(userId: $userId) {
              id
              name
              description
              url
              image
              public
              color
              icon
              readonly
              excerpt
              private
              members {
                id
                user {
                  id
                  name
                  username
                  timezone
                  image
                  status
                  presence
                }
              }
              createdAt
              updatedAt
            }
          }
        }
      `,
      variables: {
        teamId,
        userId,
      },
    })
  }

  teamMembers(teamId, page) {
    logger('graphql.service', 'teamMembers')
    return this.client.query({
      query: gql`
        query teamMembers($teamId: String!, $page: Float) {
          teamMembers(teamId: $teamId, page: $page) {
            id
            role
            position
            user {
              id
              name
              emails {
                address
                confirmed
              }
              username
              timezone
              image
            }
          }
        }
      `,
      variables: {
        teamId,
        page,
      },
    })
  }

  isTeamMember(teamId, userId) {
    logger('graphql.service', 'isTeamMember')
    return this.client.query({
      query: gql`
        query isTeamMember($teamId: String!, $userId: String!) {
          isTeamMember(teamId: $teamId, userId: $userId)
        }
      `,
      variables: {
        teamId,
        userId,
      },
    })
  }

  teams(userId) {
    logger('graphql.service', 'teams')
    return this.client.query({
      query: gql`
        query teams($userId: String!) {
          teams(userId: $userId) {
            id
            name
            description
            image
            role(userId: $userId)
          }
        }
      `,
      variables: {
        userId,
      },
    })
  }

  channelShortcode(shortcode) {
    logger('graphql.service', 'channelShortcode')
    return this.client.query({
      query: gql`
        query channelShortcode($shortcode: String) {
          channelShortcode(shortcode: $shortcode) {
            id
            name
            description
            team {
              id
              name
              image
            }
          }
        }
      `,
      variables: {
        shortcode,
      },
    })
  }

  // ⚠️
  channel(channelId) {
    logger('graphql.service', 'channel')
    return this.client.query({
      query: gql`
        query channel($channelId: String!) {
          channel(channelId: $channelId) {
            id
            name
            url
            description
            sections {
              id
              order
              title
              createdAt
            }
            image
            public
            private
            color
            icon
            readonly
            shortcode
            isMember
            totalMembers
            members {
              id
              user {
                id
                name
                username
                timezone
                image
                status
                presence
              }
            }
            user {
              id
              name
              username
              timezone
              image
            }
            team {
              id
              name
              image
            }
            apps {
              active
              token
              app {
                id
                name
                slug
                description
                image
                token
                published
                outgoing
                commands {
                  name
                  description
                  action {
                    type
                    name
                    payload {
                      url
                      width
                      height
                    }
                  }
                }
                attachments {
                  icon
                  text
                  action {
                    type
                    name
                    payload {
                      url
                      width
                      height
                    }
                  }
                }
                tools {
                  icon
                  text
                  action {
                    type
                    name
                    payload {
                      url
                      width
                      height
                    }
                  }
                }
                shortcuts {
                  icon
                  text
                  action {
                    type
                    name
                    payload {
                      url
                      width
                      height
                    }
                  }
                }
                message {
                  url
                  width
                  height
                  buttons {
                    icon
                    text
                    action {
                      type
                      name
                      payload {
                        url
                        width
                        height
                      }
                    }
                  }
                }
              }
            }
            pinnedMessages {
              id
              reactions
              device
              read
              reads
              thread
              threaded
              likes
              childMessageCount
              system
              parent {
                id
                thread
                threaded
                channel {
                  name
                  id
                }
                user {
                  id
                  name
                  image
                  username
                  timezone
                }
                app {
                  resourceId
                  app {
                    id
                    name
                    image
                  }
                }
                body
                createdAt
              }
              user {
                id
                username
                timezone
                presence
                name
                image
              }
              body
              createdAt
              app {
                resourceId
                app {
                  id
                  name
                  slug
                  description
                  image
                }
              }
            }
            messages {
              id
              reactions
              device
              read
              reads
              pinned
              likes
              thread
              threaded
              childMessageCount
              system
              forwardingOriginalTime
              forwardingUser {
                id
                name
                username
                timezone
                image
              }
              parent {
                id
                thread
                threaded
                childMessageCount
                channel {
                  name
                  id
                }
                user {
                  id
                  name
                  image
                  username
                  timezone
                }
                app {
                  resourceId
                  app {
                    id
                    name
                    image
                  }
                }
                body
                createdAt
              }
              user {
                id
                username
                timezone
                presence
                name
                image
              }
              body
              attachments {
                _id
                id
                size
                uri
                preview
                mime
                name
                createdAt
              }
              createdAt
              app {
                resourceId
                app {
                  id
                  name
                  slug
                  description
                  image
                  token
                  published
                  outgoing
                  message {
                    url
                    width
                    height
                    buttons {
                      icon
                      text
                      action {
                        type
                        name
                        payload {
                          url
                          width
                          height
                        }
                      }
                    }
                  }
                }
              }
            }
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        channelId,
      },
    })
  }

  channelTasks(channelId) {
    logger('graphql.service', 'channelTasks')
    return this.client.query({
      query: gql`
        query channelTasks($channelId: String!) {
          channelTasks(channelId: $channelId) {
            id
            title
            order
            done
          }
        }
      `,
      variables: {
        channelId,
      },
    })
  }

  // This gets called when shating a task to a channel
  // Based on the message's meta data
  channelTask(taskId) {
    logger('graphql.service', 'channelTask')
    return this.client.query({
      query: gql`
        query channelTask($taskId: String!) {
          channelTask(taskId: $taskId) {
            id
            title
            order
            done
            description
          }
        }
      `,
      variables: {
        taskId,
      },
    })
  }

  channelUnreads(teamId, userId) {
    logger('graphql.service', 'channelUnreads')
    return this.client.query({
      query: gql`
        query channelUnreads($teamId: String!, $userId: String!) {
          channelUnreads(teamId: $teamId, userId: $userId) {
            mention
            channelId
            parentId
            messageId
            threaded
          }
        }
      `,
      variables: {
        teamId,
        userId,
      },
    })
  }

  channelMembers(channelId, page) {
    logger('graphql.service', 'channelMembers')
    return this.client.query({
      query: gql`
        query channelMembers($channelId: String!, $page: Float) {
          channelMembers(channelId: $channelId, page: $page) {
            id
            user {
              id
              name
              emails {
                address
                confirmed
              }
              username
              timezone
              image
            }
          }
        }
      `,
      variables: {
        channelId,
        page,
      },
    })
  }

  isChannelMember(channelId, userId) {
    logger('graphql.service', 'isChannelMember')
    return this.client.query({
      query: gql`
        query isChannelMember($channelId: String!, $userId: String!) {
          isChannelMember(channelId: $channelId, userId: $userId)
        }
      `,
      variables: {
        channelId,
        userId,
      },
    })
  }

  channels(teamId, userId) {
    logger('graphql.service', 'channels')
    return this.client.query({
      query: gql`
        query channels($teamId: String, $userId: String!) {
          channels(teamId: $teamId, userId: $userId) {
            id
            name
            description
            readonly
            url
            image
            public
            color
            icon
            excerpt
            private
            members {
              id
              user {
                id
                name
                username
                timezone
                image
                status
                presence
              }
            }
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        teamId,
        userId,
      },
    })
  }

  channelMessageReads(messageId) {
    logger('graphql.service', 'channelMesssageReads')
    return this.client.query({
      query: gql`
        query channelMessageReads($messageId: String) {
          channelMessageReads(messageId: $messageId)
        }
      `,
      variables: {
        messageId,
      },
    })
  }

  // ⚠️
  messageMessages(messageId) {
    logger('graphql.service', 'messageMessages')
    return this.client.query({
      query: gql`
        query messageMessages($messageId: String!) {
          messageMessages(messageId: $messageId) {
            id
            reactions
            device
            read
            reads
            pinned
            likes
            system
            forwardingOriginalTime
            forwardingUser {
              id
              name
              username
              timezone
              image
            }
            user {
              id
              name
              image
              status
              presence
              dnd
              dndUntil
              username
              timezone
            }
            body
            attachments {
              _id
              id
              uri
              size
              name
              preview
              mime
              createdAt
            }
            createdAt
            app {
              resourceId
              app {
                id
                name
                slug
                description
                image
                token
                published
                outgoing
                message {
                  url
                  width
                  height
                  buttons {
                    icon
                    text
                    action {
                      type
                      name
                      payload {
                        url
                        width
                        height
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        messageId,
      },
    })
  }

  // ⚠️
  message(messageId) {
    logger('graphql.service', 'message')
    return this.client.query({
      query: gql`
        query message($messageId: String!) {
          message(messageId: $messageId) {
            id
            reactions
            device
            read
            reads
            pinned
            likes
            childMessageCount
            thread
            threaded
            system
            parent {
              id
              thread
              threaded
              channel {
                name
                id
              }
              user {
                id
                name
                image
                username
                timezone
              }
              app {
                resourceId
                app {
                  id
                  name
                  image
                }
              }
              body
              createdAt
            }
            forwardingOriginalTime
            forwardingUser {
              id
              name
              username
              timezone
              image
            }
            user {
              id
              name
              image
              status
              presence
              dnd
              dndUntil
              username
              timezone
            }
            body
            attachments {
              _id
              id
              uri
              size
              name
              preview
              mime
              createdAt
            }
            createdAt
            app {
              resourceId
              app {
                id
                name
                slug
                description
                image
                token
                published
                outgoing
                message {
                  url
                  width
                  height
                  buttons {
                    icon
                    text
                    action {
                      type
                      name
                      payload {
                        url
                        width
                        height
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        messageId,
      },
    })
  }

  // ⚠️
  channelMessages(channelId, page) {
    logger('graphql.service', 'channelMessages')
    return this.client.query({
      query: gql`
        query channelMessages($channelId: String!, $page: Float) {
          channelMessages(channelId: $channelId, page: $page) {
            id
            reactions
            device
            read
            reads
            pinned
            likes
            thread
            threaded
            childMessageCount
            system
            parent {
              id
              thread
              threaded
              channel {
                name
                id
              }
              user {
                id
                name
                image
                username
                timezone
              }
              app {
                resourceId
                app {
                  id
                  name
                  image
                }
              }
              body
              createdAt
            }
            forwardingOriginalTime
            forwardingUser {
              id
              name
              username
              timezone
              image
            }
            user {
              id
              name
              image
              status
              presence
              dnd
              dndUntil
              username
              timezone
            }
            body
            attachments {
              _id
              id
              uri
              size
              name
              preview
              mime
              createdAt
            }
            createdAt
            app {
              resourceId
              app {
                id
                name
                slug
                description
                image
                token
                published
                outgoing
                message {
                  url
                  width
                  height
                  buttons {
                    icon
                    text
                    action {
                      type
                      name
                      payload {
                        url
                        width
                        height
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        channelId,
        page,
      },
    })
  }

  threads(channelId) {
    logger('graphql.service', 'threads')
    return this.client.query({
      query: gql`
        query threads($channelId: String!) {
          threads(channelId: $channelId) {
            id
            body
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        channelId,
      },
    })
  }

  channelAttachments(channelId, page) {
    logger('graphql.service', 'channelAttachments')
    return this.client.query({
      query: gql`
        query channelAttachments($channelId: String!, $page: Float) {
          channelAttachments(channelId: $channelId, page: $page) {
            id
            reactions
            device
            likes
            thread
            threaded
            childMessageCount
            system
            parent {
              user {
                id
                name
                image
                username
                timezone
                status
                presence
              }
              body
              createdAt
            }
            user {
              id
              name
              image
              status
              presence
              dnd
              dndUntil
              username
              timezone
            }
            body
            attachments {
              _id
              id
              uri
              size
              name
              preview
              mime
              createdAt
            }
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        channelId,
        page,
      },
    })
  }

  // ⚠️
  searchMessages(channelId, query) {
    logger('graphql.service', 'searchMessages')
    return this.client.query({
      query: gql`
        query searchMessages($channelId: String, $query: String) {
          searchMessages(channelId: $channelId, query: $query) {
            id
            reactions
            device
            read
            pinned
            likes
            childMessageCount
            thread
            threaded
            system
            parent {
              thread
              threaded
              channel {
                id
                name
              }
              user {
                id
                name
                image
                username
                timezone
                status
                presence
              }
              body
              createdAt
            }
            user {
              id
              name
              image
              status
              presence
              username
              timezone
            }
            body
            attachments {
              _id
              id
              uri
              size
              name
              preview
              mime
              createdAt
            }
            app {
              resourceId
              app {
                id
                name
                slug
                description
                image
                token
                published
                outgoing
                message {
                  url
                  width
                  height
                  buttons {
                    icon
                    text
                    action {
                      type
                      name
                      payload {
                        url
                        width
                        height
                      }
                    }
                  }
                }
              }
            }
            createdAt
          }
        }
      `,
      variables: {
        channelId,
        query,
      },
    })
  }

  searchChannelMembers(channelId, query, page) {
    logger('graphql.service', 'searchChannelMembers')
    return this.client.query({
      query: gql`
        query searchChannelMembers($channelId: String, $query: String, $page: Float) {
          searchChannelMembers(channelId: $channelId, query: $query, page: $page) {
            id
            role
            user {
              id
              name
              image
              username
              timezone
            }
          }
        }
      `,
      variables: {
        channelId,
        query,
        page,
      },
    })
  }

  searchTeamMembers(teamId, query, page) {
    logger('graphql.service', 'searchTeamMembers')
    return this.client.query({
      query: gql`
        query searchTeamMembers($teamId: String, $query: String, $page: Float) {
          searchTeamMembers(teamId: $teamId, query: $query, page: $page) {
            id
            role
            user {
              id
              name
              image
              username
              timezone
            }
          }
        }
      `,
      variables: {
        teamId,
        query,
        page,
      },
    })
  }

  notifications(userId, page) {
    logger('graphql.service', 'notifications')
    return this.client.query({
      query: gql`
        query notifications($userId: String, $page: Float) {
          notifications(userId: $userId, page: $page) {
            id
            title
            body
            team {
              image
              name
              id
            }
            channel {
              image
              name
              id
            }
            read
            createdAt
          }
        }
      `,
      variables: {
        userId,
        page,
      },
    })
  }

  tasks(searchCriteria) {
    logger('graphql.service', 'tasks')
    return this.client.query({
      query: gql`
        query tasks($searchCriteria: String!) {
          tasks(searchCriteria: $searchCriteria) {
            id
            title
            description
            order
            done
            dueDate
            parentId
            sectionId
            subtaskCount
            channel {
              id
              name
              color
            }
            user {
              id
              name
              username
              timezone
              image
              status
              presence
            }
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        searchCriteria: JSON.stringify(searchCriteria),
      },
    })
  }

  task(taskId) {
    logger('graphql.service', 'task')
    return this.client.query({
      query: gql`
        query task($taskId: String!) {
          task(taskId: $taskId) {
            id
            title
            order
            description
            done
            dueDate
            parentId
            sectionId
            parent {
              id
              title
            }
            tasks {
              id
              title
              order
              description
              done
              dueDate
              parentId
              subtaskCount
              user {
                id
                name
                username
                timezone
                image
                status
                presence
              }
            }
            messages {
              id
              body
              files {
                id
                url
                filename
              }
              user {
                id
                name
                image
              }
              createdAt
            }
            channel {
              id
              name
            }
            user {
              id
              name
              username
              timezone
              image
              status
              presence
            }
          }
        }
      `,
      variables: {
        taskId,
      },
    })
  }

  taskMessages(taskId, page) {
    logger('graphql.service', 'taskMessages')
    return this.client.query({
      query: gql`
        query taskMessages($taskId: String!, $page: Float) {
          taskMessages(taskId: $taskId, page: $page) {
            id
            body
            files {
              id
              url
              filename
            }
            user {
              id
              name
              image
            }
            createdAt
          }
        }
      `,
      variables: {
        taskId,
        page,
      },
    })
  }

  meets(searchCriteria) {
    logger('graphql.service', 'meets')
    return this.client.query({
      query: gql`
        query meets($searchCriteria: String!) {
          meets(searchCriteria: $searchCriteria) {
            id
            topic
            roomId
            location
            active
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        searchCriteria: JSON.stringify(searchCriteria),
      },
    })
  }

  meet(meetId) {
    logger('graphql.service', 'meet')
    return this.client.query({
      query: gql`
        query meet($meetId: String!) {
          meet(meetId: $meetId) {
            id
            token
            topic
            roomId
            location
            active
            messages {
              id
              body
              files {
                id
                url
                filename
              }
              user {
                id
                name
                image
              }
              createdAt
            }
          }
        }
      `,
      variables: {
        meetId,
      },
    })
  }

  meetMessages(meetId, page) {
    logger('graphql.service', 'meetMessages')
    return this.client.query({
      query: gql`
        query meetMessages($meetId: String!, $page: Float) {
          meetMessages(meetId: $meetId, page: $page) {
            id
            body
            files {
              id
              url
              filename
            }
            user {
              id
              name
              image
            }
            createdAt
          }
        }
      `,
      variables: {
        meetId,
        page,
      },
    })
  }

  /**
   * Mutations
   */

  joinChannel(shortcode, userId) {
    return this.client.mutate({
      mutation: gql`
        mutation joinChannel($shortcode: String, $userId: String) {
          joinChannel(shortcode: $shortcode, userId: $userId)
        }
      `,
      variables: {
        shortcode,
        userId,
      },
    })
  }

  joinTeam(slug, userId, shortcode) {
    return this.client.mutate({
      mutation: gql`
        mutation joinTeam($slug: String, $userId: String, $shortcode: String) {
          joinTeam(slug: $slug, userId: $userId, shortcode: $shortcode)
        }
      `,
      variables: {
        slug,
        userId,
        shortcode,
      },
    })
  }

  updateNotificationRead(notificationId, read) {
    return this.client.mutate({
      mutation: gql`
        mutation updateNotificationRead($notificationId: String, $read: Boolean) {
          updateNotificationRead(notificationId: $notificationId, read: $read)
        }
      `,
      variables: {
        notificationId,
        read,
      },
    })
  }

  updateUser(userId, payload) {
    return this.client.mutate({
      mutation: gql`
        mutation updateUser($userId: String, $payload: String) {
          updateUser(userId: $userId, payload: $payload)
        }
      `,
      variables: {
        userId,
        payload: JSON.stringify(payload),
      },
    })
  }

  createChannelNotification(userId, channelId, every) {
    return this.client.mutate({
      mutation: gql`
        mutation createChannelNotification($userId: String, $channelId: String, $every: String) {
          createChannelNotification(userId: $userId, channelId: $channelId, every: $every) {
            id
            every
            channelId
          }
        }
      `,
      variables: {
        userId,
        channelId,
        every,
      },
    })
  }

  updateChannelNotification(channelNotificationId, every) {
    return this.client.mutate({
      mutation: gql`
        mutation updateChannelNotification($channelNotificationId: String, $every: String) {
          updateChannelNotification(channelNotificationId: $channelNotificationId, every: $every)
        }
      `,
      variables: {
        channelNotificationId,
        every,
      },
    })
  }

  deleteChannelNotification(channelNotificationId) {
    return this.client.mutate({
      mutation: gql`
        mutation deleteChannelNotification($channelNotificationId: String) {
          deleteChannelNotification(channelNotificationId: $channelNotificationId)
        }
      `,
      variables: {
        channelNotificationId,
      },
    })
  }

  updateUserMuted(userId, channelId, muted) {
    return this.client.mutate({
      mutation: gql`
        mutation updateUserMuted($userId: String, $channelId: String, $muted: Boolean) {
          updateUserMuted(userId: $userId, channelId: $channelId, muted: $muted)
        }
      `,
      variables: {
        userId,
        channelId,
        muted,
      },
    })
  }

  updateUserArchived(userId, channelId, archived) {
    return this.client.mutate({
      mutation: gql`
        mutation updateUserArchived($userId: String, $channelId: String, $archived: Boolean) {
          updateUserArchived(userId: $userId, channelId: $channelId, archived: $archived)
        }
      `,
      variables: {
        userId,
        channelId,
        archived,
      },
    })
  }

  updateUserStarred(userId, channelId, starred) {
    return this.client.mutate({
      mutation: gql`
        mutation updateUserStarred($userId: String, $channelId: String, $starred: Boolean) {
          updateUserStarred(userId: $userId, channelId: $channelId, starred: $starred)
        }
      `,
      variables: {
        userId,
        channelId,
        starred,
      },
    })
  }

  createTeam(userId, userName, payload) {
    return this.client.mutate({
      mutation: gql`
        mutation createTeam($userId: String, $userName: String, $payload: String) {
          createTeam(userId: $userId, userName: $userName, payload: $payload) {
            id
            name
            slug
            shortcode
            image
          }
        }
      `,
      variables: {
        userId,
        userName,
        payload: JSON.stringify(payload),
      },
    })
  }

  updateTeamShortcode(teamId, shortcode) {
    return this.client.mutate({
      mutation: gql`
        mutation updateTeamShortcode($teamId: String, $shortcode: String) {
          updateTeamShortcode(teamId: $teamId, shortcode: $shortcode)
        }
      `,
      variables: {
        teamId,
        shortcode,
      },
    })
  }

  updateTeamSlug(teamId, slug) {
    return this.client.mutate({
      mutation: gql`
        mutation updateTeamSlug($teamId: String, $slug: String) {
          updateTeamSlug(teamId: $teamId, slug: $slug)
        }
      `,
      variables: {
        teamId,
        slug,
      },
    })
  }

  updateTeam(teamId, payload) {
    return this.client.mutate({
      mutation: gql`
        mutation updateTeam($teamId: String, $payload: String) {
          updateTeam(teamId: $teamId, payload: $payload)
        }
      `,
      variables: {
        teamId,
        payload: JSON.stringify(payload),
      },
    })
  }

  deleteTeam(teamId) {
    return this.client.mutate({
      mutation: gql`
        mutation deleteTeam($teamId: String) {
          deleteTeam(teamId: $teamId)
        }
      `,
      variables: {
        teamId,
      },
    })
  }

  updateTeamMemberPosition(teamId, userId, position) {
    return this.client.mutate({
      mutation: gql`
        mutation updateTeamMemberPosition($teamId: String, $userId: String, $position: String) {
          updateTeamMemberPosition(teamId: $teamId, userId: $userId, position: $position)
        }
      `,
      variables: {
        teamId,
        userId,
        position,
      },
    })
  }

  updateTeamMemberRole(teamId, userId, role) {
    return this.client.mutate({
      mutation: gql`
        mutation updateTeamMemberRole($teamId: String, $userId: String, $role: String) {
          updateTeamMemberRole(teamId: $teamId, userId: $userId, role: $role)
        }
      `,
      variables: {
        teamId,
        userId,
        role,
      },
    })
  }

  inviteTeamMembers(teamId, emails) {
    return this.client.mutate({
      mutation: gql`
        mutation inviteTeamMembers($teamId: String, $emails: String) {
          inviteTeamMembers(teamId: $teamId, emails: $emails)
        }
      `,
      variables: {
        teamId,
        emails,
      },
    })
  }

  deleteTeamMember(teamId, userId) {
    return this.client.mutate({
      mutation: gql`
        mutation deleteTeamMember($teamId: String, $userId: String) {
          deleteTeamMember(teamId: $teamId, userId: $userId)
        }
      `,
      variables: {
        teamId,
        userId,
      },
    })
  }

  createChannel(payload) {
    return this.client.mutate({
      mutation: gql`
        mutation createChannel($payload: String) {
          createChannel(payload: $payload) {
            id
            name
            description
            color
            icon
            createdAt
            public
            private
            members {
              id
              user {
                id
                name
                username
                timezone
                image
                status
                presence
              }
            }
          }
        }
      `,
      variables: {
        payload: JSON.stringify(payload),
      },
    })
  }

  updateChannel(channelId, payload) {
    return this.client.mutate({
      mutation: gql`
        mutation updateChannel($channelId: String, $payload: String) {
          updateChannel(channelId: $channelId, payload: $payload) {
            id
            name
            description
            createdAt
            public
            color
            icon
            private
            team {
              id
              name
              image
            }
          }
        }
      `,
      variables: {
        channelId,
        payload: JSON.stringify(payload),
      },
    })
  }

  deleteChannel(channelId, teamId) {
    return this.client.mutate({
      mutation: gql`
        mutation deleteChannel($channelId: String, $teamId: String) {
          deleteChannel(channelId: $channelId, teamId: $teamId)
        }
      `,
      variables: {
        channelId,
        teamId,
      },
    })
  }

  createChannelSection(channelId, title, order) {
    return this.client.mutate({
      mutation: gql`
        mutation createChannelSection($channelId: String, $title: String, $order: Float) {
          createChannelSection(channelId: $channelId, title: $title, order: $order) {
            id
            title
            order
          }
        }
      `,
      variables: {
        channelId,
        title,
        order,
      },
    })
  }

  updateChannelSection(channelId, sectionId, title, order) {
    return this.client.mutate({
      mutation: gql`
        mutation updateChannelSection($channelId: String, $sectionId: String, $title: String, $order: Float) {
          updateChannelSection(channelId: $channelId, sectionId: $sectionId, title: $title, order: $order)
        }
      `,
      variables: {
        channelId,
        sectionId,
        title,
        order,
      },
    })
  }

  updateChannelSections(channelId, sections) {
    return this.client.mutate({
      mutation: gql`
        mutation updateChannelSections($channelId: String, $sections: String) {
          updateChannelSections(channelId: $channelId, sections: $sections)
        }
      `,
      variables: {
        channelId,
        sections: JSON.stringify(sections),
      },
    })
  }

  deleteChannelSection(channelId, sectionId) {
    return this.client.mutate({
      mutation: gql`
        mutation deleteChannelSection($channelId: String, $sectionId: String) {
          deleteChannelSection(channelId: $channelId, sectionId: $sectionId)
        }
      `,
      variables: {
        channelId,
        sectionId,
      },
    })
  }

  updateChannelShortcode(channelId, generateNewCode) {
    return this.client.mutate({
      mutation: gql`
        mutation updateChannelShortcode($channelId: String, $generateNewCode: Boolean) {
          updateChannelShortcode(channelId: $channelId, generateNewCode: $generateNewCode)
        }
      `,
      variables: {
        channelId,
        generateNewCode,
      },
    })
  }

  deleteChannelUnread(userId, channelId, parentId, threaded) {
    return this.client.mutate({
      mutation: gql`
        mutation deleteChannelUnread($userId: String, $channelId: String, $parentId: String, $threaded: Boolean) {
          deleteChannelUnread(userId: $userId, channelId: $channelId, parentId: $parentId, threaded: $threaded)
        }
      `,
      variables: {
        channelId,
        userId,
        parentId,
        threaded,
      },
    })
  }

  createChannelMember(channelId, teamId, member) {
    return this.client.mutate({
      mutation: gql`
        mutation createChannelMember($channelId: String, $teamId: String, $member: String) {
          createChannelMember(channelId: $channelId, teamId: $teamId, member: $member)
        }
      `,
      variables: {
        teamId,
        channelId,
        member: JSON.stringify(member),
      },
    })
  }

  deleteChannelMessage(messageId) {
    return this.client.mutate({
      mutation: gql`
        mutation deleteChannelMessage($messageId: String) {
          deleteChannelMessage(messageId: $messageId)
        }
      `,
      variables: {
        messageId,
      },
    })
  }

  deleteChannelMember(channelId, userId, memberId) {
    return this.client.mutate({
      mutation: gql`
        mutation deleteChannelMember($channelId: String, $userId: String, $memberId: String) {
          deleteChannelMember(channelId: $channelId, userId: $userId, memberId: $memberId)
        }
      `,
      variables: {
        channelId,
        userId,
        memberId,
      },
    })
  }

  updateChannelMessage(messageId, payload) {
    return this.client.mutate({
      mutation: gql`
        mutation updateChannelMessage($messageId: String, $payload: String) {
          updateChannelMessage(messageId: $messageId, payload: $payload) {
            id
            user {
              id
              name
              image
              username
              timezone
            }
            body
            reactions
            device
            likes
            thread
            threaded
            childMessageCount
            attachments {
              _id
              id
              uri
              mime
              preview
              name
              createdAt
              size
            }
            system
            parent {
              id
              thread
              threaded
              user {
                id
                name
                image
                username
                timezone
              }
              body
              createdAt
            }
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        messageId,
        payload: JSON.stringify(payload),
      },
    })
  }

  createChannelMessage(payload) {
    return this.client.mutate({
      mutation: gql`
        mutation createChannelMessage($payload: String) {
          createChannelMessage(payload: $payload) {
            id
            user {
              id
              name
              image
              username
              timezone
            }
            body
            read
            reads
            reactions
            device
            thread
            threaded
            likes
            childMessageCount
            attachments {
              _id
              id
              uri
              mime
              preview
              name
              createdAt
              size
            }
            system
            parent {
              id
              thread
              threaded
              channel {
                name
                id
              }
              user {
                id
                name
                image
                username
                timezone
              }
              body
              createdAt
            }
            createdAt
          }
        }
      `,
      variables: {
        payload: JSON.stringify(payload),
      },
    })
  }

  createChannelMessageReaction(messageId, reaction) {
    return this.client.mutate({
      mutation: gql`
        mutation createChannelMessageReaction($messageId: String, $reaction: String) {
          createChannelMessageReaction(messageId: $messageId, reaction: $reaction)
        }
      `,
      variables: {
        messageId,
        reaction,
      },
    })
  }

  deleteChannelMessageReaction(messageId, reaction) {
    return this.client.mutate({
      mutation: gql`
        mutation deleteChannelMessageReaction($messageId: String, $reaction: String) {
          deleteChannelMessageReaction(messageId: $messageId, reaction: $reaction)
        }
      `,
      variables: {
        messageId,
        reaction,
      },
    })
  }

  createChannelMessageLike(messageId, userId) {
    return this.client.mutate({
      mutation: gql`
        mutation createChannelMessageLike($messageId: String, $userId: String) {
          createChannelMessageLike(messageId: $messageId, userId: $userId)
        }
      `,
      variables: {
        messageId,
        userId,
      },
    })
  }

  deleteChannelMessageLike(messageId, userId) {
    return this.client.mutate({
      mutation: gql`
        mutation deleteChannelMessageLike($messageId: String, $userId: String) {
          deleteChannelMessageLike(messageId: $messageId, userId: $userId)
        }
      `,
      variables: {
        messageId,
        userId,
      },
    })
  }

  updateChannelMessageRead(messageId) {
    return this.client.mutate({
      mutation: gql`
        mutation updateChannelMessageRead($messageId: String) {
          updateChannelMessageRead(messageId: $messageId)
        }
      `,
      variables: {
        messageId,
      },
    })
  }

  createChannelMessageRead(messageId, userId, channelId, teamId) {
    return this.client.mutate({
      mutation: gql`
        mutation createChannelMessageRead($messageId: String, $userId: String, $channelId: String, $teamId: String) {
          createChannelMessageRead(messageId: $messageId, userId: $userId, channelId: $channelId, teamId: $teamId)
        }
      `,
      variables: {
        messageId,
        userId,
        channelId,
        teamId,
      },
    })
  }

  createTaskMessage(taskId, body, userId, files) {
    return this.client.mutate({
      mutation: gql`
        mutation createTaskMessage($taskId: String, $body: String, $userId: String, $files: String) {
          createTaskMessage(taskId: $taskId, body: $body, userId: $userId, files: $files)
        }
      `,
      variables: {
        taskId,
        body,
        userId,
        files: JSON.stringify(files),
      },
    })
  }

  createTask(payload) {
    return this.client.mutate({
      mutation: gql`
        mutation createTask($payload: String) {
          createTask(payload: $payload) {
            id
            title
            order
            done
            parentId
            sectionId
            dueDate
            user {
              id
              name
              image
              username
            }
            team {
              id
              name
              image
            }
            channel {
              id
              name
              image
            }
          }
        }
      `,
      variables: {
        payload: JSON.stringify(payload),
      },
    })
  }

  updateTask(taskId, payload) {
    return this.client.mutate({
      mutation: gql`
        mutation updateTask($taskId: String, $payload: String) {
          updateTask(taskId: $taskId, payload: $payload)
        }
      `,
      variables: {
        taskId,
        payload: JSON.stringify(payload),
      },
    })
  }

  deleteTask(taskId) {
    return this.client.mutate({
      mutation: gql`
        mutation deleteTask($taskId: String) {
          deleteTask(taskId: $taskId)
        }
      `,
      variables: {
        taskId,
      },
    })
  }

  createMeetMessage(meetId, body, userId, files) {
    return this.client.mutate({
      mutation: gql`
        mutation createMeetMessage($meetId: String, $body: String, $userId: String, $files: String) {
          createMeetMessage(meetId: $meetId, body: $body, userId: $userId, files: $files)
        }
      `,
      variables: {
        meetId,
        body,
        userId,
        files: JSON.stringify(files),
      },
    })
  }

  createMeet(payload) {
    return this.client.mutate({
      mutation: gql`
        mutation createMeet($payload: String) {
          createMeet(payload: $payload) {
            id
            topic
            roomId
            location
            active
          }
        }
      `,
      variables: {
        payload: JSON.stringify(payload),
      },
    })
  }

  updateMeet(meetId, payload) {
    return this.client.mutate({
      mutation: gql`
        mutation updateMeet($meetId: String, $payload: String) {
          updateMeet(meetId: $meetId, payload: $payload)
        }
      `,
      variables: {
        meetId,
        payload: JSON.stringify(payload),
      },
    })
  }

  deleteMeet(meetId) {
    return this.client.mutate({
      mutation: gql`
        mutation deleteMeet($meetId: String) {
          deleteMeet(meetId: $meetId)
        }
      `,
      variables: {
        meetId,
      },
    })
  }
}
