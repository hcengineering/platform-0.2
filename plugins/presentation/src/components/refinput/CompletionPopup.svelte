<script lang="ts">
  import IconEditBox from '@anticrm/platform-ui/src/components/IconEditBox.svelte'
  import presentation from '@anticrm/presentation'
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'

  import { createEventDispatcher } from 'svelte'

  import type { CompletionItem, Position } from './CompletionPopupHelper'
  import { calcOffset, getFirst } from './CompletionPopupHelper'

  const dispatch = createEventDispatcher()

  export let items: CompletionItem[] = []
  export let pos: Position
  export let ontop = false

  let listElement: HTMLElement
  let selElement: HTMLElement
  let selOffset: number
  let selection = getFirst(items)
  let popupStyle = ''

  let clientHeight: number
  let clientWidth: number

  function selectItem (item: CompletionItem) {
    dispatch('select', item)
  }

  $: {
    popupStyle = `
      left: ${pos.left}px;
      top: ${pos.top - (ontop ? clientHeight : 0)}px;
      margin-bottom:-${clientHeight + 2}px;
      margin-right:-${clientWidth}px;
      z-index: 100000;
    `

    const cs = items.find((e) => e.key === selection.key)
    if (cs == null) {
      // Filtering caused selection to be wrong, select first
      selection = getFirst(items)
    }

    selOffset = calcOffset(selElement)
  }

  export function handleUp (): void {
    const pos = items.indexOf(selection)
    if (pos > 0) {
      selection = items[pos - 1]
    }
  }
  export function handleDown (): void {
    const pos = items.indexOf(selection)
    if (pos < items.length - 1) {
      selection = items[pos + 1]
    }
  }
  export function handleSubmit (): void {
    dispatch('select', selection)
  }
</script>

<div class="presentation-completion-popup" style={popupStyle} bind:clientHeight bind:clientWidth on:blur>
  <IconEditBox icon={presentation.icon.Finder} iconRight width="100%" />
  <div class="separator" />
  <ScrollView width="100%" height="100%" scrollPosition={selOffset}>
    <div bind:this={listElement}>
      {#each items as item (item.key)}
        <div
          class="item"
          class:selected={item.key === selection.key}
          on:click|preventDefault={() => selectItem(item)}
          on:mouseover={() => (selection = item)}>
          {#if item.key === selection.key}
            <div class="focus-placeholder" bind:this={selElement} style="width:0px" />
          {/if}
          {item.title || item.label}
        </div>
      {/each}
    </div>
  </ScrollView>
</div>

<style lang="scss">
  @import '~@anticrm/sparkling-theme/styles/_global.scss';

  .presentation-completion-popup {
    position: relative;
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    height: 150px;
    width: 300px;
    padding: 1em;
    .item {
      font-size: 15px;
      white-space: no-wrap;
      margin: 4px 0;
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
      &.selected {
        position: sticky;
      }
      &:focus {
        outline: none;
      }
      &:first-child {
        margin-top: 0;
      }
      &:last-child {
        margin-bottom: 0;
      }
    }
    .separator {
      height: 8px;
    }
  }
  :global(.theme-dark) .presentation-completion-popup {
    background-color: $theme-dark-bg-color;
    color: $theme-dark-content-color;
    border: 1px solid $theme-dark-bg-dark-color;
    box-shadow: $theme-dark-shadow;
    .item {
      color: $theme-dark-content-dark-color;
      &.selected {
        background-color: $theme-dark-bg-accent-hover;
      }
      &:focus {
        border-color: $theme-dark-doclink-color;
        box-shadow: inset 0px 0px 2px 0px $theme-dark-doclink-color;
        color: $theme-dark-caption-color;
      }
    }
  }
  :global(.theme-grey) .presentation-completion-popup {
    background-color: $theme-grey-bg-accent-color;
    color: $theme-grey-content-color;
    border: 1px solid $theme-grey-bg-dark-color;
    box-shadow: $theme-grey-shadow;
    .item {
      color: $theme-grey-content-dark-color;
      &.selected {
        background-color: $theme-grey-bg-accent-hover;
      }
      &:focus {
        border-color: $theme-grey-doclink-color;
        box-shadow: inset 0px 0px 2px 0px $theme-grey-doclink-color;
        color: $theme-grey-caption-color;
      }
    }
  }
  :global(.theme-light) .presentation-completion-popup {
    background-color: $theme-light-bg-accent-color;
    color: $theme-light-content-color;
    border: 1px solid $theme-light-bg-dark-color;
    box-shadow: $theme-light-shadow;
    .item {
      color: $theme-light-content-dark-color;
      &.selected {
        background-color: $theme-light-bg-accent-hover;
      }
      &:focus {
        border-color: $theme-light-doclink-color;
        box-shadow: inset 0px 0px 2px 0px $theme-light-doclink-color;
        color: $theme-light-caption-color;
      }
    }
  }
</style>
