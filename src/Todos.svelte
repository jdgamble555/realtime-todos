<script lang="ts">
  import TodoItem from "./TodoItem.svelte";
  import { db } from "./firebase";
  import type firebase from "firebase/app";
  import { collectionData } from "rxfire/firestore";
  import { startWith } from "rxjs/operators";
  import type { Observable } from "rxjs";

  interface Todo {
    id: string;
    text: string;
    complete: boolean;
    createdAt: firebase.firestore.Timestamp;
  }

  // User ID passed from parent
  export let uid = undefined;

  // Form Text
  let text = "some task";

  // Query requires an index, see screenshot below
  const query = db
    .collection("todos")
    .where("uid", "==", uid)
    .orderBy("created");

  const todos = collectionData(query, "id").pipe(startWith([])) as Observable<
    Todo[]
  >;

  function add() {
    db.collection("todos").add({
      uid,
      text,
      complete: false,
      created: Date.now(),
    });
    text = "";
  }

  function updateStatus(event: any) {
    const { id, newStatus } = event.detail;
    db.collection("todos").doc(id).update({ complete: newStatus });
  }

  function removeItem(event: any) {
    const { id } = event.detail;
    db.collection("todos").doc(id).delete();
  }

  const onKeyPress = (e: any) => {
    if (e.charCode === 13) add();
  };
</script>

<h1>Firebase Version</h1>
<ul>
  {#each $todos as todo}
    <TodoItem
      id={todo.id}
      text={todo.text}
      complete={todo.complete}
      on:remove={removeItem}
      on:toggle={updateStatus}
    />
  {/each}
</ul>

<input bind:value={text} on:keypress={onKeyPress} />

<button on:click={add}>Add Task</button>
