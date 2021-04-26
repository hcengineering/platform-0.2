<script lang="ts">
  export let separator = false
</script>

{#if !separator}
  <div class="popup-item-view" on:click>
    <slot />
  </div>
{:else}
  <div class="popup-separator" />
{/if}

<style lang="scss">
  .popup-item-view {
    margin: 4px 0;
    padding: 8px;
    font-weight: 400;
    border-radius: 4px;
    border: none;
    text-align: left;
    cursor: pointer;
    color: var(--theme-content-color);
    background-color: var(--theme-bg-color);
    &:hover {
      background-color: var(--theme-bg-accent-color);
    }
  }

  .popup-separator {
    height: 1px;
    background-color: var(--theme-bg-accent-color);
  }
</style>
