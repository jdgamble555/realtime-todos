<script lang="ts">
  import {
    setClient,
    operationStore,
    subscription,
    mutation,
  } from "@urql/svelte";
  import { client } from "./urql";
  import TaskItem from "./TaskItem.svelte";

  setClient(client);

  const getTasks = operationStore(`
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
    `);

  const addTask = mutation(
    operationStore(
      `
    mutation addTask($task: AddTaskInput!) {
    addTask(input: [$task]) {
      task {
        id
        title
        completed
      }
    }
  }
    `
    )
  );

  const delTask = mutation(
    operationStore(`
  mutation deleteTask($id: [ID!]) {
    deleteTask(filter: { id: $id }) {
      msg
    }
  }
`)
  );

  const updateTask = mutation(
    operationStore(`
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
`)
  );

  subscription(getTasks);

  interface Task {
    id: string;
    title: string;
    completed: boolean;
    //createdAt: Date
  }

  // Form Text
  let text = "some task";

  // User ID passed from parent
  export let user = undefined;

  function add() {
    try {
      addTask({
        task: {
          title: text,
          completed: false,
          user: { username: user?.email },
        },
      });
    } catch (e: any) {
      console.log(e);
    }
    text = "";
  }

  function remove(event: any) {
    const { id } = event.detail;
    try {
      delTask({
        id: [id],
      });
    } catch (e: any) {
      console.log(e);
    }
  }

  function toggle(event: any) {
    const { id, newStatus } = event.detail;
    try {
      updateTask({
        id: id,
        completed: newStatus,
      });
    } catch (e: any) {
      console.log(e);
    }
  }

  const onKeyPress = (e: any) => {
    if (e.charCode === 13) add();
  };
</script>

<h1>Urql DGraph Version</h1>
<div>
  {#if $getTasks.error}
    Oh no! {$getTasks.error.message}
  {:else if !$getTasks.data}
    No data
  {:else}
    <ul>
      {#each $getTasks.data.queryTask as task (task.id)}
        <li>
          <TaskItem
            id={task.id}
            text={task.title}
            completed={task.completed}
            on:remove={remove}
            on:toggle={toggle}
          />
        </li>
      {/each}
    </ul>
  {/if}
</div>

<input bind:value={text} on:keypress={onKeyPress} />

<button on:click={add}>Add Task</button>
