<script lang='ts'>
  import ScrollView from './ScrollView.svelte'

  export let items: Array<Object> = []
  export let selected: number = 0
  export let label: string = 'Значение'
  export let width: string = ''

  let comboHidden: boolean = true
  let comboRoot: HTMLElement
  let comboDrop: HTMLElement
  let comboItems: HTMLElement

  let widthStr: string = (width !== '') ? `width: ${width}` : '' 

  function showCombo(): void {
    const rect = comboRoot.getBoundingClientRect()
    comboDrop.style.top = rect.height + 3 + 'px'
    comboDrop.style.left = '-1px'
    comboDrop.style.visibility = 'visible'
    comboHidden = false
    window.addEventListener('click', toggleCombo)
  }

  function hideCombo(): void {
    comboDrop.style.visibility = 'hidden'
    comboHidden = true
    window.removeEventListener('click', toggleCombo)
  }

  function toggleCombo(event: MouseEvent): void {
    let pathRoot: boolean = false
    let pathDrop: boolean = false
    let pathItems: boolean = false
    event.path.find((el) => {
      if (el.className === comboRoot?.className) pathRoot = true
      if (el.className === comboDrop?.className) pathDrop = true
      if (el.className === comboItems?.className) pathItems = true
    })
    if (pathRoot && !pathDrop) {
      if (comboHidden) showCombo()
      else hideCombo()
    } else if (!pathDrop) hideCombo()
    if (pathItems) hideCombo()
  }

  function handler(event: MouseEvent): void {
    if (comboHidden) window.addEventListener('click', toggleCombo)
  }
</script>

<div bind:this={comboRoot} class="comboBox" class:selectedCombo={!comboHidden} style="{widthStr}" on:click={handler}>
  <div class="selectedItem">
    <div class="selectedItem__label">{label}</div>
    <div class="selectedItem__value">{items[selected].comboValue}</div>
  </div>
  <div class="arrowDown"></div>

  <div bind:this={comboDrop} class="comboBox-drop">
    <div bind:this={comboItems} class="comboBox-drop__items">
      <ScrollView width="100%" height="100%" accentColor="true">
        {#each items as item (item.id)}
          <div class="comboBox-drop__item" class:selected={item.id === selected}
               on:click={() => { selected = item.id }}>
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
    background-color: var(--theme-bg-accent-color);
    border: solid 1px var(--theme-bg-dark-color);
    border-radius: 4px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;

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
        color: var(--theme-content-color);
        margin-bottom: 4px;
      }
      &__value {
        font-size: 14px;
        color: var(--theme-content-dark-color);
      }
    }

    &-drop {
      position: absolute;
      visibility: hidden;
      display: flex;
      flex-direction: column;
      width: calc(100% - 16px);
      background-color: var(--theme-bg-accent-color);
      border: solid 1px var(--theme-bg-dark-color);
      border-radius: 4px;
      padding: 8px;
      z-index: 1000;
      box-shadow: var(--theme-shadow);

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