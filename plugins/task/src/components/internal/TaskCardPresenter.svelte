<script type="ts">
  import Table from '@anticrm/presentation/src/components/internal/Table.svelte'
  import { Class, Doc, Ref } from '@anticrm/core'
  import { Space } from '@anticrm/domains'

  export let _class: Ref<Class<Doc>>
  export let space: Ref<Space>

</script>

CARD PRESENTER
<Table {_class} {space} on:open />
