<script lang="ts">
  import { getContext } from 'svelte'
  import Mute from './icons/Mute.svelte'
  import WiFi from './icons/WiFi.svelte'

  const { setTheme } = getContext('theme')
</script>

<div class="container">
  <div class="icon"><WiFi/></div>
  <div class="icon"><Mute/></div>
</div>

<style lang="scss">
  .container {
    display: flex;
    align-items: center;
    height: 56px;

    .icon {
      margin: 8px;
      width: 24px;
      height: 24px;
      stroke: var(--theme-caption-color);
      opacity: 0.3;
    }
  }
</style>