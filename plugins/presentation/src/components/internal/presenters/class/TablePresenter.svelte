<script type="ts">
  import Table from '../../Table.svelte'
  import type { Class, Ref } from '@anticrm/core'
  import type { Space, VDoc } from '@anticrm/domains'

  export let _class: Ref<Class<VDoc>>
  export let space: Space
  export let editable = false
</script>

<Table {_class} {space} on:open {editable} />
