<!--
// Copyright © 2021 Anticrm Platform Contributors.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
-->
<script lang="ts">
  import type { Class, Doc, Ref, RefTo } from '@anticrm/core'
  import type { AttrModel } from '@anticrm/presentation'
  import ui, { getCoreService, liveQuery } from '@anticrm/presentation'
  import type { AnyComponent } from '@anticrm/platform-ui'
  import Presenter from '../Presenter.svelte'
  import type { QueryUpdater } from '@anticrm/presentation'

  export let value: Ref<Doc>
  export let attribute: AttrModel
  export let editable: boolean

  let doc: Doc | undefined
  let presenter: AnyComponent

  const coreService = getCoreService()
  let lq: Promise<QueryUpdater<Doc>>
  $: lq = liveQuery<Doc>(lq, (attribute.type as RefTo<Doc>).to, { _id: value }, (docs) => {
    if (docs.length > 0) {
      doc = docs[0]
    } else {
      doc = undefined
    }
  })

  $: {
    coreService.then((cs) => {
      const model = cs.getModel()
      const objClass = (attribute.type as RefTo<Doc>).to
      const typeClass = model.get<Class<Doc>>(objClass as Ref<Class<Doc>>)
      if (!model.isMixedIn(typeClass, ui.mixin.Presenter)) {
        console.log(new Error(`no presenter for type '${objClass}'`))
        // Use string presenter
      } else {
        presenter = model.as(typeClass, ui.mixin.Presenter).presenter
      }
    })
  }
</script>

{#if doc && presenter}
  <Presenter is={presenter} value={doc} {attribute} {editable} />
{:else}
  {value}
{/if}
