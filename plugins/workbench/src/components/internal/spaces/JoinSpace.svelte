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
<script lang='ts'>
  import BrowseSpace from './BrowseSpace.svelte'
  import CreateSpace from './CreateSpace.svelte'

  enum Mode {
    Select,
    Create,
    Browse
  }

  let mode: Mode = Mode.Select
</script>

<style lang='scss'>
  .space-join-view {
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
  }
</style>

{#if mode == Mode.Select}
  <div class='space-join-view'>
    <button class='button' on:click={() => (mode = Mode.Create)}>Create space</button>
    <button class='button' on:click={() => (mode = Mode.Browse)}>Browse space</button>
  </div>
{:else if mode == Mode.Create}
  <CreateSpace on:close on:browse={() => (mode = Mode.Browse)} />
{:else if mode == Mode.Browse}
  <BrowseSpace on:close on:create={() => (mode = Mode.Create)} />
{/if}
