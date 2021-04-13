<script lang="ts">
  import type { Platform } from '@anticrm/platform'
  import type { Asset } from '@anticrm/platform-ui'
  import ui from '@anticrm/platform-ui'
  import { getContext } from 'svelte'

  export let icon: Asset | undefined
  // --- prop 'size' in 'px': '12', '16', '24', '32', '42' --- //
  export let size = '16'
  export let button = false
  export let color = ''

  const platform = getContext('platform') as Platform
  let url
  $: url = platform.getMetadata(icon || ui.icon.Default) || 'https://anticrm.org/logo.svg'

  let fs, cl: string
  switch (size) {
    case '12':
      fs = 'icon-12'
      break
    case '24':
      fs = 'icon-24'
      break
    case '32':
      fs = 'icon-32'
      break
    case '42':
      fs = 'icon-42'
      break
    default:
      fs = 'icon-16'
  }
  if (button) cl = 'icon-button'
  else cl = 'icon'
</script>

<div style="width: {size}px; height: {size}px">
  <svg class="{cl} {fs}" style={color !== '' ? 'fill:' + color : ''}>
    <use href={url} />
  </svg>
</div>
