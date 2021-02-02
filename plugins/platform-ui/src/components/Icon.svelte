<script lang="ts">
  import type { Platform } from "@anticrm/platform";
  import ui, { Asset } from "@anticrm/platform-ui";
  import { getContext } from "svelte";

  export let icon: Asset | undefined
  export let className: string = ''
  export let fill: string = ''

  const platform = getContext("platform") as Platform;
  let url
  $: url = platform.getMetadata(icon || ui.icon.Default) || 'https://anticrm.org/logo.svg'
</script>

<svg class={className} style="{(fill !== '') ? 'fill:' + fill : ''}">
  <use href={url} />
</svg>
