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
  import { QueryUpdater } from '@anticrm/platform-core'
  import { getCoreService, liveQuery } from '@anticrm/presentation'
  import UserInfo from '@anticrm/sparkling-controls/src/UserInfo.svelte'

  import type { Vacancy, WithCandidateProps } from '..'
  import recruiting from '..'

  const dispatch = createEventDispatcher()

  const coreP = getCoreService()
  export let object: Vacancy | undefined
  let lq: Promise<QueryUpdater<WithCandidateProps>>
  let candidates: WithCandidateProps[] = []

  $: lq = liveQuery(
    lq,
    recruiting.mixin.WithCandidateProps,
    {
      vacancy: object?._id as Ref<Vacancy>
    },
    (docs) =>
      coreP
        .then((s) => s.getModel())
        .then((m) => {
          candidates = docs.map((x) => m.as(x, recruiting.mixin.WithCandidateProps))
        })
  )
</script>

<div class="root">
  {#if object}
    <div class="header">
      <div class="title">
        {object.title}
      </div>
      <div class="description">
        {object.description}
      </div>
    </div>
    <div>
      Salary: {object.salary}
    </div>
    {#if candidates.length > 0}
      <div class="candidates">
        <div class="candidates-title">Candidates</div>
        <div class="candidates-list">
          {#each candidates as candidate}
            <div
              class="candidate"
              on:click={() => {
                dispatch('open', {
                  _id: candidate._id,
                  _class: recruiting.mixin.WithCandidateProps
                })
              }}>
              <UserInfo
                url={`https://robohash.org/${candidate.name}.png?set=set3`}
                title={candidate.name}
                subtitle={candidate.candidate.role} />
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>

<style lang="scss">
  .root {
    display: grid;
    grid-template-columns: auto;
    grid-gap: 10px;
  }
</style>
