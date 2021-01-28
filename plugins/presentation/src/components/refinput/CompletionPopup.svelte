<script lang="ts">
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'

  import ui from '@anticrm/platform-ui'
  import { Class, Ref } from '@anticrm/core'
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'

  import { createEventDispatcher, onMount } from 'svelte'

  import { CompletionItem, Position, getFirst, calcOffset } from './CompletionPopupHelper'

  const dispatch = createEventDispatcher()

  export let items: CompletionItem[] = []
  export let pos: Position
  export let ontop: boolean = false

  let listElement: HTMLElement
  let selElement: HTMLElement
  let selOffset: number
  let selection = getFirst(items)
  let popupStyle = ''

  let clientHeight: number
  let clientWidth: number

  function selectItem(item: CompletionItem) {
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

    let cs = items.find((e) => e.key == selection.key)
    if (cs == null) {
      // Filtering caused selection to be wrong, select first
      selection = getFirst(items)
    }

    selOffset = calcOffset(selElement)
    console.log(items)
  }

  export function handleUp() {
    let pos = items.indexOf(selection)
    if (pos > 0) {
      selection = items[pos - 1]
    }
  }
  export function handleDown() {
    let pos = items.indexOf(selection)
    if (pos < items.length - 1) {
      selection = items[pos + 1]
    }
  }
  export function handleSubmit() {
    dispatch('select', selection)
  }
</script>

<style lang="scss">
  .presentation-completion-popup {
    display: flex;
    flex-direction: column;
    background-color: var(--theme-bg-color);
    color: var(--theme-content-color);
    position: relative;
    border: 1px solid var(--theme-bg-dark-color);
    border-radius: 4px;
    height: 150px;
    width: 300px;
    padding: 1em;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);

    .item {
      font-size: 14px;
      font-family: var(--theme-font-caption);
      color: var(--theme-content-color);
      white-space: no-wrap;
      padding: 0.5em;
      border-radius: 4px;
      cursor: pointer;

      &.selected {
        border-color: var(--theme-doclink-color);
        background-color: var(--theme-doclink-color);
        position: sticky;
      }

      &:focus {
        outline: none;
        border-color: var(--theme-doclink-color);
        box-shadow: inset 0px 0px 2px 0px var(--theme-doclink-color);
        color: var(--theme-caption-color);
      }
    }
  }
</style>

<div class="presentation-completion-popup" style={popupStyle} bind:clientHeight bind:clientWidth on:blur>
  <ScrollView stylez="height:100%;width: 100%;" scrollPosition={selOffset}>
    <div bind:this={listElement}>
      {#each items as item (item.key)}
        <div
          class="item"
          class:selected={item.key == selection.key}
          on:click|preventDefault={() => selectItem(item)}
          on:mouseover={() => (selection = item)}>
          {#if item.key == selection.key}
            <div class="focus-placeholder" bind:this={selElement} style="width:0px" />
          {/if}
          {item.title || item.label}
        </div>
      {/each}
    </div>
  </ScrollView>
</div>
