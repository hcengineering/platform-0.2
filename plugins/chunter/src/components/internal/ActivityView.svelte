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
  import { Ref, Class, Doc, Tx } from '@anticrm/model'
  import { onDestroy } from 'svelte'
  import { getCoreService } from '../../utils'
  import { WorkbenchApplication } from '@anticrm/workbench'
  import core from '@anticrm/core'
  import { QueryResult } from '@anticrm/platform-core'

  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import ActivityItem from './ActivityItem.svelte'
  import { Space } from '@anticrm/core'

  export let application: Ref<WorkbenchApplication>
  export let space: Ref<Space>

  let objects: Tx[] = []
  let unsubscribe: () => void

  function subscribe(qr: QueryResult<Doc>) {
    if (unsubscribe) unsubscribe()
    unsubscribe = qr.subscribe((docs) => {
      objects = docs as Tx[]
    })
  }

  $: getCoreService()
    .then((c) => c.query(core.class.CreateTx, {}))
    .then((qr) => subscribe(qr))

  onDestroy(() => {
    if (unsubscribe) unsubscribe()
  })
</script>

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
      border-bottom: 1px solid var(--theme-bg-accent-color);
      display: flex;
      align-items: center;
    }
    .container {
      width: 100%;
      height: 100%;
      margin: 2em;
    }
  }
</style>

<div class="activity">
  <div class="captionContainer">
    <span class="caption-1">Activity</span>&nbsp;
  </div>
  <ScrollView stylez="height: 100%; width:100%; margin: 2em" autoscroll={true}>
    <div class="content">
      {#each objects as item (item._id)}
        <ActivityItem tx={item} />
      {/each}
    </div>
  </ScrollView>
  <div>
    <!-- <InputControl /> -->
    <!-- <CreateForm _class={appInstance.classes[0]} title="Hello"/> -->
  </div>
</div>
