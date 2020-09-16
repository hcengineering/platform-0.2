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
  import { Ref, Class, Doc, QueryResult } from '@anticrm/core'
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import Table from './Table.svelte'

  export let _class: Ref<Class<Doc>>
</script>

<div class="workbench-browse">
  <div>
    <span class="caption-1">{_class}</span>&nbsp;
  </div>
  <div class="table">
    <ScrollView>
      <Table {_class} />
    </ScrollView>
  </div>
</div>

<style lang="scss">
  .workbench-browse {
    height: 100%;
    display: flex;
    flex-direction: column;
  
    .table {
      flex-grow: 1;
      height: 100%;
    }
  }
</style>