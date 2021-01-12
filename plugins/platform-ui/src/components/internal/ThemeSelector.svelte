<script lang="ts">
 	import { getContext } from 'svelte';
  import { writable } from "svelte/store";
  import { themes as _themes } from "@anticrm/sparkling-theme/src/themes";
  //import type { Theme } from "@anticrm/sparkling-theme/src/themes";
  //import Theme from '@anticrm/sparkling-theme/src/components/Theme.svelte';

  let { setTheme } = getContext('theme');
  function changeTheme(event): void {
    let sT = setTheme(event.srcElement.innerText);
  }
  let themes = [..._themes];

  let h = false;
  function toggleMenu () {
    h = !h;
  }
</script>

<div class="menu" on:mouseenter={toggleMenu} on:mouseleave={toggleMenu}>
  Темы
  <div class="subMenu" class:h={!h}>
    {#each themes as theme}
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
  .h {
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