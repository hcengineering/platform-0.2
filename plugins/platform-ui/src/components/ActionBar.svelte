<script lang='ts'>
  import Icon from './Icon.svelte'
  import ui from '../'

  interface Action {
    name: String
    action: () => void
  }

  interface ActionF {
    id: Number
    style: String
    name: String
    action: () => void
  }

  export let onTop: Number = 2
  export let actions: Array<Action>

  // Format list
  let items: Array<ActionF> = []
  let popups: Array<ActionF> = []
  let error: boolean = false

  function formatActions(its: Array<Action>): Array {
    let ac: Array<ActionF> = []
    let acP: Array<ActionF> = []
    ac.push({ id: 0, style: 'abLeft w100', name: its[0].name, action: its[0].action })
    for(let i = 1; i < its.length; i++) {
      if (i < onTop) ac.push({ id: i, style: 'abCenter w100', name: its[i].name, action: its[i].action })
      else acP.push({ id: i, style: 'popup-item', name: its[i].name, action: its[i].action })
    }
    return Array(ac, acP)
  }

  $: {
    if ((typeof(actions) === 'undefined') || (actions.length == 0) || (actions.length < onTop)) {
      error = true
      items.push({ id: 0, name: 'Ошибка!' })
    } else {
      if (actions.length === 1) {
        items.push({ id: 0, style: 'w100', name: actions[0].name, action: actions[0].action })
      } else if ((actions.length == 2) && (onTop == 2)) {
        items.push({ id: 0, style: 'abLeft w100', name: actions[0].name, action: actions[0].action })
        items.push({ id: 1, style: 'abRight w100', name: actions[1].name, action: actions[1].action })
      } else {
        let arr: Array = formatActions(actions)
        items = arr[0]
        popups = arr[1]
      }
    }
  }

  // Popup
  let thisPopup: HTMLElement
  let thisTrigger: HTMLElement
  let firstOpen: boolean = true
  let visible: String = 'hidden'

  function handler(event: MouseEvent): void {
    const rectPopup = thisPopup.getBoundingClientRect()
    const rectTrigger = thisTrigger.getBoundingClientRect()
    const rectBody = document.body.getBoundingClientRect()
    if (rectTrigger.left + rectPopup.width >= rectBody.width) thisPopup.style.right = rectBody.width - rectTrigger.right + 'px'
    else thisPopup.style.left = rectTrigger.left + 'px'
    thisPopup.style.top = rectTrigger.y + rectTrigger.height - 1 + 'px'

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

<div class='actionBar-view'>
  {#if error}
    <div class="error">{items[0].name}</div>
  {:else}
    {#each items as item (item.id)}
      <button class='button actionButton {item.style}' on:click={item.action}>{item.name}</button>
    {/each}
    {#if popups.length > 0}
      <button bind:this={thisTrigger} class='button actionButton abRight wOther'
        on:click={() => {
          if (visible === 'hidden') visible = 'visible'
          else visible = 'hidden'
        }}><span>Ещё</span><Icon icon={ui.icon.ArrowDown} className='icon-embed' />
      </button>
      <div bind:this={thisPopup} class='popup-menu-view' style='width: 150px; visibility: {visible}'>
        {#each popups as popup (popup.id)}
          <button class='button actionButton {popup.style}' on:click={popup.action}>{popup.name}</button>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style lang="scss">
  .actionBar-view {
    display: flex;
    flex-direction: row;
    margin: 1em 0;
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
  .popup-item {
    border-radius: 0;
    border: none;
  }
  .w100 {
    flex-basis: 100%;
    width: 100%;
  }
  .wOther {
    flex-basis: 80px;
    width: 80px;
    &>span {
      margin-right: 5px;
    }
  }

  .popup-menu-view {
    position: fixed;
    display: flex;
    flex-direction: column;
    flex-flow: column nowrap;
    background-color: var(--theme-bg-accent-color);
    border: solid 1px var(--theme-bg-dark-color);
    border-radius: 4px;
    padding: .5em 0;
    box-shadow: 0px 6px 9px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }
</style>