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
  import type { Class, Doc, Ref } from '@anticrm/core'
  import { createEventDispatcher, setContext } from 'svelte'
  import TableControls from './TableControls.svelte'
  import Pagination from './Pagination.svelte'
  import Sort from './Sort.svelte'
  import Presenter from '../presenters/Presenter.svelte'

  const dispatch = createEventDispatcher()

  export let attributes: AttrModel[] = []
  export let rows: any[] = []
  export let _class: Ref<Class<Doc>>
  export let editable = false

  export let page = 0
  // the shown page index
  export let pageIndex = 0
  // rows amount at the page
  export const pageSize = 10
  export let labels = {
    empty: 'No records available'
  }

  // all rows after searching
  $: filteredRows = rows
  // filtered rows at the page
  $: visibleRows = filteredRows.slice(pageIndex, pageIndex + pageSize)

  setContext('table-state', {
    getState: () => ({
      page,
      pageIndex,
      pageSize,
      rows,
      filteredRows
    }),
    setPage: (_page, _pageIndex) => {
      page = _page
      pageIndex = _pageIndex
    },
    setRows: (_rows) => (filteredRows = _rows)
  })

  const handleRowClick = (_id: any) => () => {
    dispatch('open', { _id, _class })
  }

  function onSort (event) {
    // TODO: implement sorting feature with the core service
  }
</script>

<div class="table-component">
  <!-- control panel-->
  <slot name="controls">
    <svelte:component this={TableControls} />
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
                  <Presenter is={attr.presenter} value={object[attr.key]} attribute={attr} {editable} />
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

  <!--pagination-->
  <Pagination {page} {pageSize} count={filteredRows.length - 1} />
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
    border-spacing: 0;
    border-radius: 15px;

    tr {
      margin: 0 20px;
    }

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

        &:nth-child(odd) {
          background-color: var(--theme-bg-accent-color);
        }
      }
    }

    td {
      padding: 12px 8px;
    }
  }
</style>
