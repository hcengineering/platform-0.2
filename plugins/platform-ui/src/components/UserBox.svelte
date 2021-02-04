<script lang='ts'>
  import UserInfo from '@anticrm/sparkling-controls/src/UserInfo.svelte'
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import Icon from './Icon.svelte'
  import EditBox from './EditBox.svelte'
  import workbench from '@anticrm/workbench'

  export let items: Array
  export let selected: number = 0

  let comboHidden: boolean = true
  let comboRoot: HTMLElement
  let comboDrop: HTMLElement
  let comboItems: HTMLElement

  function showCombo(): void {
    const rect = comboRoot.getBoundingClientRect()
    comboDrop.style.top = rect.height - 2 + 'px'
    comboDrop.style.left = '4px'
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
      if (el.className === comboRoot.className) pathRoot = true
      if (el.className === comboDrop.className) pathDrop = true
      if (el.className === comboItems.className) pathItems = true
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

<div bind:this={comboRoot} class="comboBox" on:click={handler}>
  <UserInfo url={items[selected].url} title={items[selected].name} subtitle="Исполнитель" />
  <Icon icon={workbench.icon.ArrowDown} className="icon-embed" />

  <div bind:this={comboDrop} class="comboBox-drop">
    <EditBox id='select-user-combobox' icon={workbench.icon.Finder} iconRight='true' width='100%' />
    <div class="separator"></div>
    <div bind:this={comboItems} class="comboBox-drop__items">
      <ScrollView stylez="height:100%;width: 100%;">
        {#each items as item (item.id)}
          <div class="comboBox-drop__item" class:selected={item.id === selected}
               on:click={() => { selected = item.id }}>
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
    background-color: var(--theme-bg-color);
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
      box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
    }
    &:hover comboBox-drop {
      box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
    }

    &-drop {
      position: absolute;
      visibility: hidden;
      display: flex;
      flex-direction: column;
      width: calc(100% - 10px - 2em);
      background-color: var(--theme-bg-color);
      border: solid 1px var(--theme-bg-dark-color);
      border-radius: 0px 0px 4px 4px;
      padding: 1em;
      z-index: 1000;

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
        background-color: var(--theme-bg-accent-color);
        &:hover {
          background-color: var(--theme-bg-accent-hover);
        }
      }

      .separator {
        height: .5em;
      }
    }
  }
</style>