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
    color: var(--theme-content-color);
    background-color: var(--theme-bg-color);
    &:hover {
      color: var(--theme-doclink-color);
    }
    &.selected {
      font-weight: 700;
      color: var(--theme-content-dark-color);
      background-color: var(--theme-bg-accent-color);
      &:hover {
        cursor: default;
        color: var(--theme-content-dark-color);
        background-color: var(--theme-bg-accent-color);
      }
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
    background-color: var(--theme-doclink-color);
  }
</style>
