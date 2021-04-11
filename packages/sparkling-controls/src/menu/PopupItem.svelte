<script lang="ts">
  export const separator = false
</script>

{#if !separator}
  <div class="popup-item-view" on:click>
    <slot />
  </div>
{:else}
  <div class="popup-separator" />
{/if}

<style lang="scss">
  @import "~@anticrm/sparkling-theme/styles/_global.scss";

  .popup-item-view {
    margin: 4px 0;
    padding: 8px;
    font-weight: 400;
    border-radius: 4px;
    border: none;
    text-align: left;
    cursor: pointer;
  }
  :global(.theme-dark) .popup-item-view {
    color: $theme-dark-content-color;
    background-color: $theme-dark-bg-color;
    &:hover {
      background-color: $theme-dark-bg-accent-color;
    }
  }
  :global(.theme-grey) .popup-item-view {
    color: $theme-grey-content-color;
    background-color: $theme-grey-bg-color;
    &:hover {
      background-color: $theme-grey-bg-accent-color;
    }
  }
  :global(.theme-light) .popup-item-view {
    color: $theme-light-content-color;
    background-color: $theme-light-bg-color;
    &:hover {
      background-color: $theme-light-bg-accent-color;
    }
  }

  .popup-separator {
    height: 1px;
  }
  :global(.theme-dark) .popup-separator {
    background-color: $theme-dark-bg-accent-color;
  }
  :global(.theme-grey) .popup-separator {
    background-color: $theme-grey-bg-accent-color;
  }
  :global(.theme-light) .popup-separator {
    background-color: $theme-light-bg-accent-color;
  }
</style>
