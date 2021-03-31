<script lang="ts">
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import { Action } from '..'
  import { onDestroy } from 'svelte'

  export let items: Action[]
  export let selected: number = 0

  let comboHidden: boolean = true
  let comboRoot: HTMLElement
  let comboDrop: HTMLElement
  let comboItems: HTMLElement

  function showCombo (): void {
    const rect = comboRoot.getBoundingClientRect()
    comboDrop.style.top = rect.height + 3 + 'px'
    comboDrop.style.left = '-1px'
    comboDrop.style.visibility = 'visible'
    comboHidden = false
    window.addEventListener('click', toggleCombo)
  }

  function hideCombo (): void {
    comboDrop.style.visibility = 'hidden'
    comboHidden = true
    window.removeEventListener('click', toggleCombo)
  }

  function toggleCombo (event: MouseEvent): void {
    let pathRoot: boolean = false
    let pathDrop: boolean = false
    let pathItems: boolean = false
    var path = event['path'] || (event.composedPath && event.composedPath())
    path.find((el) => {
      if (el.className === comboRoot.className) pathRoot = true
      if (el.className === comboDrop.className) pathDrop = true
      if (el.className === comboItems.className) pathItems = true
    })
    if (pathRoot && !pathDrop) {
      if (comboHidden) {
        showCombo()
      } else {
        hideCombo()
      }
    } else if (!pathDrop) hideCombo()
    if (pathItems) hideCombo()
  }

  function handler (event: MouseEvent): void {
    if (comboHidden) window.addEventListener('click', toggleCombo)
  }

  onDestroy(() => {
    hideCombo()
  })
</script>

<div bind:this={comboRoot} class="comboBox" class:selectedCombo={!comboHidden} on:click={handler}>
  <slot name="title" />
  <div class="arrowDown"></div>

  <div bind:this={comboDrop} class="comboBox-drop">
    <div bind:this={comboItems} class="comboBox-drop__items">
      <ScrollView width="100%" height="100%" accentColor="true">
        {#each items as item}
          <div class="comboBox-drop__item" class:selected={item.id === selected}
               on:click={() => { selected = item.id }}>
            <div on:click={() => item.action()}>{item.name}</div>
          </div>
        {/each}
      </ScrollView>
    </div>
  </div>
</div>

<style lang="scss">
  .comboBox {
    position: relative;
    background-color: var(--theme-bg-accent-color);
    border: solid 1px var(--theme-bg-dark-color);
    border-radius: 4px;
    padding: .5em 1em .5em .5em;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;

    &:hover {
      background-color: var(--theme-bg-accent-hover);
      border-color: var(--theme-bg-dark-hover);
    }

    &:hover .comboBox-drop {
      box-shadow: var(--theme-shadow);
    }

    &-drop {
      position: absolute;
      visibility: hidden;
      display: flex;
      flex-direction: column;
      width: calc(100% - 2em);
      background-color: var(--theme-bg-accent-color);
      border: solid 1px var(--theme-bg-dark-color);
      border-radius: 4px;
      padding: 1em;
      z-index: 1000;
      box-shadow: var(--theme-shadow);

      &__items {
        height: 10em;
        padding-right: 1px;
      }

      &__item {
        margin: 0;
        padding: .5em;
        border-radius: 4px;

        &:hover {
          background-color: var(--theme-bg-accent-hover);
        }
      }

      .selected {
        background-color: var(--theme-bg-accent-hover);

        &:hover {
          background-color: var(--theme-bg-accent-hover);
        }
      }
    }
  }

  .selectedCombo {
    background-color: var(--theme-bg-accent-hover);
    border-color: var(--theme-bg-dark-hover);
  }

  .arrowDown {
    position: relative;
    width: 16px;
    height: 16px;

    &::after {
      content: '';
      position: absolute;
      width: 1px;
      height: 6px;
      left: calc(50% + 2px);
      top: 50%;
      transform: translateY(-50%) rotate(45deg);
      background-color: var(--theme-content-color);
    }

    &::before {
      content: '';
      position: absolute;
      width: 1px;
      height: 6px;
      left: calc(50% - 2px);
      top: 50%;
      transform: translateY(-50%) rotate(-45deg);
      background-color: var(--theme-content-color);
    }
  }
</style>
