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
  import { AnyLayout, StringProperty } from '@anticrm/core'
  import ui from '@anticrm/platform-ui'

  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import { CORE_CLASS_TITLE, Title } from '@anticrm/domains'
  import { onDestroy } from 'svelte'
  import { createLiveQuery, updateLiveQuery } from '@anticrm/presentation'

  let query: string
  let result: Title[] = []

  function q (query: string): AnyLayout {
    return {
      title: {
        $regex: query + '.*' as StringProperty,
        $options: 'i' as StringProperty
      }
    }
  }

  const update = createLiveQuery(CORE_CLASS_TITLE, q(query), docs => {
    console.log('search', docs)
    result = docs
  }, onDestroy)

  $: updateLiveQuery(update, CORE_CLASS_TITLE, q(query))
</script>

<Icon icon={ui.icon.Search} size="32" />&nbsp;
<input type="text" class="editbox" placeholder="Spotlight Search" bind:value={query} />
<div>
  {#each result as title}
    <div>{title.title}</div>
  {/each}
</div>
