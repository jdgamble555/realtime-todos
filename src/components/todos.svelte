<script lang="ts">
	import { db } from '$lib/database';
	import type { User } from '$lib/user.model';

	export let user: User;

	const { deleteTodo, updateTodo, addTodo, getTodos } = db;
	const todos = getTodos(user.uid);

	const add = async (e: Event) => {
		const t = e.target as HTMLFormElement;
		const v = t.text.value;
		t.reset();
		addTodo(user.uid, v);
	};
</script>

{#if $todos}
	<ol>
		{#each $todos as todo}
			<li>
				<span class={todo.complete ? 'complete' : ''}>{todo.text}</span>
				<button on:click={() => updateTodo(todo.id, !todo.complete)}>
					{todo.complete ? '✔️' : '❌'}
				</button>
				<button on:click={() => deleteTodo(todo.id)}> 🗑 </button>
			</li>
		{/each}
	</ol>
{/if}

<form on:submit|preventDefault={add}>
	<input name="text" />
	<button type="submit">Add Task</button>
</form>

<style>
	.complete {
		text-decoration: line-through;
		color: green;
	}
</style>
