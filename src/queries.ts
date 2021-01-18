import gql from "graphql-tag";

export const ADD_USER = gql`
  mutation addUser($user: AddUserInput!) {
    addUser(input: [$user]) {
      user {
        username
      }
    }
  }
`;

export const GET_TASKS = gql`
  subscription {
    queryTask {
      id
      title
      completed
      user {
        username
      }
    }
  }
`;

export const ADD_TASK = gql`
  mutation addTask($task: AddTaskInput!) {
    addTask(input: [$task]) {
      task {
        id
        title
        completed
      }
    }
  }
`;

export const DEL_TASK = gql`
  mutation deleteTask($id: [ID!]) {
    deleteTask(filter: { id: $id }) {
      msg
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation updateTask($id: ID!, $completed: Boolean!) {
    updateTask(
      input: { filter: { id: [$id] }, set: { completed: $completed } }
    ) {
      task {
        id
        title
        completed
      }
    }
  }
`;
