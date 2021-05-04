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

  import type { DateProperty, DocumentValue, Ref, StringProperty } from '@anticrm/core'
  import { generateId } from '@anticrm/core'
  import type { Space } from '@anticrm/domains'
  import { getCoreService } from '@anticrm/presentation'
  import type { WorkbenchApplication } from '@anticrm/workbench'
  import { FSM, getFSMService } from '@anticrm/fsm'
  import fsmPlugin from '@anticrm/fsm'

  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'

  import type { Vacancy } from '..'
  import recruiting from '..'
  import VacancyEditor from './VacancyEditor.svelte'

  export let spaces: Space[]
  export let application: WorkbenchApplication

  const coreP = getCoreService()
  const fsmServiceP = getFSMService()
  let space: Space | undefined = spaces[0]
  const dispatch = createEventDispatcher()

  export let fsmRef: Ref<FSM> | undefined

  let vacancy: Vacancy = {
    _id: generateId(),
    _class: recruiting.class.Vacancy,
    _space: space?._id as Ref<Space>,
    _createdBy: '' as StringProperty,
    _createdOn: Date.now() as DateProperty,
    title: '',
    description: '',
    location: '',
    responsibilities: [],
    skills: []
  }

  async function save () {
    const core = await coreP
    const model = core.getModel()

    const doc = {
      ...vacancy,
      _space: space?._id as Ref<Space>,
      _createdBy: core.getUserId() as StringProperty
    } as DocumentValue<Vacancy>

    if (fsmRef) {
      const newFSM = await fsmServiceP.then((service) => service.duplicateFSM(fsmRef))

      if (newFSM) {
        model.mixinDocument(doc as Vacancy, fsmPlugin.mixin.WithFSM, {
          fsm: newFSM._id as Ref<FSM>
        })
      }
    }

    await core.create<Vacancy>(recruiting.class.Vacancy, doc)

    dispatch('close')
  }
</script>

<div class="root">
  <ScrollView height="500px">
    <VacancyEditor bind:vacancy {spaces} {application} bind:fsmRef bind:space />
  </ScrollView>
  <div class="footer">
    <Button kind="primary" on:click={save} width="100%">Принять</Button>
    <Button on:click={() => dispatch('close')} width="100%">Отказаться</Button>
  </div>
</div>

<style lang="scss">
  .root {
    min-width: 450px;
  }

  .footer {
    display: grid;
    grid-template-columns: repeat(2, auto);
    grid-gap: 10px;

    width: 100%;
    padding-top: 10px;
  }
</style>
