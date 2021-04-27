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
  import { createEventDispatcher, getContext } from 'svelte'
  import { stringFilter } from './utils'
  const dispatch = createEventDispatcher()
  const stateContext = getContext('table-state')

  export let text = ''

  export let labels = {
    placeholder: 'Search'
  }

  function onSearch (event) {
    const state = stateContext.getState()
    const detail = {
      originalEvent: event,
      stringFilter,
      text,
      rows: state.filteredRows
    }
    dispatch('search', detail)

    if (detail.text.length === 0) {
      stateContext.setRows(state.rows)
    } else {
      stateContext.setRows(detail.rows.filter((r) => detail.stringFilter(r, detail.text)))
    }
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

  @media screen and (max-width: 767px) {
    .search {
      width: 100%;
    }
  }
</style>
