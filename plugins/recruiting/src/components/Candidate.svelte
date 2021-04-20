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

  import { Doc, Ref } from '@anticrm/core'
  import { getCoreService, liveQuery } from '@anticrm/presentation'
  import UserInfo from '@anticrm/sparkling-controls/src/UserInfo.svelte'
  import ResumeProps from '@anticrm/person-extras/src/components/ResumeProps.svelte'
  import PopupMenu from '@anticrm/sparkling-controls/src/menu/PopupMenu.svelte'
  import PopupItem from '@anticrm/sparkling-controls/src/menu/PopupItem.svelte'
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import type { Person } from '@anticrm/contact'

  import { CandidateState, Vacancy, WithCandidateProps } from '..'
  import recruiting from '..'

  const dispatch = createEventDispatcher()
  const coreP = getCoreService()

  export let object: WithCandidateProps | undefined
  let person: Person | undefined = object
  let candidate: WithCandidateProps['candidate'] | undefined = object?.candidate
  let resume: WithCandidateProps['resume'] | undefined = object?.resume
  let vacancies: Vacancy[] = []
  let vacancy: Vacancy | undefined

  liveQuery(undefined, recruiting.class.Vacancy, {}, (docs) => {
    vacancies = docs
  })

  $: vacancy = vacancies.find((x) => x._id === object?.vacancy)

  $: {
    person = object
    candidate = object?.candidate
    resume = object?.resume
  }

  async function unassign () {
    if (!object || !candidate) {
      return
    }

    const core = await coreP

    core.update(object, {
      vacancy: undefined,
      state: CandidateState.New
    })
  }

  async function assign (vacancyRef: Ref<Doc>) {
    if (!object || !candidate) {
      return
    }

    const core = await coreP

    core.update(object, {
      vacancy: vacancyRef as Ref<Vacancy>,
      state: CandidateState.New
    })
  }
</script>

<div class="root">
  {#if person && candidate}
    <div class="header">
      <UserInfo
        url={`https://robohash.org/${person.name}.png?set=set3`}
        title={person.name}
        subtitle={candidate.role} />
    </div>
    <div>
      Email: {person.email}
    </div>
    {#if person.birthDate}
      <div>
        Birth date: {person.birthDate}
      </div>
    {/if}
    <div>
      Bio: {candidate.bio}
    </div>
    <div>
      Role: {candidate.role}
    </div>
    <div>
      Expected salary: {candidate.salaryExpectation}
    </div>
    <div class="assignment">
      <div class="assignment-content">
        {#if vacancy}
          <div>
            Candidate is assigned to
            <div class="vacancy">
              <Button
                on:click={() => {
                  dispatch('open', { _id: vacancy && vacancy._id, _class: recruiting.class.Vacancy })
                }}
                label={vacancy.title}
                kind="transparent" />
            </div>
          </div>
          <Button label="Unassign" on:click={unassign} kind="transparent" />
        {:else}
          <div>Candidate is not assigned to any vacancy</div>
          {#if vacancies.length > 0}
            <PopupMenu>
              <div class="assign-control" slot="trigger">Assign...</div>
              {#each vacancies as v}
                <PopupItem on:click={() => assign(v._id)}>
                  {v.title}
                </PopupItem>
              {/each}
            </PopupMenu>
          {/if}
        {/if}
      </div>
    </div>
  {/if}
  {#if resume}
    <ResumeProps {resume} />
  {/if}
</div>

<style lang="scss">
  .root {
    display: grid;
    grid-template-columns: auto;
    grid-gap: 10px;
  }

  .vacancy {
    display: inline-block;
  }

  .assignment-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
