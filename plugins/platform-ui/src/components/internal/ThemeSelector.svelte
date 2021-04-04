<script lang="ts">
  import { getContext } from 'svelte'
  import { themes as _themes } from '@anticrm/sparkling-theme/src/themes'

  const { setTheme } = getContext('theme')
  function changeTheme (event: any): void {
    setTheme(event.srcElement.innerText)
    window.removeEventListener('click', handler)
  }
  const themes = [..._themes]

  function handler (event: MouseEvent) {
    const cl = event.target.classList[0]
    if (cl !== 'item' && cl !== 'menu') {
      hidden = !hidden
      window.removeEventListener('click', handler)
    }
  }

  let hidden = false
  function toggleMenu (): void {
    hidden = !hidden
    if (hidden) {
      window.addEventListener('click', handler)
    } else {
      window.removeEventListener('click', handler)
    }
  }
</script>

<div class="menu noselect" on:click={toggleMenu}>
  Темы
  <div class="subMenu" class:hidden={!hidden}>
    {#each themes as theme}
      <div class="item" class:hidden={!hidden} on:click|preventDefault={changeTheme}>
        {theme.name}
      </div>
    {/each}
  </div>
</div>

<style>
  .menu {
    position: relative;
    cursor: pointer;
  }
  .menu:hover {
    color: var(--theme-doclink-color);
  }
  .hidden {
    visibility: hidden;
  }
  .subMenu {
    background-color: var(--theme-bg-color);
    border: 1px solid var(--theme-bg-accent-color);
    border-radius: 0px 0px 4px 4px;
    width: 10em;
    right: calc(-1em - 1px);
    padding: 1em;
    text-align: right;
    position: absolute;
    display: flex;
    flex-direction: column;
    z-index: 100;
  }
  .item {
    padding: 0.5em;
    border-radius: 4px;
    color: var(--theme-content-color);
  }
  .item:hover {
    color: var(--theme-doclink-color);
    background-color: var(--theme-bg-accent-color);
  }
</style>
