<script type="ts">
  import Table from '../../Table.svelte'
  import type { Class, Ref } from '@anticrm/core'
  import type { Space, VDoc } from '@anticrm/domains'
  import { AttrModel, ClassModel, getEmptyModel, getPresentationService, liveQuery } from '../../../../index'
  import { CORE_CLASS_VDOC } from '@anticrm/domains'

  export let _class: Ref<Class<VDoc>>
  export let space: Space
  export let editable = false

  // bgm

  let model: ClassModel = getEmptyModel()
  let modelClass: Ref<Class<VDoc>>
  let attributes: AttrModel[] = []

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

  let objects: any[] = []

  $: lq = liveQuery(lq, _class, { _space: space._id }, (docs) => {
    objects = docs
  })
</script>

<Table {_class} on:open {editable} rows={objects} {attributes}/>
