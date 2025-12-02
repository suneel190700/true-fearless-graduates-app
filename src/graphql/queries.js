/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      email
      full_name
      skills
      interests
      availability_hours
      role
      profilePic
      groups {
        nextToken
        __typename
      }
      messages {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        email
        full_name
        skills
        interests
        availability_hours
        role
        profilePic
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getGroup = /* GraphQL */ `
  query GetGroup($id: ID!) {
    getGroup(id: $id) {
      id
      title
      description
      created_by
      members {
        nextToken
        __typename
      }
      messages {
        nextToken
        __typename
      }
      tasks {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listGroups = /* GraphQL */ `
  query ListGroups(
    $filter: ModelGroupFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listGroups(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        description
        created_by
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getGroupMember = /* GraphQL */ `
  query GetGroupMember($id: ID!) {
    getGroupMember(id: $id) {
      id
      groupID
      userID
      group {
        id
        title
        description
        created_by
        createdAt
        updatedAt
        __typename
      }
      user {
        id
        email
        full_name
        skills
        interests
        availability_hours
        role
        profilePic
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listGroupMembers = /* GraphQL */ `
  query ListGroupMembers(
    $filter: ModelGroupMemberFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listGroupMembers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        groupID
        userID
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getMessage = /* GraphQL */ `
  query GetMessage($id: ID!) {
    getMessage(id: $id) {
      id
      content
      attachmentUrl
      fileName
      fileType
      groupID
      userID
      group {
        id
        title
        description
        created_by
        createdAt
        updatedAt
        __typename
      }
      user {
        id
        email
        full_name
        skills
        interests
        availability_hours
        role
        profilePic
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listMessages = /* GraphQL */ `
  query ListMessages(
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMessages(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        content
        attachmentUrl
        fileName
        fileType
        groupID
        userID
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getTask = /* GraphQL */ `
  query GetTask($id: ID!) {
    getTask(id: $id) {
      id
      title
      description
      status
      groupID
      group {
        id
        title
        description
        created_by
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listTasks = /* GraphQL */ `
  query ListTasks(
    $filter: ModelTaskFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTasks(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        description
        status
        groupID
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const groupMembersByGroupID = /* GraphQL */ `
  query GroupMembersByGroupID(
    $groupID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelGroupMemberFilterInput
    $limit: Int
    $nextToken: String
  ) {
    groupMembersByGroupID(
      groupID: $groupID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        groupID
        userID
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const groupMembersByUserID = /* GraphQL */ `
  query GroupMembersByUserID(
    $userID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelGroupMemberFilterInput
    $limit: Int
    $nextToken: String
  ) {
    groupMembersByUserID(
      userID: $userID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        groupID
        userID
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const messagesByGroupID = /* GraphQL */ `
  query MessagesByGroupID(
    $groupID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messagesByGroupID(
      groupID: $groupID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        content
        attachmentUrl
        fileName
        fileType
        groupID
        userID
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const messagesByUserID = /* GraphQL */ `
  query MessagesByUserID(
    $userID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messagesByUserID(
      userID: $userID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        content
        attachmentUrl
        fileName
        fileType
        groupID
        userID
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const tasksByGroupID = /* GraphQL */ `
  query TasksByGroupID(
    $groupID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelTaskFilterInput
    $limit: Int
    $nextToken: String
  ) {
    tasksByGroupID(
      groupID: $groupID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        title
        description
        status
        groupID
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
