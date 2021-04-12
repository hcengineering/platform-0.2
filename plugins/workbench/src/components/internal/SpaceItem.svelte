<script lang="ts">
  export let selected = false
  export let label = ''
  export let count = 0
</script>

<div class="item" class:selected>
  {label}
  {#if count > 0}
    <div class="counter">{count}</div>
  {/if}
</div>

<style lang="scss">
  @import '~@anticrm/sparkling-theme/styles/_global.scss';

  .item {
    box-sizing: border-box;
    font-weight: 500;
    padding: 0.5em;
    padding-top: calc(0.5em + 1px);
    margin-bottom: 0.25em;
    height: 2.5em;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    &.selected {
      font-weight: 700;
      &:hover {
        cursor: default;
      }
    }
  }
  :global(.theme-dark) .item {
    color: $theme-dark-content-color;
    background-color: $theme-dark-bg-color;
    &.selected {
      color: $theme-dark-content-dark-color;
      background-color: $theme-dark-bg-accent-color;
      &:hover {
        color: $theme-dark-content-dark-color;
        background-color: $theme-dark-bg-accent-color;
      }
    }
    &:hover {
      color: $theme-dark-doclink-color;
    }
  }
  :global(.theme-grey) .item {
    color: $theme-grey-content-color;
    background-color: $theme-grey-bg-color;
    &.selected {
      color: $theme-grey-content-dark-color;
      background-color: $theme-grey-bg-accent-color;
      &:hover {
        color: $theme-grey-content-dark-color;
        background-color: $theme-grey-bg-accent-color;
      }
    }
    &:hover {
      color: $theme-grey-doclink-color;
    }
  }
  :global(.theme-light) .item {
    color: $theme-light-content-color;
    background-color: $theme-light-bg-color;
    &.selected {
      color: $theme-light-content-dark-color;
      background-color: $theme-light-bg-accent-color;
      &:hover {
        color: $theme-light-content-dark-color;
        background-color: $theme-light-bg-accent-color;
      }
    }
    &:hover {
      color: $theme-light-doclink-color;
    }
  }

  .counter {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--white-color);
    font-weight: 700;
    font-size: 11px;
    line-height: 11px;

    height: 16px;
    margin: 0;
    padding: 0 4px;
    border-radius: 8px;
  }
  :global(.theme-dark) .counter {
    background-color: $theme-dark-doclink-color;
  }
  :global(.theme-grey) .counter {
    background-color: $theme-grey-doclink-color;
  }
  :global(.theme-light) .counter {
    background-color: $theme-light-doclink-color;
  }
</style>
