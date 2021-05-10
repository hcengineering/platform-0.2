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
  import { Ref } from '@anticrm/core'
  import type { QueryUpdater } from '@anticrm/platform-core'
  import { liveQuery } from '@anticrm/presentation'
  import type { FSM } from '@anticrm/fsm'
  import fsmPlugin from '@anticrm/fsm'
  import type { WorkbenchApplication } from '@anticrm/workbench'

  import ComboBox from '@anticrm/sparkling-controls/src/ComboBox.svelte'

  export let application: WorkbenchApplication
  export let fsmRef: Ref<FSM> | undefined

  let selectedFSM = 0

  let fsms: FSM[] = []
  let fsmItems: { id: number; comboValue: string; ref: Ref<FSM> }[] = []
  let lq: Promise<QueryUpdater<FSM>>

  $: lq = liveQuery(lq, fsmPlugin.class.FSM, { application: application._id, isTemplate: true }, (docs) => {
    fsms = docs
  })

  $: fsmItems = fsms.map((x, i) => ({ id: i, comboValue: x.name, ref: x._id as Ref<FSM> }))
  $: fsmRef = fsmItems[selectedFSM]?.ref ?? fsmRef
</script>

{#if fsmItems && fsmItems.length > 1}
  <ComboBox items={fsmItems} bind:selected={selectedFSM} label="Flow" />
{/if}
