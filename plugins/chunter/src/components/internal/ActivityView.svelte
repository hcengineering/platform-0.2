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
<script type='ts'>
  import { Ref, Tx } from '@anticrm/core'
  import { onDestroy } from 'svelte'
  import { WorkbenchApplication } from '@anticrm/workbench'
  import { Space, CORE_CLASS_CREATE_TX } from '@anticrm/domains'

  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import ActivityItem from './ActivityItem.svelte'
  import { getCoreService } from '@anticrm/platform-ui'

  export let application: Ref<WorkbenchApplication>
  export let space: Ref<Space>

  let objects: Tx[] = []

  getCoreService().subscribe(CORE_CLASS_CREATE_TX, {}, (docs) => {
    objects = docs
  }, onDestroy)

</script>

<style lang='scss'>
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

<div class='activity'>
  <div class='captionContainer'>
    <span class='caption-1'>Activity</span>&nbsp;
  </div>
  <ScrollView stylez='height: 100%; margin: 2em' autoscroll={true}>
    <div class='content'>
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
