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
  import { Ref, Doc } from '@anticrm/core'
  import { find } from '../../utils'

  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import workbench, { WorkbenchApplication } from '../..'
  import ActivityView from './ActivityView.svelte';

  let application: Ref<Doc>
  let applications: WorkbenchApplication[] = []
  find(workbench.class.WorkbenchApplication, {}).then(docs => {applications = docs})

  $: classes = applications.map(a => a.classes).flat()

  let showMenu = false
</script>

<div class="input-control">
  <div class="content" class:show={showMenu}>
    <!-- <div v-for="item in items" class="item" key="item._id">
      <a href="#" @click.prevent="selectItem(item)">{ item.label }</a>
    </div> -->
  </div>
  <a class='add-button' href="/" on:click|preventDefault = { () => showMenu = !showMenu }>
    <Icon icon={workbench.icon.DefaultPerspective} clazz="icon-2x" />
  </a>
</div>

<style lang="scss">  
  .input-control {
    width: 100%;
    .add-button {
      display: flex;
    }
  }
</style>
