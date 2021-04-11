<script lang="ts">
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'

  export let kind = 'transparent'
  export const width = 150
  export let visible = 'hidden'

  let thisPopup: HTMLElement
  let thisTrigger: HTMLElement
  let firstOpen = true

  function handler (event: MouseEvent): void {
    const rectPopup = thisPopup.getBoundingClientRect()
    const rectTrigger = thisTrigger.getBoundingClientRect()
    const rectBody = document.body.getBoundingClientRect()
    if (rectTrigger.left + rectPopup.width >= rectBody.width) thisPopup.style.right = '1em'
    else thisPopup.style.left = `${rectTrigger.left}px`
    thisPopup.style.top = `${rectTrigger.y + rectTrigger.height + 1}px`

    if (firstOpen) {
      firstOpen = false
    } else {
      if (visible === 'visible') {
        visible = 'hidden'
        window.removeEventListener('click', handler)
      }
    }
  }

  $: {
    if (visible === 'visible') {
      firstOpen = true
      window.addEventListener('click', handler, false)
    } else {
      window.removeEventListener('click', handler)
    }
  }
</script>

<Button
  {kind}
  on:click={() => {
    if (visible === 'hidden') visible = 'visible'
    else visible = 'hidden'
  }}>
  <slot name="trigger">+</slot>
</Button>
<div bind:this={thisTrigger} />
<div bind:this={thisPopup} class="popup-menu-view" style="width: {width}px; visibility: {visible}">
  <slot />
</div>

<style lang="scss">
  @import "~@anticrm/sparkling-theme/styles/_global.scss";

  .popup-menu-view {
    position: fixed;
    display: flex;
    flex-direction: column;
    flex-flow: column nowrap;
    border-radius: 4px;
    padding: 4px 8px;
    z-index: 1000;
  }
  :global(.theme-dark) .popup-menu-view {
    background-color: $theme-dark-bg-color;
    border: solid 1px $theme-dark-bg-accent-color;
    box-shadow: $theme-dark-shadow;
  }
  :global(.theme-grey) .popup-menu-view {
    background-color: $theme-grey-bg-color;
    border: solid 1px $theme-grey-bg-accent-color;
    box-shadow: $theme-grey-shadow;
  }
  :global(.theme-light) .popup-menu-view {
    background-color: $theme-light-bg-color;
    border: solid 1px $theme-light-bg-accent-color;
    box-shadow: $theme-light-shadow;
  }
</style>
