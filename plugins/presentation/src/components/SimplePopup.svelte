<!--
// Copyright © 2021 Anticrm Platform Contributors.
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

// Component define a simple popup menu with a set of actions.
-->
<script lang='ts'>

  interface Item {
    name: string
    action: () => void
  }

  export let items: unknown[]
</script>

<style lang='scss'>
  .simple-popup-view {
    display: flex;
    flex-direction: column;
    flex-flow: column nowrap;
    justify-content: space-evenly;
    //height: 6em;
    .button {
      font-size: 14px;
      text-align: left;
      padding: 0.5em 1em;
      background-color: var(--theme-bg-color);
      border: none;
      border-radius: 0;
      margin: 0;

      &:hover {
        background-color: var(--theme-bg-accent-color);
      }
    }

    .separator {
      font-size: 14px;
      background-color: var(--theme-bg-color);
      border-bottom: 1px solid var(--theme-bg-accent-color);
      height: 1px;
      border-radius: 0;
      margin: 0;
    }
  }
</style>

<div class='simple-popup-view'>
  {#each items as item}
    {#if item.style === 'separator'}
      <div class='separator' />
    {:else}
      <button class='button' on:click={item.action}>{item.name}</button>
    {/if}
  {/each}
</div>
