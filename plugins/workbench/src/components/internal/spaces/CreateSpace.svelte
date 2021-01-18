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
  import presentation from '@anticrm/presentation'
  import { getPresentationService, getComponentExtension, _getCoreService } from '../../../utils'
  import { AttrModel, ClassModel } from '@anticrm/presentation'
  import AttributeEditor from '@anticrm/presentation/src/components/AttributeEditor.svelte'
  import Properties from '@anticrm/presentation/src/components/internal/Properties.svelte'
  import { getSpaceName } from './utils'
  import { AnyLayout, Property, StringProperty } from '@anticrm/model'

  let object = {} as any

  const coreService = _getCoreService()
  const dispatch = createEventDispatcher()

  async function save() {
    const space = {
      ...object,
      users: [
        { userId: coreService.getUserId() as StringProperty, owner: true as Property<boolean, boolean> } as AnyLayout
      ]
    }
    coreService.create(core.class.Space, space)
    dispatch('close')
  }
  let model: ClassModel | undefined
  let primary: AttrModel | undefined

  const presentationService = getPresentationService()
  console.log('presentationService', presentationService)

  $: {
    presentationService.then((ps) =>
      ps.getClassModel(core.class.Space, core.class.Doc).then((m) => {
        const mp = m.filterPrimary()
        model = mp.model
        primary = mp.primary
      })
    )
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
  }
  .separator {
    width: 1em;
  }
  .space-kind {
    width: 1em;
    text-align: right;
  }
  .space-caption-1 {
    display: flex;
  }
</style>

<div class="space-view">
  <div class="header">
    <div class="caption-4">Create a new Space</div>
    <div class="actions">
      <button class="button" on:click={() => dispatch('close')}>Cancel</button>
      <button class="button" on:click={save}>Create</button>
      <div class="separator" />
      <button class="button" on:click={() => dispatch('browse')}>Browse space</button>
    </div>
  </div>

  <div class="content">
    {#if primary}
      <div class="caption-1 space-caption-1">
        <div class="space-kind">{getSpaceName(object, false)}</div>
        <AttributeEditor attribute={primary} bind:value={object[primary.key]} />
      </div>
    {/if}
    {#if model}
      <Properties {model} bind:object />
    {/if}
  </div>
</div>
