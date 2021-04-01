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

  import type { DateProperty, Ref, StringProperty } from '@anticrm/core'
  import { generateId } from '@anticrm/core'
  import type { Space } from '@anticrm/domains'
  import type { Person } from '@anticrm/contact'
  import contact from '@anticrm/contact'
  import personExtras from '@anticrm/person-extras'
  import { getCoreService } from '@anticrm/presentation'

  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import EditBox from '@anticrm/sparkling-controls/src/EditBox.svelte'
  import ResumeEditor from '@anticrm/person-extras/src/components/ResumeEditor.svelte'
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'

  import type { WithCandidateProps } from '..'
  import candidate from '..'

  export let space: Ref<Space>

  const coreP = getCoreService()
  const modelP = coreP.then((c) => c.getModel())
  const dispatch = createEventDispatcher()

  const personM: Person = {
    _id: generateId(),
    _class: contact.class.Person,
    _space: space,
    _createdBy: '' as StringProperty,
    _createdOn: Date.now() as DateProperty,
    name: ''
  }

  const candidateM: WithCandidateProps['candidate'] = {
    __embedded: true,
    _class: candidate.class.Candidate,
    bio: '',
    role: '',
    salaryExpectation: 0
  }

  let resumeM: WithCandidateProps['resume'] = {
    __embedded: true,
    _class: personExtras.class.Resume,
    skills: [],
    hobbies: [],
    experience: [],
    profInterests: []
  }

  async function save () {
    const core = await coreP
    const model = await modelP

    const doc = {
      ...personM,
      _space: space, // Just to get latest space
      _createBy: core.getUserId()
    }

    model.mixinDocument(doc, candidate.mixin.WithCandidateProps, {
      candidate: candidateM,
      resume: resumeM
    })

    await core.create(contact.class.Person, doc)

    dispatch('close')
  }
</script>

<div class="root">
  <div class="header">
    <div class="description">Add Candidate</div>
    <div on:click={() => dispatch('close')}>
      <Icon icon={workbench.icon.Close} button={true} />
    </div>
  </div>
  <ScrollView height="500px">
    <div class="form">
      <EditBox bind:value={personM.name} label="Name" placeholder="Name" />
      <EditBox bind:value={personM.email} label="Email" placeholder="vasya@email.com" />
      <EditBox bind:value={personM.phone} label="Phone" placeholder="+71234567890" />
      <EditBox bind:value={candidateM.bio} label="Bio" />
      <EditBox bind:value={candidateM.role} label="Role" placeholder="Повар" />
      <EditBox bind:value={candidateM.salaryExpectation} label="Salary Expectation" placeholder="100500" />
      <ResumeEditor bind:resume={resumeM} />
    </div>
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

  .header {
    display: flex;
    padding-bottom: 10px;
  }

  .description {
    flex-grow: 1;
    font-size: 18px;
    font-weight: 500;
  }

  .form {
    display: grid;
    grid-template-columns: auto;
    grid-gap: 10px;
  }

  .footer {
    display: grid;
    grid-template-columns: repeat(2, auto);
    grid-gap: 10px;

    width: 100%;
    padding-top: 10px;
  }
</style>
