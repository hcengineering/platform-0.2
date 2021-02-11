<script lang="ts">
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import { ClassPresenter } from '@anticrm/presentation'
  import { createEventDispatcher } from 'svelte'

  export let presenter: ClassPresenter
  export let link: string = '/'
  export let selected: boolean = false
  const dispatcher = createEventDispatcher()

</script>

<div on:click|preventDefault={() => dispatcher('select') }>
  <div class="item" class:selected={selected}>
    {#if presenter.icon}
      <Icon icon={presenter.icon} button="true" />
    {/if}
    {presenter.label}
    <div class="separator"></div>
  </div>
</div>

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
      color: var(--theme-doclink-color);
    }
  }
</style>
