<script lang="ts">
  import type { Platform } from "@anticrm/platform";
  import ui, { Asset } from "@anticrm/platform-ui";
  import { getContext } from "svelte";

  export let icon: Asset | undefined
  export let clazz: string = ''

  const platform = getContext("platform") as Platform;
  let url
  $: url = platform.getMetadata(icon || ui.icon.Default) || 'https://anticrm.org/logo.svg'
</script>

<svg class={clazz}>
  <use href={url} />
</svg>
