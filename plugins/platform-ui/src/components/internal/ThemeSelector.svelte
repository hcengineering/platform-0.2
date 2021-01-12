<script lang="ts">
  import { getContext } from 'svelte'
  import { themes as _themes } from "@anticrm/sparkling-theme/src/themes";

  const { setTheme } = getContext('theme');
  function changeTheme(event: any): void {
    const sT = setTheme(event.srcElement.innerText);
  }
  const themes = [..._themes];

  let hidden = false;
  function toggleMenu (): void {
    hidden = !hidden;
  }
</script>

<div class="menu" on:mouseenter={toggleMenu} on:mouseleave={toggleMenu}>
  Темы
  <div class="subMenu" class:hidden={!hidden}>
    {#each themes as theme}
      <!-- svelte-ignore a11y-invalid-attribute -->
      <div class="item"><a on:click|preventDefault={changeTheme} href="#">{theme.name}</a></div>
    {/each}
  </div>
</div>

<style>
  .menu {
    position: relative;
    cursor: pointer;
    width: 100%;
  }
  .menu:hover {
    color: var(--theme-highlight-color);
  }
  .hidden {
    visibility: hidden;
  }
  .subMenu {
    width: 100%;
    position: absolute;
    display: flex;
    flex-direction: column;
  }
  .item {
    color: var(--theme-content-color);
  }
  .item:hover {
    color: var(--theme-highlight-color);
  }
</style>