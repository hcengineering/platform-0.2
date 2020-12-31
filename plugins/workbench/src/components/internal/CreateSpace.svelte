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
  import { Space, generateId, SpaceUser } from '@anticrm/core'
  import core from '@anticrm/core'
  import { createEventDispatcher } from 'svelte'
  import { AnyComponent } from '@anticrm/platform-ui'
  import presentation from '@anticrm/presentation'
  import { _getPresentationService, getComponentExtension, _getCoreService } from '../../utils'
  import { AttrModel, ClassModel } from '@anticrm/presentation'
  import AttributeEditor from '@anticrm/presentation/src/components/AttributeEditor.svelte'
  import Properties from '@anticrm/presentation/src/components/internal/Properties.svelte'

  let object = {} as any

  let component: AnyComponent
  const coreService = _getCoreService()
  const dispatch = createEventDispatcher()

  function save() {
    console.log('create', object)
    const space: Space = {      
      ...object,
      _id: generateId(),
      _class: core.class.Space,
      users: [{ userId: coreService.getUserId(), owner: true } as SpaceUser],
    }
    coreService.createDoc(space)
    dispatch('close')
  }
  let model: ClassModel | undefined
  let primary: AttrModel | undefined

  const presentationService = _getPresentationService()
  console.log('presentationService', presentationService)

  $: {
    getComponentExtension(core.class.Space, presentation.class.DetailForm).then((ext) => {
      component = ext
    })

    presentationService.getClassModel(core.class.Space, core.class.Doc).then((m) => {
      const mp = m.filterPrimary()
      model = mp.model
      primary = mp.primary
    })
  }
</script>

<style lang="scss">
  .space-view {
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
  .attributes {
    display: flex;
    flex-wrap: wrap;
    margin-top: 1em;
    .group {
      padding: 0.5em;
      //background-color: $content-bg-color;
    }
  }
</style>

<div class="space-view">
  <div class="header">
    <div class="caption-4" />
    <div class="actions">
      <button
        class="button"
        on:click={() => {
          dispatch('close')
        }}>Cancel</button>
      <button class="button" on:click={save}>Save</button>
    </div>
  </div>

  <div class="content">
    {#if primary}
      <div class="caption-1">
        <AttributeEditor attribute={primary} bind:value={object[primary.key]} />
      </div>
    {/if}
    {#if model}
      <Properties {model} bind:object />
    {/if}
  </div>
</div>
