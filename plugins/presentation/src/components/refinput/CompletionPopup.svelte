<script lang="ts">
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'

  import ui from '@anticrm/platform-ui'
  import { Class, Ref, VDoc } from '@anticrm/core'
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'

  import { createEventDispatcher, onMount } from 'svelte'

  import {
    CompletionItem,
    Position,
    getFirst,
    calcOffset
  } from './CompletionPopupHelper'

  const dispatch = createEventDispatcher()

  export let items: CompletionItem[] = []
  export let pos: Position
  export let ontop:boolean = false

  let listElement: HTMLElement
  let selElement: HTMLElement
  let selOffset: number
  let selection = getFirst(items)
  let popupStyle = ''

  let clientHeight: number

  function selectItem(item: string) {
    dispatch('select', item)
  }

  $: {
		popupStyle = `
			left: ${pos.left}px;
			top: ${pos.top - (ontop ? clientHeight : 0)}px;
			margin-bottom:-${clientHeight + 2}px;
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

<div
  class="presentation-completion-popup"
  style="{popupStyle}"
  bind:clientHeight
	on:blur
>
  <ScrollView stylez="height:100%;width: 100%;" scrollPosition="{selOffset}">
    <div bind:this="{listElement}">
      {#each items as item (item.key)}
        <div
          class="item"
          class:selected="{item.key == selection.key}"
          on:click|preventDefault="{() => selectItem(item.key)}"
        >
          {#if item.key == selection.key}
            <div
              class="focus-placeholder"
              bind:this="{selElement}"
              style="width:0px"
            ></div>
          {/if}
          {item.title || item.label}
        </div>
      {/each}
    </div>
  </ScrollView>
</div>

<style lang="scss">
  .presentation-completion-popup {
    display: flex;
    flex-direction: column;
    background-color: var(--theme-content-bg-color);
    color: #fff;
    position: relative;
    border: 1px solid var(--theme-content-color-dark);
    border-radius: 3px;
    height: 75px;
    width: 300px;

    .item {
      font-size: 14px;
      font-family: Raleway;
      white-space: no-wrap;
      width: 100%;

      &.selected {
        border-color: var(--theme-highlight-color);
        background-color: var(--theme-highlight-color);
        position: sticky;
      }

      &:focus {
        outline: none;
        border-color: var(--theme-highlight-color);
        box-shadow: inset 0px 0px 2px 0px var(--theme-highlight-color);
      }

      &:hover {
        border-color: var(--theme-highlight-color);
        background-color: gsl(var(--theme-highlight-color), 80%);
      }
    }
  }
</style>
