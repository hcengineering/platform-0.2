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
  import { Model, Ref } from '@anticrm/core'
  import type { Space } from '@anticrm/domains'
  import type { QueryUpdater } from '@anticrm/paltform-core'
  import { getCoreService, liveQuery } from '@anticrm/presentation'
  import type { FSM } from '@anticrm/fsm'
  import fsmPlugin from '@anticrm/fsm'
  import type { WorkbenchApplication } from '@anticrm/workbench'

  import EditBox from '@anticrm/sparkling-controls/src/EditBox.svelte'
  import SpaceBox from '@anticrm/platform-ui/src/components/SpaceBox.svelte'
  import ComboBox from '@anticrm/sparkling-controls/src/ComboBox.svelte'

  import type { Vacancy } from '..'

  const coreP = getCoreService()
  const modelP = coreP.then((c) => c.getModel())
  let model: Model | undefined

  modelP.then((m) => {
    model = m
  })

  export let application: WorkbenchApplication
  export let vacancy: Vacancy
  export let spaces: Space[]
  export let space: Space | undefined
  export let fsmRef: Ref<FSM> | undefined

  let selectedFSM = 0

  let fsms: FSM[] = []
  let fsmItems: { id: number; comboValue: string; ref: Ref<FSM> }[] = []
  let lq: Promise<QueryUpdater<FSM>>

  // TODO: fsm selector has to be adjusted as soon as we allow user to edit vacancy
  $: lq = liveQuery(lq, fsmPlugin.class.FSM, { application: application._id, isTemplate: true }, (docs) => {
    fsms = docs
  })

  $: if (!fsmRef && model) {
    if (!model.isMixedIn(vacancy, fsmPlugin.mixin.WithFSM)) {
      fsmRef = fsms[0]?._id as Ref<FSM> | undefined
    } else {
      fsmRef = model.as(vacancy, fsmPlugin.mixin.WithFSM).fsm
    }
  }

  $: fsmItems = fsms.map((x, i) => ({ id: i, comboValue: x.name, ref: x._id as Ref<FSM> }))
  $: fsmRef = fsmItems[selectedFSM]?.ref ?? fsmRef
</script>

<div class="form">
  {#if spaces && spaces.length > 1}
    <SpaceBox label="Vacancy" {spaces} bind:space />
  {/if}
  <EditBox bind:value={vacancy.title} label="Title" />
  <EditBox bind:value={vacancy.description} label="Description" />
  <EditBox bind:value={vacancy.location} label="Location" placeholder="Russia, Novosibirsk" />
  <EditBox bind:value={vacancy.salary} label="Salary" />
  {#if fsmItems && fsmItems.length > 1}
    <ComboBox items={fsmItems} bind:selected={selectedFSM} label="Flow" />
  {/if}
</div>

<style lang="scss">
  .form {
    display: grid;
    grid-template-columns: auto;
    grid-gap: 10px;
  }
</style>
