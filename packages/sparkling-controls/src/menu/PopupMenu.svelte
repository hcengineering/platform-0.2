<script lang='ts'>
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'

  export let kind: string = 'transparent'
  export const width: Number = 150
  export let visible: String = 'hidden'

  let thisPopup: HTMLElement
  let thisTrigger: HTMLElement
  let firstOpen: boolean = true

  function handler(event: MouseEvent): void {
    const rectPopup = thisPopup.getBoundingClientRect()
    const rectTrigger = thisTrigger.getBoundingClientRect()
    const rectBody = document.body.getBoundingClientRect()
    if (rectTrigger.left + rectPopup.width >= rectBody.width) thisPopup.style.right = '1em'
    else thisPopup.style.left = rectTrigger.left + 'px'
    thisPopup.style.top = rectTrigger.y + rectTrigger.height + 1 + 'px'

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


<Button {kind}
  on:click={() => {
    if (visible === 'hidden') visible = 'visible'
    else visible = 'hidden'
  }}>
  <slot name='trigger'>+</slot>
</Button>
<div bind:this={thisTrigger}></div>
<div bind:this={thisPopup} class="popup-menu-view" style='width: {width}px; visibility: {visible}'>
  <slot />
</div>

<style lang="scss">
  .popup-menu-view {
    position: fixed;
    display: flex;
    flex-direction: column;
    flex-flow: column nowrap;
    background-color: var(--theme-bg-accent-color);
    border: solid 1px var(--theme-bg-dark-color);
    border-radius: 4px;
    padding: 4px 8px;
    box-shadow: var(--theme-shadow);
    z-index: 1000;
  }
</style>