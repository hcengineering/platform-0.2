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
  import { AnyLayout, Class, Doc, Ref } from '@anticrm/core'
  import { AnyComponent } from '@anticrm/platform-ui'
  import Component from '@anticrm/platform-ui/src/components/Component.svelte'
  import presentation from '@anticrm/presentation'
  import { createEventDispatcher, onDestroy } from 'svelte'
  import { _getCoreService, getComponentExtension, getCoreService } from '../../utils'

  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import workbench from '../..'

  export let title: string
  export let _class: Ref<Class<Doc>>
  export let _id: Ref<Doc>

  let object: Doc | undefined

  let queryUpdate: (_clas: Ref<Class<Doc>>, query: AnyLayout) => void

  const coreService = _getCoreService()

  queryUpdate = coreService.subscribe(_class, { _id }, (docs) => {
    object = docs.length > 0 ? docs[0] : undefined
  }, onDestroy)

  let component: AnyComponent
  $: {
    queryUpdate(_class, { _id })

    getComponentExtension(_class, presentation.class.DetailForm).then((ext) => {
      component = ext
    })
  }

  const dispatch = createEventDispatcher()
</script>

<div class="recruiting-view">
  <a href="/" style="position:absolute;top:1.5em;right:1.5em;" on:click|preventDefault={() => { dispatch('close') }}>
    <Icon icon={workbench.icon.Close} button="true" />
  </a>
  {#if object}
    <div class="content">
      <Component is="{component}" props="{{ _class, object }}" />
    </div>
  {/if}
</div>

<style lang="scss">
  .recruiting-view {
    padding: 2em;
    width: calc(404px - 4em);
    position: relative;
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

    margin-top: 1em;

    .group {
      padding: 0.5em;
      //background-color: $content-bg-color;
    }
  }
</style>
