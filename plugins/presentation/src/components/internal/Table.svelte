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
  import type { Class, Doc, Ref } from '@anticrm/core'
  import type { Space, VDoc } from '@anticrm/domains'
  import { CORE_CLASS_VDOC } from '@anticrm/domains'
  import type { AttrModel, ClassModel } from '../..'
  import { liveQuery } from '../..'
  import { getEmptyModel, getPresentationService } from '../../utils'
  import Presenter from './presenters/Presenter.svelte'
  import { QueryUpdater } from '@anticrm/platform-core'

  export let _class: Ref<Class<VDoc>>
  export let space: Space
  export let editable = true

  const dispatch = createEventDispatcher()

  let model: ClassModel = getEmptyModel()
  let modelClass: Ref<Class<Doc>>
  let attributes: AttrModel[] = []

  let offset = 0
  let total = 0
  let pos = 0
  const limit = 100

  $: {
    if (_class && _class !== modelClass) {
      getPresentationService()
        .then((p) => p.getClassModel(_class, CORE_CLASS_VDOC))
        .then((m) => {
          model = m
          modelClass = _class
          attributes = model.getAttributes()
        })
    }
  }

  let objects: VDoc[] = []
  let lq: Promise<QueryUpdater<VDoc>>
  $: lq = liveQuery<VDoc>(
    lq,
    _class,
    { _space: space._id as Ref<Space> },
    (docs) => {
      objects = docs
    },
    {
      limit,
      skip: pos,
      countCallback: (skip, limit, count) => {
        offset = skip
        total = count
      }
    }
  )
  function attrValue (doc: VDoc, key: string): any {
    return (doc as any)[key]
  }
</script>

{#if total > 0}
  Items {offset + 1} to {Math.min(total, offset + limit)} of {total}
  {#if pos + limit < total}
    <div
      on:click={() => {
        pos = pos + limit
      }}>
      Next
    </div>
  {/if}
  {#if pos > 0}
    <div
      on:click={() => {
        pos = pos - limit
      }}>
      Previous
    </div>
  {/if}
{:else}
  No Items
{/if}
<div class="erp-table">
  <div class="thead">
    <div class="tr">
      {#each attributes as attr (attr.key)}
        <div class="th">{attr.label}</div>
      {/each}
    </div>
  </div>
  <div class="tbody">
    {#each objects as object (object._id)}
      <div class="tr" on:click={() => dispatch('open', { _id: object._id, _class: _class })}>
        {#each attributes as attr (attr.key)}
          <div class="td">
            {#if attr.presenter}
              <Presenter is={attr.presenter} value={attrValue(object, attr.key)} attribute={attr} {editable} />
            {:else}
              <span>{attrValue(object, attr.key) || ''}</span>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .erp-table {
    display: table;
    border-collapse: collapse;

    .tr {
      display: table-row;
    }

    .thead {
      display: table-header-group;
      font-size: 11px;
      font-weight: 400;
      border-bottom: 1px solid var(--theme-bg-accent-color);
      color: var(--theme-content-color);
    }

    .th {
      display: table-cell;
      padding: 12px 8px;
    }

    .tbody {
      display: table-row-group;
      font-size: 14px;
      font-weight: 400;
      color: var(--theme-content-dark-color);
      .tr {
        background-color: var(--theme-bg-color);
        &:nth-child(odd) {
          background-color: var(--theme-bg-accent-color);
        }
      }
    }

    .td {
      display: table-cell;
      padding: 12px 8px;
    }
  }
</style>
