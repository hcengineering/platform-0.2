<script lang="ts">
  import { getContext } from 'svelte'
  // import PopupMenu from '@anticrm/sparkling-controls/src/menu/PopupMenu.svelte'
  // import PopupItem from '@anticrm/sparkling-controls/src/menu/PopupItem.svelte'

  const { setTheme } = getContext('theme')
</script>

<!-- <PopupMenu>
  <div class="popup" slot="trigger">Themes</div>
  <PopupItem
    on:click={() => {
      setTheme('theme-dark')
    }}>Dark</PopupItem>
  <PopupItem
    on:click={() => {
      setTheme('theme-grey')
    }}>Grey</PopupItem>
  <PopupItem
    on:click={() => {
      setTheme('theme-light')
    }}>Light</PopupItem>
</PopupMenu> -->

<div class="container">
  <img class="icons" src="../../img/wi-fi.svg" alt="Wi-Fi">
  <img class="icons" src="../../img/mute.svg" alt="Mute">
</div>

<style lang="scss">
  .container {
    display: flex;
    align-items: center;
    height: 100%;

    .icons {
      margin: 8px;
      width: 24px;
      height: 24px;
    }
  }
</style>