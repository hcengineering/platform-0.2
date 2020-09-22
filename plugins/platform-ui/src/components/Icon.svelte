<script lang="ts">
  import type { Platform } from "@anticrm/platform";
  import ui, { Asset } from "@anticrm/platform-ui";
  import { getContext } from "svelte";

  export let icon: Asset | undefined
  export let clazz: string = ''
  export let style: string = ''

  const platform = getContext("platform") as Platform;
  const url = platform.getMetadata(icon || ui.icon.Default) || 'https://anticrm.org/logo.svg'
</script>

<svg class={clazz} {style}>
  <use xlink:href={url} />
</svg>
