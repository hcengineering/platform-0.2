<script lang='ts'>
  export const separator: boolean = false
</script>

{#if (!separator)}
  <div class="popup-item-view" on:click>
    <slot />
  </div>
{:else}
  <div class="popup-separator"></div>
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