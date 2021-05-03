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
<script type="ts">
  import type { Tx } from '@anticrm/core'
  import { CORE_CLASS_TX } from '@anticrm/domains'

  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import ActivityItem from './ActivityItem.svelte'
  import { liveQuery } from '@anticrm/presentation'
  import type { QueryUpdater } from '@anticrm/presentation'

  // export let application: Ref<WorkbenchApplication>
  // export let space: Space

  let objects: Tx[] = []

  let lq: Promise<QueryUpdater<Tx>>
  $: lq = liveQuery<Tx>(lq, CORE_CLASS_TX, {}, (docs) => {
    objects = docs
  })
</script>

<div class="activity">
  <div class="captionContainer">
    <span class="caption-1">Activity</span>&nbsp;
  </div>
  <ScrollView height="100%" margin="2em" autoscroll={true}>
    <div class="content">
      {#each objects as item (item._id)}
        <ActivityItem tx={item} />
      {/each}
    </div>
  </ScrollView>
</div>

<style lang="scss">
  .activity {
    height: 100%;
    // background-color: red;
    display: flex;
    flex-direction: column;

    .content {
      flex-grow: 1;
    }

    .captionContainer {
      box-sizing: border-box;
      width: 100%;
      height: 5em;
      padding: 2em;
      display: flex;
      align-items: center;
      border-bottom: 1px solid var(--theme-bg-accent-color);
    }
  }
</style>
