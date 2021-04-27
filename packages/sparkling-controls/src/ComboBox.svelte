<script lang="ts">
  import ScrollView from './ScrollView.svelte'

  export let items: Array<any> = []
  export let selected: number | undefined
  export let label = 'Значение'
  export let width = ''
  export let editable = true

  const widthStr: string = width !== '' ? `width: ${width}` : ''

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

  function toggleCombo (event: any): void {
    let pathRoot = false
    let pathDrop = false
    let pathItems = false
    const path = event.path || (event.composedPath && event.composedPath())
    path.find((el) => {
      if (el.className === comboRoot.className) pathRoot = true
      if (el.className === comboDrop.className) pathDrop = true
      if (el.className === comboItems.className) pathItems = true

      return false
    })
    if (pathRoot && !pathDrop) {
      if (comboHidden && editable) {
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

<div bind:this={comboRoot} class="comboBox" class:selectedCombo={!comboHidden} style={widthStr} on:click={handler}>
  <div class="selectedItem">
    <div class="selectedItem__label">{label}</div>
    <div class="selectedItem__value">{selected ? items[selected].comboValue : ''}</div>
  </div>
  <div class="arrowDown" />

  <div bind:this={comboDrop} class="comboBox-drop">
    <div bind:this={comboItems} class="comboBox-drop__items">
      <ScrollView width="100%" height="100%">
        {#each items as item (item.id)}
          <div
            class="comboBox-drop__item"
            class:selected={item.id === selected}
            on:click={() => {
              selected = item.id
            }}>
            {item.comboValue}
          </div>
        {/each}
      </ScrollView>
    </div>
  </div>
</div>

<style lang="scss">
  .comboBox {
    position: relative;
    border-radius: 4px;
    padding: 8px 16px;
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

    .selectedItem {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      &__label {
        font-size: 11px;
        margin-bottom: 4px;
        color: var(--theme-content-color);
      }
      &__value {
        font-size: 15px;
        color: var(--theme-content-dark-color);
      }
    }
    &-drop {
      position: absolute;
      visibility: hidden;
      display: flex;
      flex-direction: column;
      width: calc(100% - 16px);
      border-radius: 4px;
      padding: 8px;
      background-color: var(--theme-bg-accent-color);
      border: solid 1px var(--theme-bg-dark-color);
      box-shadow: var(--theme-shadow);
      z-index: 1000;

      &__items {
        height: 10em;
        padding-right: 1px;
      }
      &__item {
        margin: 4px 0;
        padding: 8px;
        border-radius: 4px;
        color: var(--theme-content-dark-color);
        &:hover {
          background-color: var(--theme-bg-accent-hover);
        }
        &:first-child {
          margin-top: 0;
        }
        &:last-child {
          margin-bottom: 0;
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
