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
  import { createEventDispatcher } from 'svelte'
  import Sort from './Sort.svelte'
  import Presenter from '../presenters/Presenter.svelte'
  import { VDoc } from '@anticrm/domains'
  import { CORE_CLASS_MIXIN, Model } from '@anticrm/core'
  import { getCoreService } from '../../../index'

  const dispatch = createEventDispatcher()

  export let attributes: AttrModel[] = []
  export let rows: any[] = []
  export let _class: Ref<Class<VDoc>>
  export let editable = false

  let coreModel: Model
  getCoreService().then((cs) => {
    coreModel = cs.getModel()
  })

  const handleRowClick = (_id: Ref<VDoc>) => () => {
    dispatch('open', { _id, _class })
  }

  function attrValue (doc: VDoc, key: AttrModel): any {
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

<table>
  <thead>
    <tr>
      {#each attributes as attr (attr.key)}
        <th>
          <div class="head">
            {attr.label}
            <Sort key={attr.key} on:sort />
          </div>
        </th>
      {/each}
    </tr>
  </thead>
  {#if rows.length === 0}
    <tbody>
      <tr>
        <td class="center" colspan="100%">
          <span> No records available </span>
        </td>
      </tr>
    </tbody>
  {:else}
    <tbody>
      {#each rows as object (object._id)}
        <tr on:click={handleRowClick(object._id)}>
          {#each attributes as attr (attr.key)}
            <td>
              {#if attr.presenter}
                <Presenter
                  is={attr.presenter}
                  value={attrValue(object, attr)}
                  attribute={attr}
                  maxWidth={350}
                  {editable} />
              {:else}
                <span>{attrValue(object, attr) || ''}</span>
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  {/if}
</table>

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
