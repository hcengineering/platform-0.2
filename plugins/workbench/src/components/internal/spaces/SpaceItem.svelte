<script lang="ts">
  import { archivedSpaceUpdate, getSpaceName, leaveSpace } from './utils'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import workbench from '../../..'
  import PopupMenu from '@anticrm/sparkling-controls/src/menu/PopupMenu.svelte'
  import PopupItem from '@anticrm/sparkling-controls/src/menu/PopupItem.svelte'
  import AddUser from './AddUser.svelte'
  import type { Space } from '@anticrm/domains'
  import { getCoreService } from '@anticrm/presentation'
  import { getUIService } from '@anticrm/platform-ui'

  export let selected = false
  export let space: Space = {} as Space
  export let count = 0

  const coreService = getCoreService()
  const uiService = getUIService()

  let optionsButton: HTMLElement
</script>

<div class="item" class:selected>
  {getSpaceName(space)}
  <div class="separator" />
  {#if count > 0}
    <div class="counter">{count}</div>
  {/if}
  {#if selected}
    <div bind:this={optionsButton} class="optionsButton">
      <PopupMenu>
        <div class="popup" slot="trigger">
          <Icon icon={workbench.icon.Burger} />
        </div>
        <PopupItem
          on:click={() => {
            uiService.showModal(AddUser, { space })
          }}
          >Add user
        </PopupItem>
        <PopupItem separator="true" />
        <PopupItem
          on:click={() => {
            leaveSpace(coreService, space)
          }}
          >Leave
        </PopupItem>
        <PopupItem
          on:click={() => {
            archivedSpaceUpdate(coreService, space, !space.archived)
          }}
          >Archive
        </PopupItem>
      </PopupMenu>
    </div>
  {/if}
</div>

<style lang="scss">
  .item {
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    padding: 6px 16px 6px 24px;
    height: 36px;
    border-radius: 8px;
    cursor: pointer;
    color: var(--theme-content-color);
    &.selected {
      color: var(--theme-caption-color);
      background-color: var(--theme-selection-item);
      &:hover {
        cursor: default;
      }
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
    color: var(--theme-white-color);
    font-weight: 700;
    font-size: 11px;
    line-height: 11px;

    height: 16px;
    margin: 0;
    padding: 0 4px;
    border-radius: 8px;
    background-color: var(--theme-doclink-color);
  }

  .optionsButton {
    margin-left: 0.5em;
  }
</style>
