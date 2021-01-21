<script lang="ts">
  import { GET_TASKS, ADD_TASK, DEL_TASK, UPDATE_TASK } from "./queries";
  import { subscribe, mutation } from "svelte-apollo";
  import TaskItem from "./TaskItem.svelte";

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

  const getTasks = subscribe(GET_TASKS);
  const addTask = mutation(ADD_TASK);
  const delTask = mutation(DEL_TASK);
  const updateTask = mutation(UPDATE_TASK);

  async function add() {
    try {
      await addTask({
        variables: {
          task: {
            title: text,
            completed: false,
            user: { username: user?.email },
          },
        },
      });
    } catch (e: any) {
      console.log(e);
    }
    text = "";
  }

  async function remove(event: any) {
    const { id } = event.detail;
    try {
      await delTask({
        variables: {
          id: [id],
        },
      });
    } catch (e: any) {
      console.log(e);
    }
  }

  async function toggle(event: any) {
    const { id, newStatus } = event.detail;
    try {
      await updateTask({
        variables: {
          id: id,
          completed: newStatus,
        },
      });
    } catch (e: any) {
      console.log(e);
    }
  }

  const onKeyPress = (e: any) => {
    if (e.charCode === 13) add();
  };
</script>

<h1>Apollo DGraph Version</h1>
<div>
  {#if $getTasks.loading}
    Loading...
  {:else if $getTasks.error}
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
