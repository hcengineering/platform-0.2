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
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let offset = 0
  export let total = 0
  export let pos = 0
  const limit = 100

  export let text = ''

  export let labels = {
    placeholder: 'Search'
  }

  function onSearch () {
    dispatch('search', { text })
  }
</script>

<div class="control-container">
  <div class="search">
    <input
      type="search"
      title={labels.placeholder}
      placeholder={labels.placeholder}
      bind:value={text}
      on:input={onSearch} />
  </div>

  <div class="pagination">
    {#if total > 0}
      <button
        disabled={pos === 0}
        on:click={() => {pos = pos - limit}}>
        {'<'}
      </button>
      <button disabled={pos + limit >= total} on:click={() => {pos = pos + limit}}>
        {'>'}
      </button>

      <span>
        Items {offset + 1} to {Math.min(total, offset + limit)} of {total}
      </span>

    {:else}
      No Items
    {/if}
  </div>
</div>



<style lang="scss">
  .control-container {
    width: 100%;
    height: 64px;
    background: var(--theme-bg-accent-color);
    border: 1px solid rgba(255, 255, 255, 0.03); //there no such color in theme
    box-sizing: border-box;
    border-radius: 12px;
    margin: 20px;
    display: flex;
    align-items: center;
    padding: 10px;
  }
  .search {
    width: 33.3%;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    max-width: 300px;
    border-radius: 12px;
    box-sizing: border-box;
    font-size: 15px;
    font-weight: 400;

    input {
      width: 100%;
      border: none;
      padding: 5px 3px;
      background-color: transparent;
      color: var(--theme-content-color);
      &:focus {
        outline: none;
      }
    }
  }
  .pagination {
    width: 300px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: baseline;

    button {
      height: 32px;
      width: 32px;
      margin: 5px;
      border: 1px solid rgba(0, 0, 0, 0.03);
      border-radius: 8px;
      background: var(--theme-bg-accent-color);
      color: var(--theme-content-color);

    }

    button:disabled {
      background: var(--theme-bg-color);;
    }

    span {
      margin-left: 15px;
    }
  }

  @media screen and (max-width: 767px) {
    .search {
      width: 100%;
    }
  }
</style>
