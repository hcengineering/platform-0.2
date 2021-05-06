<script type="ts">
  import type { Class, DocumentQuery, Ref } from '@anticrm/core'
  import type { Space, VDoc } from '@anticrm/domains'
  import Table from '../../Table.svelte'

  export let _class: Ref<Class<VDoc>>
  export let space: Space | undefined
  export let editable = false

  function query (space: Space | undefined): DocumentQuery<VDoc> {
    if (space !== undefined) {
      return { _space: space._id as Ref<Space> }
    }
    return {}
  }
</script>

<Table {_class} query={query(space)} on:open {editable} />
