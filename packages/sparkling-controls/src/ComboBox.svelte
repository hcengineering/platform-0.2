<script lang="ts">
  import ScrollView from './ScrollView.svelte'

  export let items: Array<any> = []
  export let selected = 0
  export let label = 'Значение'
  export let width = ''

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

  function toggleCombo (event: MouseEvent): void {
    let pathRoot = false
    let pathDrop = false
    let pathItems = false
    event.path.find((el) => {
      if (el.className === comboRoot.className) pathRoot = true
      if (el.className === comboDrop.className) pathDrop = true
      if (el.className === comboItems.className) pathItems = true

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

<div bind:this={comboRoot} class="comboBox" class:selectedCombo={!comboHidden} style={widthStr} on:click={handler}>
  <div class="selectedItem">
    <div class="selectedItem__label">{label}</div>
    <div class="selectedItem__value">{items[selected].comboValue}</div>
  </div>
  <div class="arrowDown" />

  <div bind:this={comboDrop} class="comboBox-drop">
    <div bind:this={comboItems} class="comboBox-drop__items">
      <ScrollView width="100%" height="100%" accentColor="true">
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
  @import '~@anticrm/sparkling-theme/styles/_global.scss';

  .comboBox {
    position: relative;
    border-radius: 4px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    .selectedItem {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      &__label {
        font-size: 11px;
        margin-bottom: 4px;
      }
      &__value {
        font-size: 15px;
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
      z-index: 1000;

      &__items {
        height: 10em;
        padding-right: 1px;
      }
      &__item {
        margin: 4px 0;
        padding: 8px;
        border-radius: 4px;
        &:first-child {
          margin-top: 0;
        }
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
  :global(.theme-dark) .comboBox {
    background-color: $theme-dark-bg-accent-color;
    border: solid 1px $theme-dark-bg-dark-color;
    &:hover {
      background-color: $theme-dark-bg-accent-hover;
      border-color: $theme-dark-bg-dark-hover;
    }
    .selectedItem {
      &__label {
        color: $theme-dark-content-color;
      }
      &__value {
        color: $theme-dark-content-dark-color;
      }
    }
    &-drop {
      background-color: $theme-dark-bg-accent-color;
      border: solid 1px $theme-dark-bg-dark-color;
      box-shadow: $theme-dark-shadow;
      &__item {
        color: $theme-dark-content-dark-color;
        &:hover {
          background-color: $theme-dark-bg-accent-hover;
        }
      }
      .selected {
        background-color: $theme-dark-bg-accent-hover;
        &:hover {
          background-color: $theme-dark-bg-accent-hover;
        }
      }
    }
  }
  :global(.theme-grey) .comboBox {
    background-color: $theme-grey-bg-accent-color;
    border: solid 1px $theme-grey-bg-dark-color;
    &:hover {
      background-color: $theme-grey-bg-accent-hover;
      border-color: $theme-grey-bg-dark-hover;
    }
    .selectedItem {
      &__label {
        color: $theme-grey-content-color;
      }
      &__value {
        color: $theme-grey-content-dark-color;
      }
    }
    &-drop {
      background-color: $theme-grey-bg-accent-color;
      border: solid 1px $theme-grey-bg-dark-color;
      box-shadow: $theme-grey-shadow;
      &__item {
        color: $theme-grey-content-dark-color;
        &:hover {
          background-color: $theme-grey-bg-accent-hover;
        }
      }
      .selected {
        background-color: $theme-grey-bg-accent-hover;
        &:hover {
          background-color: $theme-grey-bg-accent-hover;
        }
      }
    }
  }
  :global(.theme-light) .comboBox {
    background-color: $theme-light-bg-accent-color;
    border: solid 1px $theme-light-bg-dark-color;
    &:hover {
      background-color: $theme-light-bg-accent-hover;
      border-color: $theme-light-bg-dark-hover;
    }
    .selectedItem {
      &__label {
        color: $theme-light-content-color;
      }
      &__value {
        color: $theme-light-content-dark-color;
      }
    }
    &-drop {
      background-color: $theme-light-bg-accent-color;
      border: solid 1px $theme-light-bg-dark-color;
      box-shadow: $theme-light-shadow;
      &__item {
        color: $theme-light-content-dark-color;
        &:hover {
          background-color: $theme-light-bg-accent-hover;
        }
      }
      .selected {
        background-color: $theme-light-bg-accent-hover;
        &:hover {
          background-color: $theme-light-bg-accent-hover;
        }
      }
    }
  }

  :global(.theme-dark) .selectedCombo {
    background-color: $theme-dark-bg-accent-hover;
    border-color: $theme-dark-bg-dark-hover;
  }
  :global(.theme-grey) .selectedCombo {
    background-color: $theme-grey-bg-accent-hover;
    border-color: $theme-grey-bg-dark-hover;
  }
  :global(.theme-light) .selectedCombo {
    background-color: $theme-light-bg-accent-hover;
    border-color: $theme-light-bg-dark-hover;
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
  :global(.theme-dark) .arrowDown::after,
  :global(.theme-dark) .arrowDown::before {
    background-color: $theme-dark-content-color;
  }
  :global(.theme-grey) .arrowDown::after,
  :global(.theme-grey) .arrowDown::before {
    background-color: $theme-grey-content-color;
  }
  :global(.theme-light) .arrowDown::after,
  :global(.theme-light) .arrowDown::before {
    background-color: $theme-light-content-color;
  }
</style>
