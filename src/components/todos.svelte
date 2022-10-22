<script lang="ts">
	import { addTodo, deleteTodo, getTodos, updateTodo, user } from '$lib/database';

	const add = async (e: SubmitEvent) => {
		const t = e.target as HTMLFormElement;
		const v = t.text.value;
		t.reset();
		await addTodo($user!.uid, v);
	};
	const toggle = async (id: string, complete: boolean) => await updateTodo(id, !complete);
	const remove = async (id: string) => await deleteTodo(id);
	const todos = getTodos($user!.uid);
</script>

<ol>
	{#each $todos as todo}
		<li>
			<span>{todo.text}</span>
			<button on:click={() => toggle(todo.id, todo.complete)}>
				{#if todo.complete}
					✔️
				{:else}
					❌
				{/if}
			</button>
			<button on:click={() => remove(todo.id)}> 🗑 </button>
		</li>
	{/each}
</ol>

<form on:submit|preventDefault={add}>
	<input name="text" />
	<button type="submit">Add Task</button>
</form>
