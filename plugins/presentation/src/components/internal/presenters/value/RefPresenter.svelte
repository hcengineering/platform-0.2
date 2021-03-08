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
  import { Class, Doc, Ref, RefTo, Type } from '@anticrm/core'
  import ui, { AttrModel } from '@anticrm/presentation'
  import { AnyComponent, getCoreService } from '@anticrm/platform-ui'
  import { onDestroy } from 'svelte'
  import Presenter from '../Presenter.svelte'

  export let value: Ref<Doc>
  export let attribute: AttrModel
  export let editable: boolean

  let doc: Doc
  let presenter: AnyComponent

  const update = getCoreService().subscribe((attribute.type as RefTo<Doc>).to, { _id: value }, (docs) => {
    if (docs.length > 0) {
      doc = docs[0]
    } else {
      doc = undefined
    }
  }, onDestroy)

  const model = getCoreService().getModel()

  $: {
    const objClass = (attribute.type as RefTo<Doc>).to
    update(objClass, { _id: value })

    const typeClass = model.get(objClass) as Class<Type>
    if (!model.isMixedIn(typeClass, ui.mixin.Presenter)) {
      console.log(new Error(`no presenter for type '${objClass}'`))
      // Use string presenter
    } else {
      presenter = model.as(typeClass, ui.mixin.Presenter).presenter
    }
  }
</script>

{#if doc && presenter }
  <Presenter is={presenter} value={doc} {attribute} />
{:else}
  {value}
{/if}


