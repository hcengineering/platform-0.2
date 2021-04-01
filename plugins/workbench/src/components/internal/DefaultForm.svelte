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

  import { Ref } from '@anticrm/core'
  import { Space } from '@anticrm/domains'
  import { AttrModel, ClassModel, getCoreService } from '@anticrm/presentation'
  import { ItemCreator } from '@anticrm/workbench'

  import Properties from '@anticrm/presentation/src/components/internal/Properties.svelte'
  import InlineEdit from '@anticrm/sparkling-controls/src/InlineEdit.svelte'
  import ComboBox from '@anticrm/sparkling-controls/src/ComboBox.svelte'
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'

  export let creator: ItemCreator
  export let space: Ref<Space> | undefined
  export let spaces: Space[] | undefined
  export let model: ClassModel | undefined
  export let primary: AttrModel | undefined

  let object = {} as any
  let title = ''
  let selectedSpaceIdx = 0
  let spaceItems = spaces?.map((x, idx) => ({
    id: idx,
    comboValue: x.name
  }))

  const dispatch = createEventDispatcher()
  const coreService = getCoreService()

  const onClose = () => dispatch('close')
  async function onSave() {
    const doc = {
      _class: creator.class,
      [primary?.key || 'name']: title,
      _space: space ?? spaces?.[selectedSpaceIdx]._id,
      ...object
    }

    object = {}

    const cs = await coreService
    await cs.create(creator.class, doc)
    dispatch('close')
  }
</script>

<div class="caption">
  <InlineEdit bind:value={title} placeholder="Title" fullWidth={true} />
</div>

{#if spaces && spaceItems && spaceItems.length > 0}
  <ComboBox label="Space" items={spaceItems} bind:selected={selectedSpaceIdx}>
    <div slot="title">
      {spaces[selectedSpaceIdx].name}
    </div>
  </ComboBox>
{/if}

<Properties {model} bind:object />

<div class="buttons">
  <Button kind="primary" on:click={onSave}>Принять</Button>
  <Button on:click={onClose}>Отказаться</Button>
</div>

<style lang="scss">
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
