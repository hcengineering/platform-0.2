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
  import { Ref, Class, Doc, Application } from '@anticrm/core'
  import { findOne } from '../../utils'
  import workbench, { WorkbenchApplication } from '../..'

  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import Table from '@anticrm/presentation/src/components/internal/Table.svelte'
  import InputControl from './InputControl.svelte'
  import CreateForm from './CreateForm.svelte'

  export let application: Ref<WorkbenchApplication>
  
  let appInstance: WorkbenchApplication | undefined
  $: findOne(workbench.class.WorkbenchApplication, { _id: application }).then(app => { appInstance = app })
</script>

<div class="workbench-browse">
  { #if appInstance }
  <div>
    <span class="caption-1">{appInstance.label}</span>&nbsp;
  </div>
  <div class="table">
    <Table _class={appInstance.classes[0]} />
  </div>
  <div class="input-control">
    <!-- <InputControl /> -->
    <CreateForm _class={appInstance.classes[0]} title="Hello"/>
  </div>
  { /if }
</div>

<style lang="scss">
  .workbench-browse {
    height: 100%;
    // background-color: red;
    display: flex;
    flex-direction: column;
  
    .table {
      flex-grow: 1;
    }

    .input-control {
      padding: 1em;
      //max-height: 400px;
    }

  }
</style>