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
  import { Person } from '@anticrm/contact'

  import { createLiveQuery, getCoreService, updateLiveQuery } from '@anticrm/presentation'
  import contact from '@anticrm/contact/src/__model__'

  import UserInfo from '@anticrm/sparkling-controls/src/UserInfo.svelte'
  import ResumeProps from '@anticrm/person-extras/src/components/ResumeProps.svelte'

  import candidatePlugin, { WithCandidateProps } from '..'

  const core = getCoreService()
  const model = core.then((s) => s.getModel())

  export let object: WithCandidateProps
  let person: Person | undefined
  let candidate: WithCandidateProps['candidate'] | undefined
  let resume: WithCandidateProps['resume'] | undefined

  const query = createLiveQuery(
    contact.class.Person,
    { _mixins: candidatePlugin.mixin.WithCandidateProps, _id: object._id },
    (docs) =>
      model.then((m) => {
        person = docs[0]

        const candidateMixin = person && m.as(person, candidatePlugin.mixin.WithCandidateProps)
        candidate = candidateMixin?.candidate
        resume = candidateMixin?.resume
      })
  )

  $: {
    if (object) {
      updateLiveQuery(query, contact.class.Person, {
        _mixins: candidatePlugin.mixin.WithCandidateProps,
        _id: object._id
      })
    }
  }
</script>

<div class="root">
  {#if person && candidate}
    <div class="header">
      <UserInfo
        url={`https://robohash.org/${person.name}.png?set=set3`}
        title={person.name}
        subtitle={candidate.role}
      />
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
</style>
