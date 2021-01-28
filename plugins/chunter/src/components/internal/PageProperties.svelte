<!--
// Copyright © 2020 Anticrm Platform Contributors.
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
<script type="ts">
  import { Class, Obj, Ref } from '@anticrm/core'
  import { Page } from '../..'
  import { AttrModel, ClassModel, getPresentationService } from '@anticrm/presentation'

  import Properties from '@anticrm/presentation/src/components/internal/Properties.svelte'
  import AttributeEditor from '@anticrm/presentation/src/components/AttributeEditor.svelte'
  import Comments from './Comments.svelte'
  import { CORE_CLASS_VDOC } from '@anticrm/domains'

  export let _class: Ref<Class<Obj>>
  export let object: Page

  let model: ClassModel | undefined
  let title: AttrModel | undefined

  $: getPresentationService()
    .then((service) => service.getClassModel(_class, CORE_CLASS_VDOC))
    .then((m) => {
      title = m.getAttribute('title')
      model = m.filterAttributes(['title'])
    })
</script>

{#if model  && title}
  <div>
    <div class="caption-1">
      <AttributeEditor attribute={title} bind:value={object.title} />
    </div>
  </div>
  <Properties {model} bind:object />
  <Comments {object} />
{/if}
