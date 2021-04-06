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
  .actionBar-view {
    display: flex;
    flex-direction: row;
    margin: 0;
    padding: 0;
  }

  .button {
    display: inline-block;
    height: 32px;
    border: 1px solid var(--theme-bg-dark-color);
    border-radius: 4px;
    padding: 0.5em 1.33em 0.5em;
    box-sizing: border-box;
    cursor: pointer;
    user-select: none;
    text-align: center;

    font: inherit;
    font-weight: 500;

    color: var(--theme-content-color);
    background-color: var(--theme-bg-accent-color);
    transition: border-color 0.2s, color 0.2s, background-color 0.2s;

    &:focus {
      outline: none;
    }
    &:hover {
      border-color: var(--theme-bg-dark-hover);
      background-color: var(--theme-bg-accent-hover);
      color: var(--theme-content-dark-color);
    }
  }

  .error {
    width: 100%;
    text-align: center;
    font-weight: 500;
    background-color: var(--theme-bg-accent-color);
    border-radius: 4px;
    color: var(--status-maroon-color);
  }

  .actionButton {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25em;
    color: var(--theme-content-dark-color);
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

  .selected {
    background-color: var(--theme-bg-accent-hover);
    border-color: var(--theme-bg-dark-hover);
  }

  .toggleState {
    background-color: var(--theme-bg-dark-color);
    font-weight: bold;
  }

  .popup-separator {
    height: 1px;
    background-color: var(--theme-bg-dark-color);
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
      background-color: var(--theme-bg-accent-color);
      border: solid 1px var(--theme-bg-dark-color);
      border-radius: 4px;
      margin: 10px -0.25em 0 -0.25em;
      padding: 4px 8px;
      box-shadow: var(--theme-shadow);
      z-index: 1000;

      .popup-item {
        margin: 4px 0;
        padding: 8px;
        background-color: var(--theme-bg-accent-color);
        border-radius: 4px;
        border: none;
        text-align: left;
        color: var(--theme-content-dark-color);
        cursor: pointer;

        &:hover {
          background-color: var(--theme-bg-accent-hover);
        }
      }
    }
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

  button + button {
    margin-left: 0;
  }
</style>
