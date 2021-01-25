<script lang="ts">
  import LinkTo from '@anticrm/platform-ui/src/components/LinkTo.svelte'

  export let link: string = '/'
  export let selected: boolean = false
  export let label: string = ''
  export let count: number = 0;
</script>

<LinkTo href={link}>
  <div class="item" class:selected={selected}>
    {label}
    {#if count > 0}
      <div class="counter">{count}</div>
    {/if}
  </div>
</LinkTo>

<style lang="scss">
  .item {
    box-sizing: border-box;
    font-family: var(--theme-font-content);
    font-weight: 500;
    padding: 0.5em;
    padding-top: calc(0.5em + 1px);
    margin-bottom: 0.25em;
    height: 2.5em;
    color: var(--theme-content-color);
    background-color: var(--theme-bg-color);
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;

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
    &:hover {
      color: var(--theme-highlight-color);
    }
  }

  .counter {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--white-color);
    background-color: var(--theme-highlight-color);
    font-weight: 700;
    font-size: 11px;
    line-height: 11px;

    height: 16px;
    margin: 0;
    padding: 0 4px;
    border-radius: 8px;
  }
</style>