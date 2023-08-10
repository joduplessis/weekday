export const typeDefs = `

  scalar Date

  type Query {
    user(userId: String!): User
    users(userIds: String!): [User]
    meets(searchCriteria: String!): [Meet]
    meet(meetId: String!): Meet
    meetMessages(meetId: String!, page: Float): [MeetMessage]
    tasks(searchCriteria: String!): [Task]
    task(taskId: String!): Task
    taskMessages(taskId: String!, page: Float): [TaskMessage]
    team(teamId: String!, userId: String): Team
    teamMembers(teamId: String!, page: Float): [TeamMember]
    teamSlug(slug: String): Team
    teams(userId: String!): [Team]
    channelUnreads(teamId: String!, userId: String!): [ChannelUnread]
    channelShortcode(shortcode: String): Channel
    channel(channelId: String!): Channel
    channelTasks(channelId: String!): [Task]
    channelTask(taskId: String!): Task
    channels(teamId: String, userId: String!): [Channel]
    channelMessageReads(messageId: String): [MessageRead]
    messageMessages(messageId: String!): [Message]
    channelMessages(channelId: String!, page: Float): [Message]
    threads(channelId: String): [Message]
    message(messageId: String!): Message
    channelMembers(channelId: String!, page: Float): [ChannelMember]
    isChannelMember(channelId: String!, userId: String!): Boolean
    isTeamMember(teamId: String!, userId: String!): Boolean
    channelAttachments(channelId: String!, page: Float): [Message]
    searchMessages(channelId: String, query: String): [Message]
    searchTeamMembers(teamId: String, query: String, page: Float): [TeamMember]
    searchChannelMembers(channelId: String, query: String, page: Float): [ChannelMember]
    notifications(userId: String, page: Float): [Notification]
  }

  type Mutation {
    updateUser(userId: String, payload: String): Boolean
    updateUserStarred(userId: String, channelId: String, starred: Boolean): Boolean
    updateUserArchived(userId: String, channelId: String, archived: Boolean): Boolean
    updateUserMuted(userId: String, channelId: String, muted: Boolean): Boolean
    createTeam(userId: String, userName: String, payload: String): Team
    updateTeam(teamId: String, payload: String): Boolean
    updateTeamSlug(teamId: String, slug: String): Boolean
    createChannelNotification(userId: String, channelId: String, every: String): ChannelNotification
    updateChannelNotification(channelNotificationId: String, every: String): Boolean
    deleteChannelNotification(channelNotificationId: String): Boolean
    updateTeamShortcode(teamId: String, shortcode: String): Boolean
    deleteTeam(teamId: String): Boolean
    joinTeam(slug: String, userId: String, shortcode: String): Boolean
    updateTeamMemberPosition(teamId: String, userId: String, position: String): Boolean
    updateTeamMemberRole(teamId: String, userId: String, role: String): Boolean
    inviteTeamMembers(teamId: String, emails: String): Boolean
    deleteTeamMember(teamId: String, userId: String): Boolean
    joinChannel(shortcode: String, userId: String): Boolean
    createChannel(payload: String): Channel
    deleteChannelSection(channelId: String, sectionId: String): Boolean
    createChannelSection(channelId: String, title: String, order: Float): ChannelSection
    updateChannelSection(channelId: String, sectionId: String, title: String, order: Float): Boolean
    updateChannelSections(channelId: String, sections: String): Boolean
    updateChannel(channelId: String, payload: String): Channel
    updateChannelShortcode(channelId: String, generateNewCode: Boolean): String
    deleteChannel(channelId: String, teamId: String): Boolean
    deleteChannelUnread(userId: String, channelId: String, parentId: String, threaded: Boolean): Boolean
    createChannelMember(channelId: String, teamId: String, member: String): Boolean
    deleteChannelMember(channelId: String, userId: String, memberId: String): Boolean
    createChannelMessage(payload: String): Message
    updateChannelMessage(messageId: String, payload: String): Message
    deleteChannelMessage(messageId: String): Boolean
    createChannelMessageReaction(messageId: String, reaction: String): Boolean
    deleteChannelMessageReaction(messageId: String, reaction: String): Boolean
    createChannelMessageLike(messageId: String, userId: String): Boolean
    deleteChannelMessageLike(messageId: String, userId: String): Boolean
    updateNotificationRead(notificationId: String, read: Boolean): Boolean
    createChannelMessageRead(messageId: String, userId: String, channelId: String, teamId: String): Boolean
    updateChannelMessageRead(messageId: String): Boolean
    createTaskMessage(taskId: String, body: String, userId: String, files: String): Boolean
    createTask(payload: String): Task
    updateTask(taskId: String, payload: String): Boolean
    deleteTask(taskId: String): Boolean
    createMeetMessage(meetId: String, body: String, userId: String, files: String): Boolean
    createMeet(payload: String): Meet
    updateMeet(meetId: String, payload: String): Boolean
    deleteMeet(meetId: String): Boolean
  }

  # Schema
  type AppActionPayload {
    url: String
    width: String
    height: String
  }

  # Schema
  type AppAction {
    type: String
    name: String
    payload: AppActionPayload
  }

  # Schema
  type AppCommand {
    name: String
    description: String
    action: AppAction
  }

  # Schema
  type AppButton {
    icon: String
    text: String
    action: AppAction
  }

  # Schema
  type AppMessage {
    url: String
    width: String
    height: String
    buttons: [AppButton]
  }

  # Model
  type App {
    id: String
    name: String
    slug: String
    description: String
    image: String
    token: String
    featured: Boolean
    support: String
    categories: [String]
    published: Boolean
    visibility: String
    verified: Boolean
    team: Team
    user: User
    outgoing: String
    commands: [AppCommand]
    attachments: [AppButton]
    tools: [AppButton]
    shortcuts:  [AppButton]
    message: AppMessage
    createdAt: Date
    updatedAt: Date
  }

  # Model
  type Notification {
    _id: String!
    id: String
    title: String
    body: String
    read: Boolean
    user: User
    channel: Channel,
    team: Team,
    createdAt: Date
    updatedAt: Date
  }

  # Schema
  type Attachment {
    _id: String!
    id: String
    name: String
    uri: String
    preview: String
    mime: String
    size: Float
    createdAt: Date
    updatedAt: Date
  }

  # Schema
  # token = channel token
  # resourceId = remote / app resource ID
  # app = appstore app ID
  type MessageApp {
    _id: String!
    id: String
    app: App
    resourceId: String
    token: String
  }

  # Model
  type Message {
    _id: String!
    id: String
    channel: Channel
    parent: Message
    device: String
    app: MessageApp
    user: User
    reads: Float
    read: Boolean
    forwardingUser: User
    forwardingOriginalTime: Date
    team: User
    system: Boolean
    thread: Boolean
    threaded: Boolean
    pinned: Boolean
    childMessageCount: Float
    attachments: [Attachment]
    hasAttachments: Boolean
    body: String
    reactions: [String]
    likes: [String]
    createdAt: Date
    updatedAt: Date
  }

  # Model
  type Team {
    _id: String!
    id: String
    name: String
    shortcode: String
    slug: String
    description: String
    image: String
    customer: String
    subscription: String
    current_period_start: Date
    current_period_end: Date
    quantity: Float
    active: Boolean
    totalMembers: Float
    channels(userId: String): [Channel]
    role(userId: String): String
    position(userId: String): String
    createdAt: Date
    updatedAt: Date
  }

  # Model
  type TeamMember {
    _id: String!
    id: String
    user: User
    name: String
    username: String
    position: String
    role: String
    deleted: Boolean
  }

  # Model
  type Channel {
    _id: String!
    id: String
    image: String
    url: String
    name: String
    shortcode: String
    color: String
    icon: String
    description: String
    sections: [ChannelSection]
    tasks: [Task]
    excerpt: String
    public: Boolean
    readonly: Boolean
    private: Boolean
    isMember: Boolean
    totalMembers: Float
    members: [ChannelMemberMember]
    user: User
    team: Team
    messages: [Message]
    pinnedMessages: [Message]
    apps: [ChannelApp]
    createdAt: Date
    updatedAt: Date
  }

  # Schema
  type ChannelSection {
    _id: String!
    id: String
    title: String
    order: Float
    createdAt: Date
    updatedAt: Date
  }

  # This isn't in any resolver or schema - we just need to define some structure
  # Because we return plain old JSON from an aggregate Mongo function
  # ----------------------------------------------------------------------------
  type ChannelMemberMember {
    id: String
    user: ChannelMemberUser
  }

  # This isn't in any resolver or schema - we just need to define some structure
  # Because we return plain old JSON from an aggregate Mongo function
  # ----------------------------------------------------------------------------
  type ChannelMemberUser {
    id: String
    name: String
    image: String
    username: String
    timezone: String
    status: String
    presence: String
  }

  # Schema
  type ChannelApp {
    _id: String!
    id: String
    app: App
    active: Boolean
    token: String
  }

  # Model
  type ChannelMember {
    _id: String!
    id: String
    user: User
    name: String
    username: String
    channel: Channel
    team: Team
    role: String
    deleted: Boolean
    private: Boolean
  }

  # Model
  type ChannelUnread {
    _id: String!
    id: String
    user: User
    parent: Message
    parentId: String
    message: Message
    messageId: String
    channel: Channel
    channelId: String
    team: Team
    mention: Boolean
    threaded: Boolean
  }

  # Model
  type ChannelNotification {
    _id: String!
    id: String
    user: User
    channel: Channel
    channelId: String
    every: String
  }

  # Schema
  type UserEmail {
    address: String
    confirmed: Boolean
    confirm: String
  }

  # Schema
  type UserDevice {
    token: String
    type: String
  }

  # Model
  type User {
    _id: String!
    id: String
    username: String
    emails: [UserEmail]
    channelNotifications: [ChannelNotification]
    password: String
    status: String
    presence: String
    dnd: Float
    dndUntil: Date
    forgotten_password: String
    name: String
    theme: String
    timezone: String
    description: String
    image: String
    muted: [String]
    archived: [String]
    starred: [String]
    devices: [UserDevice]
    deleted: Boolean
    createdAt: Date
    updatedAt: Date
  }

  # Model
  type Task {
    _id: String!
    id: String
    parentId: String
    sectionId: String
    title: String
    description: String
    order: Float
    subtaskCount: Float
    done: Boolean
    user: User
    parent: Task
    team: Team
    channel: Channel
    messages: [TaskMessage],
    tasks: [Task]
    dueDate: Date
    createdAt: Date
    updatedAt: Date
  }

  # Schema
  type TaskMessageFile {
    _id: String!
    id: String
    url: String
    filename: String
    createdAt: Date
    updatedAt: Date
  }

  # Model
  type TaskMessage {
    _id: String!
    id: String
    body: String
    user: User
    task: Task
    files: [TaskMessageFile],
    createdAt: Date
    updatedAt: Date
  }

  # Model
  type Meet {
    _id: String!
    id: String
    token: String
    topic: String
    roomId: String
    location: String
    active: Boolean
    channel: Channel
    team: Team
    messages: [MeetMessage],
    createdAt: Date
    updatedAt: Date
  }

  # Schema
  type MeetMessageFile {
    _id: String!
    id: String
    url: String
    filename: String
    createdAt: Date
    updatedAt: Date
  }

  # Model
  type MeetMessage {
    _id: String!
    id: String
    body: String
    user: User
    meet: Meet
    files: [MeetMessageFile],
    createdAt: Date
    updatedAt: Date
  }

  # Model
  type MessageRead {
    _id: String!
    id: String
    user: User
    team: Team
    channel: Channel
    message: Message
    createdAt: Date
    updatedAt: Date
  }
`
