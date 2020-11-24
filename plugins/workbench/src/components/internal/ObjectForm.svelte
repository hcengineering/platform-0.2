<script lang="ts">
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
  import { Class, Ref, VDoc } from '@anticrm/core'
  import { AnyComponent } from '@anticrm/platform-ui'
  import Component from '@anticrm/platform-ui/src/components/Component.svelte'
  import presentation from '@anticrm/presentation'
  import { createEventDispatcher, onDestroy } from 'svelte'
  import { getComponentExtension, getCoreService, query } from '../../utils'

  export let title: string
  export let _class: Ref<Class<VDoc>>
  export let _id: Ref<VDoc>

  let object: VDoc | undefined

  let unsubscribe: () => void

  $: {
    if (unsubscribe) {
      unsubscribe()
    }
    unsubscribe = query(_class, { _id }, (docs) => {
      object = docs.length > 0 ? docs[0] : undefined
    })
  }

  onDestroy(() => {
    if (unsubscribe) unsubscribe()
  })
  // $: findOne(_class, { _id }).then(obj => { object = obj })

  let component: AnyComponent
  $: getComponentExtension(_class, presentation.class.DetailForm).then((ext) => {
    component = ext
  })

  const coreService = getCoreService()
  const dispatch = createEventDispatcher()

  function save() {
    dispatch('close')
  }
</script>

<div class="recruiting-view">
  <div class="header">
    <div class="caption-4">{title}</div>
    <div class="actions">
      <button
        class="button"
        on:click="{() => {
          dispatch('close')
        }}"
      >Cancel</button>
      <button class="button" on:click="{save}">Save</button>
    </div>
  </div>
  {#if object}
    <div class="content">
      <Component is="{component}" props="{{ _class, object }}" />
    </div>
  {/if}
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
