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
  import { flip } from 'svelte/animate'
  import Presenter from '../presenters/Presenter.svelte'
  import { AttrModel } from '../../../index'
  import { Attributes, Class, Doc, Ref } from '@anticrm/core'
  import { createEventDispatcher } from 'svelte'
  import Sort from './Sort.svelte'
  import { sortString } from './utils'

  // $: console.log(data)

  export interface TableConfig {
    editable: boolean,
    sortBy: string,
    sortOrder: number,
    iconAsc: string,
    iconDesc: string,
  }

  const dispatch = createEventDispatcher()

  //export let attributes: AttrModel[] = []
  //export let objects: any[] = []
  export let _class: Ref<Class<Doc>>
  export let editable = false
  export let columns: {label: string, presenter: string}[] = []
  export let rows = []

  /*export let config: TableConfig = {
    editable: true,
    sortBy: '',
    sortOrder: 1,
    iconAsc: '▲',
    iconDesc: '▼'
  }

  const ordered: { attributeKey: string, directOrder: boolean } = {
    attributeKey: '',
    directOrder: true
  }*/

  export const handleRowClick = (_id: any) => () => {
    dispatch('open', { _id, _class })
  }

 /* const handleColumnHeadClick = (attrKey: string) => () => {
    if (ordered.attributeKey === attrKey) {
      ordered.directOrder = !ordered.directOrder
      rows = rows.reverse()
      return
    }
    ordered.attributeKey = attrKey
    const newObjs = rows.sort((a, b) => a[attrKey].localeCompare(b[attrKey]))
    rows = newObjs
  }*/

  function onSortString(event) {
    event.detail.rows = sortString(
      event.detail.rows,
      event.detail.dir,
      event.detail.key
    );
  }

  function onSortNumber(event) {
    event.detail.rows = sortString(
      event.detail.rows,
      event.detail.dir,
      event.detail.key
    );
  }

</script>

<table>
  <thead>
  <tr>
    {#each columns as attr}
      <th>
        {attr.label}
        <Sort key={attr.label} on:sort={onSortString}/>
      </th>
    {/each}
  </tr>
  </thead>
  <tbody>
  {#each rows as object (object._id)}
    <tr on:click={handleRowClick(object._id)}>
      {#each columns as attr (attr.label)}
        <td>
          {#if attr.presenter}
            <Presenter is={attr.presenter} value={object[attr]} attribute={attr} {editable} />
          {:else}
            <span>{object[attr] || ''}</span>
          {/if}
        </td>
      {/each}
    </tr>
  {/each}
  </tbody>
</table>

<style lang="scss">
  table {
    display: table;
    border-collapse: collapse;

    tr {
      display: table-row;
    }

    thead {
      display: table-header-group;
      border-bottom: 1px solid var(--theme-bg-accent-color);
      color: var(--theme-content-color);
      font-size: 11px;
      font-weight: 400;
    }

    th {
      display: table-cell;
      padding: 12px 8px;
    }

    tbody {
      display: table-row-group;
      font-size: 14px;
      font-weight: 400;
      color: var(--theme-content-dark-color);

      tr {
        background-color: var(--theme-bg-color);
        // border-bottom: 1px solid var(--theme-bg-accent-color);

        // &:hover {
        //   background-color: var(--theme-content-color);
        //   color: var(--theme-bg-color);
        //   cursor: pointer;
        // }

        &:nth-child(odd) {
          background-color: var(--theme-bg-accent-color);
        }
      }
    }

    td {
      display: table-cell;
      padding: 12px 8px;
    }
  }
</style>
