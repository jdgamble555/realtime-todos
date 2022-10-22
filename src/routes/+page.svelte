<script lang="ts">
	import Todos from '$components/todos.svelte';
	import { db } from '$lib/database';
	const { user, logout, loginWithGoogle } = db;
</script>

<section>
	{#if $user}
		<h3>Hi {$user.displayName}!</h3>
		<img src={$user.photoURL} width="100" alt="user avatar" />
		<button on:click={logout}>Logout</button>
		<hr />
		<h1>Realtime Todos</h1>
		<Todos />
	{:else}
		<button on:click={loginWithGoogle}>Signin with Google</button>
	{/if}
</section>
