<script lang="ts">
	import { db } from '$lib/database';

	export let user;

	const { deleteTodo, updateTodo, addTodo, getTodos } = db(user.uid);
	const todos = getTodos;

	const add = async (e: SubmitEvent) => {
		const t = e.target as HTMLFormElement;
		const v = t.text.value;
		t.reset();
		addTodo(v);
	};
	const toggle = (id: string, complete: boolean) => updateTodo(id, !complete);
	const remove = (id: string) => deleteTodo(id);
</script>

{#if $todos}
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
{/if}

<form on:submit|preventDefault={add}>
	<input name="text" />
	<button type="submit">Add Task</button>
</form>
