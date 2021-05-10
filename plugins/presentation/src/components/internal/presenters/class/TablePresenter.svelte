<script type="ts">
  import Table from '../../Table/Table.svelte'
  import type { Class, Ref } from '@anticrm/core'
  import type { Space, VDoc } from '@anticrm/domains'
  import {
    AttrModel,
    ClassModel,
    getCoreService,
    getEmptyModel,
    getPresentationService,
    liveQuery
  } from '../../../../index'
  import { CORE_CLASS_VDOC } from '@anticrm/domains'
  import { CoreService, QueryUpdater } from '@anticrm/platform-core'
  import TableControls from '../../Table/TableControls.svelte'
  import { Model } from '@anticrm/core'

  export let _class: Ref<Class<VDoc>>
  export let space: Space
  export let editable = false

  let model: ClassModel = getEmptyModel()
  let modelClass: Ref<Class<VDoc>>
  let attributes: AttrModel[] = []

  let offset = 0
  let total = 0
  let pos = 0
  const limit = 100
  let sort: object

  let coreService: CoreService
  let coreModel: Model

  getCoreService().then((cs) => {
    coreService = cs
    coreModel = cs.getModel()
  })

  $: {
    if (_class && _class !== modelClass) {
      getPresentationService()
        .then((p) => p.getClassModel(_class, CORE_CLASS_VDOC))
        .then((m) => {
          model = m
          modelClass = _class
          attributes = model.getAttributes()
        })
    }
  }

  let objects: VDoc[] = []
  let lq: Promise<QueryUpdater<VDoc>>
  $: lq = liveQuery<VDoc>(
    lq,
    _class,
    { _space: space._id as Ref<Space> },
    (docs) => {
      objects = docs
    },
    {
      limit,
      skip: pos,
      countCallback: (skip, limit, count) => {
        offset = skip
        total = count
      },
      sort
    }
  )

  function onSort ({ detail }: CustomEvent) {
    if (!detail.order) {
      delete sort[detail.key]
      return
    }
    sort = { ...sort, [detail.key]: detail.order }
  }

  function onSearch ({ detail }) {
    // TODO: implement search in chosen attributes
  }
</script>

<div class="table-component">
  <TableControls on:search={onSearch} {offset} {total} bind:pos />
  <Table {_class} on:open on:sort={onSort} {editable} rows={objects} {attributes} />
</div>

<style lang="scss">
  .table-component {
    padding: 20px;
    // display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
