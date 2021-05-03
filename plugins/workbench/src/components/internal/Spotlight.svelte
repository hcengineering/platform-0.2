<!--
// Copyright © 2020 Anticrm Platform Contributors.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
-->
<script lang="ts">
  import type { DocumentQuery } from '@anticrm/core'
  import ui from '@anticrm/platform-ui'

  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import type { Title } from '@anticrm/domains'
  import { CORE_CLASS_TITLE } from '@anticrm/domains'
  import { liveQuery } from '@anticrm/presentation'
  import { QueryUpdater } from '@anticrm/platform-core'

  let query = ''
  let result: Title[] = []

  function q (query: string): DocumentQuery<Title> {
    return {
      title: {
        $regex: query + '.*',
        $options: 'i'
      }
    }
  }
  let lq: Promise<QueryUpdater<Title>>
  $: lq = liveQuery(lq, CORE_CLASS_TITLE, q(query), (docs) => {
    result = docs
  })
</script>

<Icon icon={ui.icon.Search} size="32" />&nbsp;
<input type="text" class="editbox" placeholder="Spotlight Search" bind:value={query} />
<div>
  {#each result as title}
    <div>{title.title}</div>
  {/each}
</div>
