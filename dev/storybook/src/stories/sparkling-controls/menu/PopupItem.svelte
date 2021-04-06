<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let separator = false
  export let label: string

  const dispatch = createEventDispatcher()
  function onClick (event) {
    dispatch('click', event)
  }
</script>

{#if !separator}
  <div class="popup-item-view" on:click={onClick}>
    {label}
  </div>
{:else}
  <div class="popup-separator" />
{/if}

<style lang="scss">
  .popup-item-view {
    margin: 4px 0;
    padding: 8px;
    background-color: var(--theme-bg-accent-color);
    border-radius: 4px;
    border: none;
    text-align: left;
    color: var(--theme-content-dark-color);
    cursor: pointer;

    &:hover {
      background-color: var(--theme-bg-accent-hover);
    }
  }
  .popup-separator {
    height: 1px;
    background-color: var(--theme-bg-dark-color);
  }
</style>
