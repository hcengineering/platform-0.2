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
  import UserInfo from '@anticrm/sparkling-controls/src/UserInfo.svelte'
  import AnalogClock from './AnalogClock.svelte'
  import {onMount} from 'svelte';

  // import { Builder } from '@anticrm/model'
  // import { model as task } from '@anticrm/task/src/__model__'

  // export const builder = new Builder();
  // builder.load(task);
  // const Model = builder.dumpAll();
  // const modelJson = JSON.stringify(Model, null, 2)
  // console.log('Model',Model);
  // console.log('modelJson',modelJson);
  export let user: { username: '', workspace: '' }

  // onMount(
  //  setInterval(() => {
	// 		console.log('custTicks11');
	// 	}, 1000));
</script>

<div class={$$props.class + " Dashboard-item"}>
  <!-- <img class="avatar" src={avatar} alt="avatar" /> -->
  <div class="details">
  <div class="header">
    <b>{user ? user.workspace : 'Unknown Workspace'}</b>
  </div>
  <div class="content-body">
    <UserInfo url="https://avatars.githubusercontent.com/u/56792631?s=400&v=4" title={user && user.username && user.username.split('@')[0].split('.').map((word)=>word[0].toUpperCase()+word.substring(1)).join(' ')} />
    <div class="clockArea">
      <AnalogClock />
    </div>
  </div>
    <!-- <div>{user ? user.workspace : ''}</div> -->
  </div>
</div>

<style lang="scss">
  .Dashboard-item {
    padding-left: 1em;
    display: flex;
    margin-bottom: 1em;

    // .avatar {
    //   object-fit: cover;
    //   border: 1px solid var(--theme-bg-dark-color);
    //   box-shadow: 0 0 0 2px var(--theme-bg-color);
    //   border-radius: 50%;
    //   width: 32px;
    //   height: 32px;
    //   z-index: 51;
    // }
      .header{
        color: var(--theme-userlink-color);
      padding-bottom: 1em;
      }

      .content-body{
        display: flex;
        > div{
          flex-grow: 1;
        }

        .clockArea{
          margin-left: 8px;
          border: 0.1px solid azure;
        }
      }
  }
</style>
