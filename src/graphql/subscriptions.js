/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser($filter: ModelSubscriptionUserFilterInput) {
    onCreateUser(filter: $filter) {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser($filter: ModelSubscriptionUserFilterInput) {
    onUpdateUser(filter: $filter) {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser($filter: ModelSubscriptionUserFilterInput) {
    onDeleteUser(filter: $filter) {
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
export const onCreateGroup = /* GraphQL */ `
  subscription OnCreateGroup($filter: ModelSubscriptionGroupFilterInput) {
    onCreateGroup(filter: $filter) {
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
export const onUpdateGroup = /* GraphQL */ `
  subscription OnUpdateGroup($filter: ModelSubscriptionGroupFilterInput) {
    onUpdateGroup(filter: $filter) {
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
export const onDeleteGroup = /* GraphQL */ `
  subscription OnDeleteGroup($filter: ModelSubscriptionGroupFilterInput) {
    onDeleteGroup(filter: $filter) {
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
export const onCreateGroupMember = /* GraphQL */ `
  subscription OnCreateGroupMember(
    $filter: ModelSubscriptionGroupMemberFilterInput
  ) {
    onCreateGroupMember(filter: $filter) {
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
export const onUpdateGroupMember = /* GraphQL */ `
  subscription OnUpdateGroupMember(
    $filter: ModelSubscriptionGroupMemberFilterInput
  ) {
    onUpdateGroupMember(filter: $filter) {
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
export const onDeleteGroupMember = /* GraphQL */ `
  subscription OnDeleteGroupMember(
    $filter: ModelSubscriptionGroupMemberFilterInput
  ) {
    onDeleteGroupMember(filter: $filter) {
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
export const onCreateMessage = /* GraphQL */ `
  subscription OnCreateMessage($filter: ModelSubscriptionMessageFilterInput) {
    onCreateMessage(filter: $filter) {
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
export const onUpdateMessage = /* GraphQL */ `
  subscription OnUpdateMessage($filter: ModelSubscriptionMessageFilterInput) {
    onUpdateMessage(filter: $filter) {
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
export const onDeleteMessage = /* GraphQL */ `
  subscription OnDeleteMessage($filter: ModelSubscriptionMessageFilterInput) {
    onDeleteMessage(filter: $filter) {
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
export const onCreateTask = /* GraphQL */ `
  subscription OnCreateTask($filter: ModelSubscriptionTaskFilterInput) {
    onCreateTask(filter: $filter) {
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
export const onUpdateTask = /* GraphQL */ `
  subscription OnUpdateTask($filter: ModelSubscriptionTaskFilterInput) {
    onUpdateTask(filter: $filter) {
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
export const onDeleteTask = /* GraphQL */ `
  subscription OnDeleteTask($filter: ModelSubscriptionTaskFilterInput) {
    onDeleteTask(filter: $filter) {
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
