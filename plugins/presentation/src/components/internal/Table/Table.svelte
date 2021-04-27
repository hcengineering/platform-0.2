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
  import type { AttrModel } from '../../../index'
  import type { Class, Ref } from '@anticrm/core'
  import { createEventDispatcher, setContext } from 'svelte'
  import TableControls from './TableControls.svelte'
  import Sort from './Sort.svelte'
  import Presenter from '../presenters/Presenter.svelte'
  import { VDoc } from '@anticrm/domains'

  const dispatch = createEventDispatcher()

  export let attributes: AttrModel[] = []
  export let rows: any[] = []
  export let _class: Ref<Class<VDoc>>
  export let editable = false

  export const pageSize = 30
  export let labels = {
    empty: 'No records available'
  }

  // all rows after searching
  $: filteredRows = rows
  // filtered rows at the page
  $: visibleRows = filteredRows.slice(0, pageSize)

  setContext('table-state', {
    getState: () => ({
      pageSize,
      rows,
      filteredRows
    }),
    setRows: (_rows) => (filteredRows = _rows)
  })

  const handleRowClick = (_id: any) => () => {
    dispatch('open', { _id, _class })
  }

  function onSort (event) {
    // TODO: implement sorting feature with the core service
  }

  function onSearch (event) {}

</script>

<div class="table-component">
  <!-- control panel-->
  <slot name="controls">
    <svelte:component this={TableControls} on:search={onSearch}/>
  </slot>

  <table>
    <thead>
      <tr>
        {#each attributes as attr (attr.key)}
          <th>
            <div class="head">
              {attr.label}
              <Sort key={attr.label} on:sort={onSort} />
            </div>
          </th>
        {/each}
      </tr>
    </thead>
    {#if visibleRows.length === 0}
      <tbody>
        <tr>
          <td class="center" colspan="100%">
            <span>
              {@html labels.empty}
            </span>
          </td>
        </tr>
      </tbody>
    {:else}
      <tbody>
        {#each visibleRows as object (object._id)}
          <tr on:click={handleRowClick(object._id)}>
            {#each attributes as attr (attr.key)}
              <td>
                {#if attr.presenter}
                  <Presenter
                    is={attr.presenter}
                    value={object[attr.key]}
                    attribute={attr}
                    maxWidth={350}
                    {editable} />
                {:else}
                  <span>{object[attr.key] || ''}</span>
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    {/if}
  </table>

</div>

<style lang="scss">
  .table-component {
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .center {
    text-align: center;
    font-style: italic;
  }

  table {
    width: 100%;
    margin-left: 12px;
    border-collapse: collapse;
    border-spacing: 0.5rem;
    border-radius: 15px;


    thead {
      border-bottom: 1px solid var(--theme-bg-accent-color);
      color: var(--theme-content-color);
      font-size: 11px;
      font-weight: 400;
    }

    th {
      padding: 12px 8px;
    }

    .head {
      display: flex;
      flex-flow: nowrap;
      min-width: 70px;
    }

    tbody {
      font-size: 14px;
      font-weight: 400;
      color: var(--theme-content-dark-color);

      tr {
        background-color: var(--theme-bg-color);
        border-bottom: 1px solid var(--theme-bg-accent-color);

        &:last-child {
          border-bottom: none;
        }
      }
    }
  }
</style>
