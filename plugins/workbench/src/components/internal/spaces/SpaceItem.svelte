<script lang='ts'>
  import LinkTo from '@anticrm/platform-ui/src/components/LinkTo.svelte'
  import { Space } from '@anticrm/core'
  import { archivedSpaceUpdate, getCurrentUserSpace, getSpaceName, leaveSpace } from './utils'
  import { _getCoreService, getUIService } from '../../../utils'
  import SpaceOptions from './SpaceOptions.svelte'

  export let link: string = '/'
  export let selected: boolean = false
  export let space: Space = {} as Space
  export let count: number = 0

  const coreService = _getCoreService()
  const uiService = getUIService()

  let optionsButton: HTMLElement

  function addUser () {

  }

  function showSpaceOptions () {

  }
</script>

<LinkTo href={link}>
  <div class='item' class:selected={selected}>
    {getSpaceName(space)}
    <div class="separator"></div>
    {#if count > 0}
      <div class='counter'>{count}</div>
    {/if}
    {#if selected}
      <div bind:this={optionsButton} class='options' on:click|preventDefault={() => {
            uiService.showModal(SpaceOptions, {space}, optionsButton)
          }}>︙
      </div>
    {/if}
  </div>
</LinkTo>

<style lang='scss'>
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

  .separator {
    flex-grow: 1;
  }

  .counter {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--white-color);
    background-color: var(--theme-doclink-color);
    font-weight: 700;
    font-size: 11px;
    line-height: 11px;

    height: 16px;
    margin: 0;
    padding: 0 4px;
    border-radius: 8px;
  }

  .options {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--white-color);
    font-weight: 700;
    font-size: 11px;
    line-height: 11px;
    position: relative;

    height: 16px;
    width: 16px;
    margin: 0 0 0 .5em;
    cursor: pointer;
    transition: all .2s ease-in-out;
    border: solid 1px var(--theme-bg-accent-color);

    &::before {
      content: '';
      position: absolute;
      background-color: var(--theme-bg-accent-color);
      border-radius: 4px;
      width: 16px;
      height: 16px;
      top: 2px;
      left: 2px;
      transition: all .2s ease-in-out;
      z-index: -1;
    }

    &:hover {
      border: solid 1px var(--theme-bg-dark-color);
      box-shadow: 0 0 2px 2px var(--theme-highlight-color);

      &::before {
        background-color: var(--theme-bg-dark-color);
      }
    }
  }

</style>
