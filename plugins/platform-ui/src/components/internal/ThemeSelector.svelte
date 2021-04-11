<script lang="ts">
  import { getContext } from 'svelte'
  import { themes as _themes } from '@anticrm/sparkling-theme/src/themes'
  import PopupMenu from '@anticrm/sparkling-controls/src/menu/PopupMenu.svelte'
  import PopupItem from '@anticrm/sparkling-controls/src/menu/PopupItem.svelte'

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

<PopupMenu>
  <div class="popup" slot="trigger">Themes</div>
  <PopupItem on:click={() => { setTheme('theme-dark') }}>Dark</PopupItem>
  <PopupItem on:click={() => { setTheme('theme-grey') }}>Grey</PopupItem>
  <PopupItem on:click={() => { setTheme('theme-light') }}>Light</PopupItem>
</PopupMenu>

<style>

</style>
