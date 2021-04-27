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
  import { onDestroy } from 'svelte'

  import { Ref } from '@anticrm/core'
  import { QueryUpdater } from '@anticrm/platform-core'
  import type { Space } from '@anticrm/domains'
  import { liveQuery } from '@anticrm/presentation'
  import { newRouter } from '@anticrm/platform-ui'

  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'

  import VacancyC from './Vacancy.svelte'

  import recruiting from '..'
  import type { Vacancy } from '..'

  export let space: Space

  let vacancy: string | undefined

  const router = newRouter<{ vacancy?: string }>('?vacancy', (match) => {
    vacancy = match.vacancy
  })

  const onOpen = (vacancy: string) => {
    router.navigate({ vacancy })
  }
  const onReturn = () => router.navigate({ vacancy: undefined })

  onDestroy(onReturn)

  let vacancies: Vacancy[] = []
  let object: Vacancy | undefined
  let lq: Promise<QueryUpdater<Vacancy>>

  $: lq = liveQuery<Vacancy>(lq, recruiting.class.Vacancy, { _space: space._id as Ref<Space> }, (docs) => {
    vacancies = docs
  })

  $: if (vacancy) {
    object = vacancies.find((x) => x._id === vacancy)
  } else {
    object = undefined
  }
</script>

<ScrollView width="100%" height="100%">
  {#if vacancy === undefined}
    <div class="grid">
      {#each vacancies as v (v._id)}
        <div class="vacancy" on:click={() => onOpen(v._id)}>
          {v.title}
        </div>
      {/each}
    </div>
  {:else}
    <div class="details">
      <VacancyC {object} />
      <div class="back">
        <Button label="Back" on:click={onReturn} />
      </div>
    </div>
  {/if}
</ScrollView>

<style lang="scss">
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    grid-gap: 10px;
    padding: 15px;
  }

  .vacancy {
    padding: 20px 10px;
    border: 1px solid;
    border-radius: 5px;
    cursor: pointer;
    border-color: var(--theme-bg-accent-color);

    font-weight: 500;
  }

  .details {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .back {
    position: absolute;
    right: 0;
    top: 0;
  }
</style>
