<script lang="ts">
  import UserInfo from '@anticrm/sparkling-controls/src/UserInfo.svelte'
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import IconEditBox from './IconEditBox.svelte'
  import workbench from '@anticrm/workbench'

  export let items: unknown[]
  export let selected = 0
  export let title: string

  let comboHidden = true
  let comboRoot: HTMLElement
  let comboDrop: HTMLElement
  let comboItems: HTMLElement

  function showCombo (): void {
    const rect = comboRoot.getBoundingClientRect()
    comboDrop.style.top = `${rect.height + 3}px`
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
    let pathRoot = false
    let pathDrop = false
    let pathItems = false
    const path = event.path || (event.composedPath && event.composedPath())
    path.find((el) => {
      if (el.className === comboRoot?.className) pathRoot = true
      if (el.className === comboDrop?.className) pathDrop = true
      if (el.className === comboItems?.className) pathItems = true

      return false
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
</script>

<div bind:this={comboRoot} class="comboBox" class:selectedCombo={!comboHidden} on:click={handler}>
  <UserInfo url={items[selected].url} title={items[selected].name} subtitle={title} subtitleOnTop="true" />
  <div class="arrowDown" />

  <div bind:this={comboDrop} class="comboBox-drop">
    <IconEditBox
      id="select-user-combobox"
      icon={workbench.icon.Finder}
      iconRight="true"
      width="100%"
      hoverState="true" />
    <div class="separator" />
    <div bind:this={comboItems} class="comboBox-drop__items">
      <ScrollView width="100%" height="100%">
        {#each items as item (item.id)}
          <div
            class="comboBox-drop__item"
            class:selected={item.id === selected}
            on:click={() => {
              selected = item.id
            }}>
            <UserInfo url={item.url} title={item.name} />
          </div>
        {/each}
      </ScrollView>
    </div>
  </div>
</div>

<style lang="scss">
  .comboBox {
    position: relative;
    border-radius: 12px;
    padding: 0.5em 1em 0.5em 0.5em;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    background-color: var(--theme-bg-accent-color);
    border: solid 1px var(--theme-bg-dark-color);
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
      border-radius: 4px;
      padding: 1em;
      background-color: var(--theme-bg-color);
      border: solid 1px var(--theme-bg-dark-color);
      box-shadow: var(--theme-shadow);
      z-index: 1000;
      &__items {
        height: 10em;
        padding-right: 1px;
      }
      &__item {
        margin: 0;
        padding: 0.5em;
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

    &::after,
    &::before {
      content: '';
      position: absolute;
      width: 1px;
      height: 6px;
      top: 50%;
      background-color: var(--theme-content-color);
    }
    &::after {
      left: calc(50% + 2px);
      transform: translateY(-50%) rotate(45deg);
    }
    &::before {
      left: calc(50% - 2px);
      transform: translateY(-50%) rotate(-45deg);
    }
  }
</style>
