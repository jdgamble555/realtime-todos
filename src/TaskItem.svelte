<script lang="ts">

    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    
    function remove() {
		dispatch('remove', { id });
	}

	function toggleStatus() {
        let newStatus = !completed;
		dispatch('toggle', {
            id,
            newStatus
        });
    }

    export let id = undefined; // document ID
    export let text = undefined;
    export let completed = undefined;
</script>

<style>
    .is-complete {
        text-decoration: line-through;
        color: green;
    }
</style>


<li>

{#if completed}
    <span class="is-complete">{ text }</span>
    <button on:click={toggleStatus}> ✔️ </button>
{:else}
    <span>{ text }</span>
    <button on:click={toggleStatus}> ❌ </button>
{/if}

<button on:click={remove}> 🗑 </button>

</li>