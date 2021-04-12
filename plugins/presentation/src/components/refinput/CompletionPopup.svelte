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
  .presentation-completion-popup {
    position: relative;
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    height: 150px;
    width: 300px;
    padding: 1em;
    background-color: var(--theme-bg-color);
    color: var(--theme-content-color);
    border: 1px solid var(--theme-bg-dark-color);
    box-shadow: var(--theme-shadow);
    .item {
      font-size: 15px;
      white-space: no-wrap;
      margin: 4px 0;
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      color: var(--theme-content-dark-color);
      transition: background-color 0.2s;
      &.selected {
        position: sticky;
        background-color: var(--theme-bg-accent-hover);
      }
      &:focus {
        outline: none;
        border-color: var(--theme-doclink-color);
        box-shadow: inset 0px 0px 2px 0px var(--theme-doclink-color);
        color: var(--theme-caption-color);
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
</style>
