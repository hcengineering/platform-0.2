<script lang="ts">
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { send } from "./HabitMachine";

    let inputRef: HTMLElement;
    let habit = { name: "" };

    onMount(() => inputRef.focus());
</script>

<div style="margin: 2px">
    <input
            class="p-4 text-center text-gray-900"
            type="text"
            placeholder="Type habit here..."
            bind:value={habit.name}
            bind:this={inputRef}
            on:keyup|preventDefault={(evt) => {
      if (evt.code === 'Enter') {
        send({ type: 'ADD_HABIT', habit });
      }
    }} />
    <button on:click={() => send({ type: 'ADD_HABIT', habit })}>Add</button>
    <button on:click={() => send('CANCEL_EDIT')}>Cancel</button>
</div>
