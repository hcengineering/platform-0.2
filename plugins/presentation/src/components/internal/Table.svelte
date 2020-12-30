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
  import { createEventDispatcher } from 'svelte'
  import { Ref, Class, Doc } from '@anticrm/model'
  import { Space } from '@anticrm/core'
  import { QueryResult } from '@anticrm/platform-core'
  import { ClassModel } from '../..'
  import { getCoreService, getPresentationService, getEmptyModel } from '../../utils'
  import { onDestroy } from 'svelte'

  export let _class: Ref<Class<Doc>>
  export let space: Ref<Space>

  const dispatch = createEventDispatcher()

  let model: ClassModel = getEmptyModel()
  $: getPresentationService()
    .then((p) => p.getClassModel(_class))
    .then((m) => (model = m))

  let objects: any[] = []
  let unsubscribe: () => void

  function subscribe(qr: QueryResult<Doc>) {
    if (unsubscribe) unsubscribe()
    unsubscribe = qr.subscribe((docs) => {
      objects = docs
    })
  }

  $: getCoreService()
    .then((c) => c.query(_class, { _space: space }))
    .then((qr) => subscribe(qr))

  onDestroy(() => {
    if (unsubscribe) unsubscribe()
  })
</script>

<style lang="scss">
  .erp-table {
    display: table;
    border-collapse: collapse;

    .tr {
      display: table-row;
    }

    .thead {
      display: table-header-group;
    }

    .th {
      display: table-cell;
      padding: 0.5em;
    }

    .tbody {
      display: table-row-group;

      .tr {
        border-bottom: 1px solid var(--theme-separator-color);

        &:hover {
          background-color: var(--theme-content-color);
          color: var(--theme-content-bg-color);
          cursor: pointer;
        }
      }
    }

    .td {
      display: table-cell;
      padding: 0.5em;

      // &.Boolean {
      //   text-align: center;
      // }
    }

    // .tfoot {
    //   display: table-footer-group;
    // }
    // .col {
    //   display: table-column;
    // }
    // .colgroup {
    //   display: table-column-group;
    // }
    // .caption {
    //   display: table-caption;
    // }
  }
</style>

<div class="erp-table">
  <div class="thead">
    <div class="tr">
      {#each model.getAttributes() as attr (attr.key)}
        <div class="th caption-4">{attr.label}</div>
      {/each}
    </div>
  </div>
  <div class="tbody">
    {#each objects as object (object._id)}
      <div class="tr" on:click={() => dispatch('open', { _id: object._id, _class: object._class })}>
        {#each model.getAttributes() as attr (attr.key)}
          <div class="td"><span>{object[attr.key] || ''}</span></div>
        {/each}
      </div>
    {/each}
  </div>
</div>
