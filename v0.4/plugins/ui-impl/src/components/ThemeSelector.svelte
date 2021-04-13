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

<div>selector</div>