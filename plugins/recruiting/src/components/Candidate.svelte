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
  import { VDoc } from '@anticrm/domains'
  import { getCoreService, liveQuery } from '@anticrm/presentation'
  import fsmPlugin, { FSMItem, getFSMService, WithFSM } from '@anticrm/fsm'

  import UserInfo from '@anticrm/sparkling-controls/src/UserInfo.svelte'
  import ResumeProps from '@anticrm/person-extras/src/components/ResumeProps.svelte'
  import PopupMenu from '@anticrm/sparkling-controls/src/menu/PopupMenu.svelte'
  import PopupItem from '@anticrm/sparkling-controls/src/menu/PopupItem.svelte'
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import type { Person } from '@anticrm/contact'
  import contactPlugin from '@anticrm/contact'

  import type { Vacancy, WithCandidateProps } from '..'
  import recruiting from '..'
  import { QueryUpdater } from '@anticrm/platform-core'

  const dispatch = createEventDispatcher()
  const coreP = getCoreService()
  const fsmServiceP = getFSMService()

  export let object: WithCandidateProps | undefined
  let person: Person | undefined = object
  let candidate: WithCandidateProps['candidate'] | undefined = object?.candidate
  let resume: WithCandidateProps['resume'] | undefined = object?.resume
  let vacancies: Vacancy[] = []

  liveQuery(undefined, recruiting.class.Vacancy, {}, (docs) => {
    vacancies = docs
  })

  let applicantItems: FSMItem[] | undefined
  let applicantItemsQ: Promise<QueryUpdater<FSMItem>> | undefined

  $: if (object) {
    applicantItemsQ = liveQuery(
      applicantItemsQ,
      fsmPlugin.class.FSMItem,
      {
        item: object._id as Ref<VDoc>
      },
      (docs) => {
        applicantItems = docs
      }
    )
  }

  let appliedVacancies: Vacancy[] = []
  let availableVacancies: Vacancy[] = []
  $: if (object && applicantItems) {
    const targetRefs = new Set(applicantItems.map((x) => x.fsm))

    appliedVacancies = vacancies.filter((x) => targetRefs.has(x._id as Ref<WithFSM>))
    availableVacancies = vacancies.filter((x) => !targetRefs.has(x._id as Ref<WithFSM>))
  }

  $: {
    person = object
    candidate = object?.candidate
    resume = object?.resume
  }

  async function unassign (vacancy: Vacancy) {
    if (!object || !candidate) {
      return
    }

    const core = await coreP
    const fsmService = await fsmServiceP

    const vacancyWithFSM = core.getModel().as(vacancy, fsmPlugin.mixin.WithFSM)
    fsmService.removeStateItem(object._id as Ref<VDoc>, vacancyWithFSM)
  }

  async function assign (vacancyRef: Ref<Doc>) {
    if (!object || !candidate) {
      return
    }

    const core = await coreP
    const model = core.getModel()
    const vacancy = await core.findOne(recruiting.class.Vacancy, { _id: vacancyRef })
    const baseDoc = await core.findOne(contactPlugin.class.Person, { _id: object._id })

    if (!vacancy || !baseDoc) {
      return
    }

    if (!model.isMixedIn(vacancy, fsmPlugin.mixin.WithFSM)) {
      return
    }

    const fsmService = await fsmServiceP

    const withFSM = model.as(vacancy, fsmPlugin.mixin.WithFSM)
    fsmService.addStateItem(withFSM, {
      obj: {
        item: object._id as Ref<VDoc>,
        clazz: contactPlugin.class.Person
      }
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
        {#if appliedVacancies.length > 0}
          <div>
            <div class="application-label">Candidate is applied for:</div>
            {#each appliedVacancies as vacancy}
              <div class="vacancy">
                <Button
                  on:click={() => {
                    dispatch('open', { _id: vacancy && vacancy._id, _class: recruiting.class.Vacancy })
                  }}
                  label={vacancy.name}
                  kind="transparent" />
                <Button label="Unassign" on:click={() => unassign(vacancy)} kind="transparent" />
              </div>
            {/each}
          </div>
        {:else}
          <div class="application-label">Candidate is not assigned to any vacancy</div>
        {/if}
        {#if availableVacancies.length > 0}
          <PopupMenu>
            <div class="assign-control" slot="trigger">Assign...</div>
            {#each availableVacancies as v}
              <PopupItem on:click={() => assign(v._id)}>
                {v.name}
              </PopupItem>
            {/each}
          </PopupMenu>
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

  .assignment {
    display: grid;
    grid-template-columns: auto;
    grid-gap: 10px;
  }
  .vacancy {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
