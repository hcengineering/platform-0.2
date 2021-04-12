<script lang="ts">
  import type { Status } from '@anticrm/platform'

  import { Severity } from '@anticrm/platform'
  import ui from '@anticrm/platform-ui'

  import Icon from '../Icon.svelte'

  export let status: Status
</script>

<span>
  {#if status.severity === Severity.ERROR}
    <Icon icon={ui.icon.Error} color="#C21F39" />
  {/if}
  {status.message}
</span>
