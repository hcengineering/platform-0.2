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
  import { CORE_CLASS_CLASS, CORE_CLASS_MIXIN, Doc, Model } from '@anticrm/core'
  import { QueryUpdater } from '@anticrm/platform-core'
  import type { AttrModel, ClassModel } from '@anticrm/presentation'
  import ui, { getCoreService, getEmptyModel, getPresentationService, liveQuery } from '@anticrm/presentation'
  import Presenter from '@anticrm/presentation/src/components/internal/presenters/Presenter.svelte'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  let model: ClassModel = getEmptyModel()
  let attributes: AttrModel[] = []

  let coreModel: Model

  getCoreService().then((cs) => {
    coreModel = cs.getModel()
  })

  getPresentationService()
    .then((p) => p.getClassModel(CORE_CLASS_CLASS))
    .then((m) => {
      model = m
      attributes = [...model.getAttributes()]
      console.log(attributes)
      attributes = attributes
        .filter((a) => ['_attributes', '_native', '_kind'].indexOf(a.key) === -1)
        .sort((a, b) => {
          if (a.key === '_id') {
            return -1
          }
          return 0
        })
        .map((e) => {
          if (e.key === '_extends' || e.key === '_class') {
            e.presenter = ui.component.StringPresenter
          }
          e.label = e.label + ':' + e._class
          return e
        })
    })

  let objects: Doc[] = []
  let lq: Promise<QueryUpdater<Doc>>
  $: lq = liveQuery<Doc>(lq, CORE_CLASS_CLASS, {}, (docs) => {
    objects = docs
  })
  function attrValue (doc: Doc, key: AttrModel): any {
    if (doc._class !== key._class) {
      const mixinClass = coreModel.get(key._class)
      if (mixinClass._class === CORE_CLASS_MIXIN) {
        // Is a mixin
        // Check if key class is mixin
        if (coreModel.isMixedIn(doc, key._class)) {
          const mdl = coreModel.as(doc, key._class)
          return (mdl as any)[key.key]
        }
      }
    }
    return (doc as any)[key.key]
  }
</script>

<div class="erp-table">
  <div class="thead">
    <div class="tr">
      {#each attributes as attr ({ key: attr.key, _class: attr._class })}
        <div class="th">{attr.label}</div>
      {/each}
    </div>
  </div>
  <div class="tbody">
    {#each objects as object (object._id)}
      <div class="tr" on:click={() => dispatch('open', { _id: object._id, _class: CORE_CLASS_CLASS })}>
        {#each attributes as attr ({ key: attr.key, _class: attr._class })}
          <div class="td">
            {#if attr.presenter}
              <Presenter is={attr.presenter} value={attrValue(object, attr)} attribute={attr} editable={false} />
            {:else}
              <span>{attrValue(object, attr) || ''}</span>
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
