<script lang="ts">
  import type { Status } from '@anticrm/status'

  import { Severity } from '@anticrm/status'
  import ui from '@anticrm/plugin-ui'

  import { Icon } from '@anticrm/sparkling-components'

  export let status: Status
</script>

<span>
  {#if status.severity === Severity.ERROR}
    <Icon icon={ui.icon.Error} color="#C21F39" />
  {/if}
  {status.message}
</span>
