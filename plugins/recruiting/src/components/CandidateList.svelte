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

  import { QueryUpdater } from '@anticrm/platform-core'
  import type { Space } from '@anticrm/domains'
  import { liveQuery } from '@anticrm/presentation'

  import UserInfo from '@anticrm/sparkling-controls/src/UserInfo.svelte'
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'

  import type { WithCandidateProps } from '..'
  import recruiting from '..'
  import { Ref } from '@anticrm/core'

  export let space: Space

  const dispatch = createEventDispatcher()

  let candidates: WithCandidateProps[] = []
  let lq: Promise<QueryUpdater<WithCandidateProps>>

  $: lq = liveQuery<WithCandidateProps>(
    lq,
    recruiting.mixin.WithCandidateProps,
    { _space: space._id as Ref<Space> },
    (docs) => {
      candidates = docs
    }
  )
</script>

<ScrollView width="100%" height="100%">
  <div class="grid">
    {#each candidates as c}
      <div
        class="candidate"
        on:click={() => dispatch('open', { _id: c._id, _class: recruiting.mixin.WithCandidateProps })}>
        <UserInfo url={`https://robohash.org/${c.name}.png?set=set3`} title={c.name} subtitle={c.candidate.role} />
      </div>
    {/each}
  </div>
</ScrollView>

<style lang="scss">
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    grid-gap: 10px;
    padding: 15px;
  }

  .candidate {
    padding: 20px 10px;
    border: 1px solid;
    border-radius: 5px;
    cursor: pointer;
    border-color: var(--theme-bg-accent-color);
  }
</style>
