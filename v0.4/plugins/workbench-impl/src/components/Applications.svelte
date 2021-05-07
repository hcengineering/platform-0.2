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
  import Search from './icons/Search.svelte'
  import Add from './icons/Add.svelte'
  import Chat from './icons/Chat.svelte'
  import Home from './icons/Home.svelte'
  import Task from './icons/Task.svelte'

  export let active: string = 'add'

  const applications = [
    { name: 'add', component: Add },
    { name: 'home', component: Home },
    { name: 'chat',  component: Chat },
    { name: 'task',  component: Task },
    { name: 'search',  component: Search },
  ]
</script>

<div class="app-icons">
  {#each applications as app}
    <div class="app" class:selected={app.name === active.toLowerCase()}
         on:click={() => {active = app.name}}>
      <svelte:component this={app.component} size="32"/>
    </div>
  {/each}
</div>

<style lang="scss">
  .app-icons {
    .app {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 52px;
      height: 52px;
      border-radius: 8px;
      cursor: pointer;
      opacity: .3;
      &.selected {
        opacity: 1;
        background-color: var(--theme-menu-selection);
      }
    }
    .app + .app {
      margin-top: 8px;
    }
  }
</style>