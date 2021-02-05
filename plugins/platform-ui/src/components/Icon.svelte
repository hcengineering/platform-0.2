<script lang="ts">
  import type { Platform } from "@anticrm/platform";
  import ui, { Asset } from "@anticrm/platform-ui";
  import { getContext } from "svelte";

  export let icon: Asset | undefined
  // --- prop 'size' in 'px': '16', '24', '32', '42' --- //
  export let size: string = '16'
  export let button: boolean = false
  export let color: string = ''

  const platform = getContext("platform") as Platform;
  let url
  $: url = platform.getMetadata(icon || ui.icon.Default) || 'https://anticrm.org/logo.svg'

  let fs, cl: string
  switch (size) {
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

<svg class='{cl} {fs}' style="{(color !== '') ? 'fill:' + color : ''}">
  <use href={url} />
</svg>
