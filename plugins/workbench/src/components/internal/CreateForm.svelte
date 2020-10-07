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

<script lang="ts">
  import { Ref, Class, Doc, generateId, Space, VDoc, Classifier, Obj, mixinKey, CORE_MIXIN_INDICES } from '@anticrm/core'
  import core from '@anticrm/platform-core'
  import { createEventDispatcher } from 'svelte'
  import { AnyComponent } from '@anticrm/platform-ui'
  import presentation from '@anticrm/presentation'
  import { _getPresentationService, getComponentExtension, _getCoreService } from '../../utils'
  import { AttrModel, ClassModel } from '@anticrm/presentation'

  import AttributeEditor from '@anticrm/presentation/src/components/AttributeEditor.svelte'
  import Properties from '@anticrm/presentation/src/components/internal/Properties.svelte'

  export let title: string
  export let _class: Ref<Class<Doc>>
  export let space: Ref<Space>
  let object = {} as any

  let component: AnyComponent
  $: getComponentExtension(_class, presentation.class.DetailForm).then(ext => { component = ext })

  const coreService = _getCoreService()
  const dispatch = createEventDispatcher()

  function save() {
    const doc = { _class, _space: space, ...object }
    object = {}
    // absent VDoc fields will be autofilled
    coreService.createVDoc(doc as unknown as VDoc)
    dispatch('close')
  }

  let model: ClassModel | undefined
  let primary: AttrModel | undefined

  const primaryKey = mixinKey(CORE_MIXIN_INDICES, 'primary')

  function getPrimary (_class: Ref<Classifier<Doc>>): string | null {
    // TODO: temporary code
    let cls = _class as Ref<Class<Obj>> | undefined
    while (cls) {
      const clazz = coreService.getModel().get(cls) as Classifier<VDoc>
      const primary = (clazz as any)[primaryKey]
      if (primary) {
        console.log(`primary code for class ${_class}: ${primary}`)
        return primary
      }
      cls = clazz._extends
    }
    return null
  }

  const presentationService = _getPresentationService()
  console.log('presentationService', presentationService)

  $: {
    presentationService.getClassModel (_class, core.class.VDoc).then(m => { 
      const primaryKey = getPrimary(_class)
      if (primaryKey) {
        primary = m.getAttribute(primaryKey)
        model = m.filterAttributes([primaryKey]) 
      } else {
        primary = undefined
        model = m
      }
    })
  }    

</script>

<div class="recruiting-view">
  <div class="header">
    <div class="caption-4">{title} : {space}</div>
    <div class="actions">
      <button class="button" on:click={ () => { dispatch('close') } }>Cancel</button>
      <button class="button" on:click={save}>Save</button>
    </div>
  </div>

  <div class="content">
    { #if primary }
      <div class="caption-1"><AttributeEditor attribute={primary} bind:value={object[primary.key]} /></div>
    { /if }
    { #if model }
      <Properties {model} bind:object={object}/>
    { /if }
  </div>
</div>

<style lang="scss">  
  .recruiting-view {
    margin: 1em;
  }
  .header {
    display: flex;

    .actions {
      display: flex;
      flex-grow: 1;
      flex-direction: row-reverse;
      font-size: 10px;

      button {
        margin-left: 0.5em;
      }
    }
  }

  .content {
  }

  .attributes {
    display: flex;
    flex-wrap: wrap;

    //display: grid;
    //background-color: $content-color-dark;
    //grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    //grid-gap: 1px;

    margin-top: 1em;

    .group {
      padding: 0.5em;
      //background-color: $content-bg-color;
    }
  }
</style>