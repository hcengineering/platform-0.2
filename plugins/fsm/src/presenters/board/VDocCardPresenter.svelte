<!--
Copyright © 2020, 2021 Anticrm Platform Contributors.

Licensed under the Eclipse Public License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may
obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

See the License for the specific language governing permissions and
limitations under the License.
-->
<script lang="ts">
  import type { VDoc } from '@anticrm/domains'
  import { CORE_MIXIN_SHORTID } from '@anticrm/domains'
  import presentation, { getCoreService } from '@anticrm/presentation'
  import type { Class, Model, Obj } from '@anticrm/core'
  import { CORE_CLASS_STRING } from '@anticrm/core'
  import type { Asset } from '@anticrm/platform-ui'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'

  export let doc: VDoc
  let icon: Asset | undefined = undefined
  let model: Model
  let title: string | undefined = undefined

  const init = getCoreService().then((cs) => {
    model = cs.getModel()
    let cl = model.get(doc._class) as Class<Obj>
    while (cl && !title) {
      model.asMixin(cl, presentation.mixin.UXObject, (ux) => {
        icon = ux.icon
        title = ux.label
      })
      if (cl._extends) {
        cl = model.get<Class<Obj>>(cl._extends)
      } else {
        return
      }
    }
  })

  function getCaption (model: Model, doc: VDoc): string {
    let result = ''
    model.asMixin(doc, CORE_MIXIN_SHORTID, (m) => {
      result = m.shortId + ' - '
    })
    const primary = model.getPrimaryKey(doc._class)
    if (primary) {
      result += (doc as any)[primary]
    }
    return result
  }

  function getDescription (model: Model, doc: VDoc): string[] {
    const result: any[] = []
    model
      .getAllAttributes(doc._class)
      .filter((m) => m.attr.type._class === CORE_CLASS_STRING)
      .forEach((s) => {
        // Looks like a bug, `s` is object
        // TODO: investigate
        const val = (doc as any)[s]
        if (val) {
          result.push(val)
        }
      })
    return result
  }

  let description: string[]
  $: if (model) description = getDescription(model, doc)
</script>

{#await init then ct}
  <div class="card-view">
    <div class="card-head">
      <Icon {icon} />
      {#if title}
        <h5>{title}</h5>
      {/if}
      <div class="card-head__caption">{getCaption(model, doc)}</div>
    </div>
    {#if description.length > 0}
      <div class="card-body">
        {#each description as d}
          <span>{d}</span>
        {/each}
      </div>
    {/if}
  </div>
{/await}

<style lang="scss">
  .card-view {
    max-width: 300px;
    margin: 12px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    background-color: var(--theme-bg-color);
    border: 1px solid var(--theme-bg-color);
    transition: border-color 0.3s ease-in, box-shadow 0.3s ease-in;

    .card-head {
      display: flex;
      flex-direction: row;
      align-items: center;

      &__caption {
        padding-left: 8px;
        color: var(--theme-doclink-color);
      }
    }

    .card-body {
      margin-top: 8px;
    }
  }
</style>
