<script lang="ts">
  export let onTop = 2
  export let actions: Array<unknown> = []

  function getStyle (pos: number, total: number, onTop: number): string {
    if (total === 1) {
      return 'w100' // A full row, since one item
    }
    if (pos === 0) {
      return 'abLeft w100'
    }
    if (pos === total - 1 && total === onTop) {
      // All items are on top, we need to add right style
      return 'abRight w100'
    }
    if (pos < onTop) {
      return 'abCenter w100'
    }
    return 'popup-item'
  }

  // Popup
  let thisPopup: HTMLElement
  let thisTrigger: HTMLElement
  let visible = false

  if (onTop < 0) onTop = 2
  if (onTop > actions.length) onTop = actions.length

  function handleAction (action: any) {
    action.action?.()
  }
</script>

<svelte:window
  on:click={() => {
    visible = false
  }} />
<div class="actionBar-view">
  {#each actions.slice(0, onTop) as item}
    {#if item.label !== '-'}
      <button
        class="button actionButton {getStyle(actions.indexOf(item), actions.length, onTop)}"
        class:toggleState={item.toggleState}
        on:click={() => {
          item.action()
          visible = false
        }}>{item.label}</button>
    {/if}
  {/each}
  {#if actions.length - onTop > 0}
    <button
      bind:this={thisTrigger}
      class="button actionButton {onTop !== 0 ? 'abRight' : ''} w100 wOther"
      class:selected={visible}
      on:click|stopPropagation={() => {
        visible = !visible
      }}>
      <div class="chevron">
        <span>Ещё</span>
        <span class="arrowDown" />
      </div>
      {#if visible}
        <div bind:this={thisPopup} class="popup-menu-view">
          {#each actions.slice(onTop) as popup}
            {#if popup.label === '-'}
              <div class="popup-separator" />
            {:else}
              <button class="popup-item" on:click={handleAction(popup)}>{popup.label}</button>
            {/if}
          {/each}
        </div>
      {/if}
    </button>
  {/if}
</div>

<style lang="scss">
  @import '~@anticrm/sparkling-theme/styles/_global.scss';

  .actionBar-view {
    display: flex;
    flex-direction: row;
    margin: 0;
    padding: 0;
  }

  .button {
    display: inline-block;
    height: 32px;
    border: 1px solid transparent;
    border-radius: 4px;
    padding: 0.5em 1.33em 0.5em;
    box-sizing: border-box;
    cursor: pointer;
    user-select: none;
    text-align: center;
    font: inherit;
    font-weight: 500;
    transition: border-color 0.2s, color 0.2s, background-color 0.2s;
    &:focus {
      outline: none;
    }
  }
  :global(.theme-dark) .button {
    border-color: $theme-dark-bg-dark-color;
    color: $theme-dark-content-color;
    background-color: $theme-dark-bg-accent-color;
    &:hover {
      border-color: $theme-dark-bg-dark-hover;
      background-color: $theme-dark-bg-accent-hover;
      color: $theme-dark-content-dark-color;
    }
  }
  :global(.theme-grey) .button {
    border-color: $theme-grey-bg-dark-color;
    color: $theme-grey-content-color;
    background-color: $theme-grey-bg-accent-color;
    &:hover {
      border-color: $theme-grey-bg-dark-hover;
      background-color: $theme-grey-bg-accent-hover;
      color: $theme-grey-content-dark-color;
    }
  }
  :global(.theme-light) .button {
    border-color: $theme-light-bg-dark-color;
    color: $theme-light-content-color;
    background-color: $theme-light-bg-accent-color;
    &:hover {
      border-color: $theme-light-bg-dark-hover;
      background-color: $theme-light-bg-accent-hover;
      color: $theme-light-content-dark-color;
    }
  }

  .error {
    width: 100%;
    text-align: center;
    font-weight: 500;
    border-radius: 4px;
    color: $theme-status-maroon-color;
  }
  :global(.theme-dark) .error {
    background-color: $theme-dark-bg-accent-color;
  }
  :global(.theme-grey) .error {
    background-color: $theme-grey-bg-accent-color;
  }
  :global(.theme-light) .error {
    background-color: $theme-light-bg-accent-color;
  }

  .actionButton {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25em;
  }
  :global(.theme-dark) .actionButton {
    color: $theme-dark-content-dark-color;
  }
  :global(.theme-grey) .actionButton {
    color: $theme-grey-content-dark-color;
  }
  :global(.theme-light) .actionButton {
    color: $theme-light-content-dark-color;
  }

  .abLeft {
    border-radius: 4px 0 0 4px;
    border-right: none;
  }

  .abCenter {
    border-radius: 0px;
    border-right: none;
  }

  .abRight {
    border-radius: 0 4px 4px 0;
  }

  :global(.theme-dark) .selected {
    background-color: $theme-dark-bg-accent-hover;
    border-color: $theme-dark-bg-dark-hover;
  }
  :global(.theme-grey) .selected {
    background-color: $theme-grey-bg-accent-hover;
    border-color: $theme-grey-bg-dark-hover;
  }
  :global(.theme-light) .selected {
    background-color: $theme-light-bg-accent-hover;
    border-color: $theme-light-bg-dark-hover;
  }

  .toggleState {
    font-weight: bold;
  }
  :global(.theme-dark) .toggleState {
    background-color: $theme-dark-bg-dark-color;
  }
  :global(.theme-grey) .toggleState {
    background-color: $theme-grey-bg-dark-color;
  }
  :global(.theme-light) .toggleState {
    background-color: $theme-light-bg-dark-color;
  }

  .popup-separator {
    height: 1px;
  }
  :global(.theme-dark) .popup-separator {
    background-color: $theme-dark-bg-dark-color;
  }
  :global(.theme-grey) .popup-separator {
    background-color: $theme-grey-bg-dark-color;
  }
  :global(.theme-light) .popup-separator {
    background-color: $theme-light-bg-dark-color;
  }

  .w100 {
    flex-basis: 100%;
    width: 100%;
  }

  .wOther {
    display: block;

    .chevron {
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
      display: flex;
    }

    .popup-menu-view {
      position: relative;
      display: flex;
      flex-direction: column;
      flex-flow: column nowrap;
      border: solid 1px transparent;
      border-radius: 4px;
      margin: 10px -0.25em 0 -0.25em;
      padding: 4px 8px;
      z-index: 1000;

      .popup-item {
        margin: 4px 0;
        padding: 8px;
        border-radius: 4px;
        border: none;
        text-align: left;
        cursor: pointer;
      }
    }
  }
  :global(.theme-dark) .popup-menu-view {
    background-color: $theme-dark-bg-accent-color;
    border-color: $theme-dark-bg-dark-color;
    box-shadow: $theme-dark-shadow;
    .popup-item {
      background-color: $theme-dark-bg-accent-color;
      color: $theme-dark-content-dark-color;
      &:hover {
        background-color: $theme-dark-bg-accent-hover;
      }
    }
  }
  :global(.theme-grey) .popup-menu-view {
    background-color: $theme-grey-bg-accent-color;
    border-color: $theme-grey-bg-dark-color;
    box-shadow: $theme-grey-shadow;
    .popup-item {
      background-color: $theme-grey-bg-accent-color;
      color: $theme-grey-content-dark-color;
      &:hover {
        background-color: $theme-grey-bg-accent-hover;
      }
    }
  }
  :global(.theme-light) .popup-menu-view {
    background-color: $theme-light-bg-accent-color;
    border-color: $theme-light-bg-dark-color;
    box-shadow: $theme-light-shadow;
    .popup-item {
      background-color: $theme-light-bg-accent-color;
      color: $theme-light-content-dark-color;
      &:hover {
        background-color: $theme-light-bg-accent-hover;
      }
    }
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

  button + button {
    margin-left: 0;
  }
</style>
