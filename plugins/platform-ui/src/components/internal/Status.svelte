<script lang="ts">
  import type { Status } from "@anticrm/platform";
  import type { Asset } from "@anticrm/platform-ui";

  import { Severity } from "@anticrm/platform";
  import ui from "@anticrm/platform-ui";

  import Icon from "../Icon.svelte";

  export let status: Status;
</script>

<span>
  {#if status.severity === Severity.ERROR}
    <span style="fill: #C21F39">
      <Icon icon={ui.icon.Error} clazz="icon-embed" />
    </span>
  {/if}
  {status.message}
</span>
