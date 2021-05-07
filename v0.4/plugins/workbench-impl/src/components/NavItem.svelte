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
  import Collapsed from './icons/Collapsed.svelte'
  import Expanded from './icons/Expanded.svelte'

  import Mention from './icons/Mention.svelte'
  import Thread from './icons/Thread.svelte'

  export let icon: string = 'arrow'
  export let title: string = 'Unnamed'
  export let group: boolean
  export let counter: number = 0
  export let state: string = 'collapsed'

  const applications = [
    { name: 'mention', component: Mention },
    { name: 'thread', component: Thread },
  ]
</script>

<div class="container" class:collapsed={state === 'collapsed' && group}>
  <div class="title" on:click={() => {state === 'collapsed' ? state = 'expanded' : state = 'collapsed'}}>
    <div class="icon">
      {#if icon === "arrow"}
        <div class="arrow">
          <svelte:component this={state === 'collapsed' ? Collapsed : Expanded}/>
        </div>
      {:else}
        <div class="arrow">
          <svelte:component this={applications.find(app => app.name === icon.toLowerCase()).component}/>
        </div>
      {/if}
    </div>
    <span>{title}</span>
    {#if counter > 0}
      <div class="counter">{counter}</div>
    {/if}
  </div>
</div>
{#if state === "expanded" && group}
  <div class="dropdown">
    <slot/>
  </div>
{/if}

<style lang="scss">
  .container {
    height: 36px;
    .title {
      display: flex;
      align-items: center;
      margin: 0 10px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      color: var(--theme-caption-color);
      user-select: none;
      cursor: pointer;
      .icon {
        width: 16px;
        min-width: 16px;
        height: 16px;
        margin: 10px 16px 10px 18px;
        border-radius: 4px;
        opacity: .3;
      }
      span {
        flex-grow: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .counter {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 24px;
        min-width: 24px;
        height: 24px;
        border-radius: 50%;
        margin: 6px 10px;
        background-color: #DA5F44;
        font-size: 12px;
        font-weight: 600;
        color: #fff;
      }
      &:hover {
        background-color: var(--theme-button-bg-enabled);
      }
    }
  }
  .collapsed {
    margin-bottom: 8px;
  }
  .dropdown {
    width: 100%;
    margin-bottom: 20px;
  }
</style>