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
  import { QueryUpdater } from '@anticrm/platform-core'
  import { getCoreService, liveQuery } from '@anticrm/presentation'
  import type { WithFSM } from '@anticrm/fsm'
  import fsm from '@anticrm/fsm'

  import BoardPresenter from '@anticrm/fsm/src/presenters/board/BoardPresenter.svelte'

  import type { Vacancy, WithCandidateProps } from '..'
  import recruiting from '..'

  const coreP = getCoreService()

  export let object: Vacancy | undefined

  let lq: Promise<QueryUpdater<WithCandidateProps>>
  let candidates: WithCandidateProps[] = []

  $: lq = liveQuery<WithCandidateProps>(
    lq,
    recruiting.mixin.WithCandidateProps,
    {
      appliedFor: object?._id as Ref<Vacancy>
    },
    (docs) =>
      coreP
        .then((s) => s.getModel())
        .then((m) => {
          candidates = docs.map((x) => m.as(x, recruiting.mixin.WithCandidateProps))
        })
  )

  let withFSMTarget: WithFSM | undefined
  $: if (object) {
    coreP
      .then((s) => s.getModel())
      .then((m) => {
        if (object) {
          withFSMTarget = m.as(object, fsm.mixin.WithFSM)
        }
      })
  }
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
    {#if withFSMTarget !== undefined && candidates.length > 0}
      <div class="board">
        <BoardPresenter target={withFSMTarget} />
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
