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
    display: flex;
    align-items: center;
    background-color: var(--theme-bg-accent-color);
    color: var(--theme-content-color);
    font-weight: 500;
    padding: .5em 1em;
    transition: background-color .2s, color .2s;
    cursor: pointer;
    
    &:hover {
      background-color: var(--theme-bg-accent-hover);
    }
  }
  .popup-separator {
    height: 1px;
    background-color: var(--theme-bg-dark-color);
    margin: 0em 1em;
  }
</style>