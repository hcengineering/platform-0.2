<!--
Copyright © 2020, 2021 Anticrm Platform Contributors.

Licensed under the Eclipse Public License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may
obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

See the License for the specific language governing permissions and
limitations under the License.
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import { Mixin, Ref } from '@anticrm/core'
  import type { Space, CORE_CLASS_VDOC } from '@anticrm/domains'
  import { VDoc } from '@anticrm/domains'
  import type { AttrModel, ClassModel } from '@anticrm/presentation'
  import presentation, { getComponentExtension, getPresentationService, getCoreService } from '@anticrm/presentation'
  import type { AnyComponent } from '@anticrm/platform-ui'
  import workbench, { ItemCreator } from '@anticrm/workbench'

  import Properties from '@anticrm/presentation/src/components/internal/Properties.svelte'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import InlineEdit from '@anticrm/sparkling-controls/src/InlineEdit.svelte'
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import Component from '@anticrm/platform-ui/src/components/Component.svelte'

  export let creator: ItemCreator
  export let space: Ref<Space>
  let title = ''
  let object = {} as any

  const coreService = getCoreService()

  let createFormComponent: AnyComponent | undefined = creator.component
  const dispatch = createEventDispatcher()

  let model: ClassModel | undefined
  let primary: AttrModel | undefined

  const presentationService = getPresentationService()

  const onClose = () => dispatch('close')
  async function save() {
    const doc = {
      _class: creator.class as Ref<Mixin<VDoc>>,
      [primary?.key || 'name']: title,
      _space: space,
      ...object
    }

    object = {}

    // absent VDoc fields will be autofilled
    const cs = await coreService
    await cs.create(creator.class, doc)
    dispatch('close')
  }

  const init = Promise.all([
    createFormComponent
      ? Promise.resolve()
      : getComponentExtension(creator.class, presentation.mixin.CreateForm).then((ext) => {
          createFormComponent = ext
        }),
    presentationService.then((ps) =>
      ps.getClassModel(creator.class, CORE_CLASS_VDOC).then((m) => {
        const mp = m.filterPrimary()
        model = mp.model
        primary = mp.primary
      })
    )
  ])
</script>

{#await init then _}
  <div class="root">
    <div class="header">
      <div class="title-container">
        <div class="title">New {creator.name}</div>
      </div>
      <div class="close" on:click={onClose}>
        <Icon icon={workbench.icon.Close} button={true} />
      </div>
    </div>
    {#if createFormComponent}
      <Component is={createFormComponent} props={{ space: space }} on:change />
    {:else}
      <div class="caption">
        <InlineEdit bind:value={title} placeholder="Title" fullWidth={true} />
      </div>

      <Properties {model} bind:object />

      <div class="buttons">
        <Button kind="primary" on:click={save}>Принять</Button>
        <Button on:click={onClose}>Отказаться</Button>
      </div>
    {/if}
  </div>
{/await}

<style lang="scss">
  .root {
    display: flex;
    flex-direction: column;

    padding: 24px 32px 32px 32px;
    max-height: 80vh;
  }

  .close {
    cursor: pointer;
  }

  .header {
    display: flex;
    justify-content: space-between;

    padding-bottom: 10px;
  }

  .title-container {
    flex: 1;
    min-width: 0;
    max-width: 300px;
  }

  .title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    font-size: 18px;
    font-weight: 500;
  }

  .caption {
    padding-bottom: 10px;
    flex-grow: 1;
  }
  .buttons {
    margin-top: 16px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 16px;
  }
</style>
