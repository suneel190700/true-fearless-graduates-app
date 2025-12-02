/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
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
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
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
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
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
export const createGroup = /* GraphQL */ `
  mutation CreateGroup(
    $input: CreateGroupInput!
    $condition: ModelGroupConditionInput
  ) {
    createGroup(input: $input, condition: $condition) {
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
export const updateGroup = /* GraphQL */ `
  mutation UpdateGroup(
    $input: UpdateGroupInput!
    $condition: ModelGroupConditionInput
  ) {
    updateGroup(input: $input, condition: $condition) {
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
export const deleteGroup = /* GraphQL */ `
  mutation DeleteGroup(
    $input: DeleteGroupInput!
    $condition: ModelGroupConditionInput
  ) {
    deleteGroup(input: $input, condition: $condition) {
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
export const createGroupMember = /* GraphQL */ `
  mutation CreateGroupMember(
    $input: CreateGroupMemberInput!
    $condition: ModelGroupMemberConditionInput
  ) {
    createGroupMember(input: $input, condition: $condition) {
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
export const updateGroupMember = /* GraphQL */ `
  mutation UpdateGroupMember(
    $input: UpdateGroupMemberInput!
    $condition: ModelGroupMemberConditionInput
  ) {
    updateGroupMember(input: $input, condition: $condition) {
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
export const deleteGroupMember = /* GraphQL */ `
  mutation DeleteGroupMember(
    $input: DeleteGroupMemberInput!
    $condition: ModelGroupMemberConditionInput
  ) {
    deleteGroupMember(input: $input, condition: $condition) {
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
export const createMessage = /* GraphQL */ `
  mutation CreateMessage(
    $input: CreateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    createMessage(input: $input, condition: $condition) {
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
export const updateMessage = /* GraphQL */ `
  mutation UpdateMessage(
    $input: UpdateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    updateMessage(input: $input, condition: $condition) {
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
export const deleteMessage = /* GraphQL */ `
  mutation DeleteMessage(
    $input: DeleteMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    deleteMessage(input: $input, condition: $condition) {
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
export const createTask = /* GraphQL */ `
  mutation CreateTask(
    $input: CreateTaskInput!
    $condition: ModelTaskConditionInput
  ) {
    createTask(input: $input, condition: $condition) {
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
export const updateTask = /* GraphQL */ `
  mutation UpdateTask(
    $input: UpdateTaskInput!
    $condition: ModelTaskConditionInput
  ) {
    updateTask(input: $input, condition: $condition) {
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
export const deleteTask = /* GraphQL */ `
  mutation DeleteTask(
    $input: DeleteTaskInput!
    $condition: ModelTaskConditionInput
  ) {
    deleteTask(input: $input, condition: $condition) {
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
