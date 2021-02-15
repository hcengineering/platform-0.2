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
  import { Class, Doc, Ref } from '@anticrm/core'
  import { createEventDispatcher } from 'svelte'
  import { AnyComponent, getPlatform } from '@anticrm/platform-ui'
  import presentation, { AttrModel, ClassModel } from '@anticrm/presentation'
  import { _getCoreService, _getPresentationService, getComponentExtension } from '../../utils'
  import Properties from '@anticrm/presentation/src/components/internal/Properties.svelte'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import workbench from '@anticrm/workbench'
  import InlineEdit from '@anticrm/sparkling-controls/src/InlineEdit.svelte'
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import { CORE_CLASS_VDOC, Space } from '@anticrm/domains'
  import Component from '../../../../platform-ui/src/components/Component.svelte'

  export let title: string = ''
  export let _class: Ref<Class<Doc>>
  export let space: Ref<Space>
  let object = {} as any

  let createFormComponent: AnyComponent | undefined = undefined
  const coreService = _getCoreService()
  const dispatch = createEventDispatcher()

  let model: ClassModel | undefined
  let primary: AttrModel | undefined

  const presentationService = _getPresentationService()

  function save () {
    const doc = {
      _class,
      [primary?.key || 'name']: title,
      _space: space, ...object
    }
    object = {}
    // absent VDoc fields will be autofilled
    coreService.create(_class, doc)
    dispatch('close')
  }

  const init = Promise.all([
    getComponentExtension(_class, presentation.mixin.CreateForm).then((ext) => {
      createFormComponent = ext
    }),
    presentationService.getClassModel(_class, CORE_CLASS_VDOC).then((m) => {
      const mp = m.filterPrimary()
      model = mp.model
      primary = mp.primary
    })])
</script>

<style lang="scss">
  .recruiting-view {
    padding: 24px 32px 32px 32px;
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
    margin-bottom: 9px;

    .caption {
      flex-grow: 1;

      .caption-edit {
        width: 100%;
      }
    }

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
    .taskLabel {
      color: var(--theme-doclink-color);
      margin-bottom: 16px;
    }

    .separator {
      height: 16px;
    }
  }

  .buttons {
    margin-top: 16px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 16px;
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

{#await init then _}
  {#if createFormComponent}
    <Component is={createFormComponent} props={{space:space}} on:change
               on:close={()=>dispatch('close')} />
  {:else}
    <div class="recruiting-view">
      <div class="header">
        <div class="caption-1 caption">
          <InlineEdit bind:value={title} placeholder="Title" fullWidth="true" />
        </div>
        <a href="/" style="margin-left:1.5em" on:click|preventDefault={() => dispatch('close')}>
          <Icon icon={workbench.icon.Close} button="true" />
        </a>
      </div>

      <div class="content">
        <Properties {model} bind:object />
      </div>
      <div class="buttons">
        <Button kind="primary" on:click={save}>Принять</Button>
        <Button on:click={() => dispatch('close')}>Отказаться</Button>
      </div>
    </div>
  {/if}
{/await}

