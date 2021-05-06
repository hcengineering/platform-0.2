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
  import { Mixin, Doc, Ref, Obj, Model } from '@anticrm/core'
  import { CoreService } from '@anticrm/platform-core'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import { ClassModel, getCoreService } from '../..'
  import AttributeEditor from '../AttributeEditor.svelte'

  export let model: ClassModel
  export let object: Doc
  export let anyObject: any
  let objectId: Ref<Doc>
  $: {
    objectId = object._id as Ref<Doc>
    anyObject = object
  }

  let coreService: CoreService
  let coreModel: Model

  getCoreService().then((cs) => {
    coreService = cs
    coreModel = coreService.getModel()
  })

  function toggleVisible (event: MouseEvent) {
    const table = (event.target as HTMLElement).nextElementSibling as HTMLElement
    table.classList.toggle('hidden')
  }

  function getMixins (model: ClassModel, object: Doc): any[] {
    return model.getMixins().map((_mixin) => {
      const mixin = {
        _class: _mixin._mixin
      } as any

      if (coreModel.isMixedIn(object, mixin._class)) {
        return coreModel.as(object, _mixin._mixin)
      } else {
        return {
          _class: _mixin._mixin
        } as any
      }
    })
  }

  function updateMixin (mixin: any) {
    getCoreService()
      .then((cs) => cs.getModel())
      .then((cm) => {
        cm.mixinDocument(object, mixin._class, mixin)
      })
  }

  function getMixinLabel (mixin: Ref<Mixin<Obj>>) {
    return model.getMixin(mixin)?.label || mixin
  }

  let changedMixins: any[] = []

  $: if (coreModel !== undefined) changedMixins = getMixins(model, object)

  $: {
    changedMixins.filter((_mixin) => Object.keys(_mixin).length > 1).forEach((_mixin) => updateMixin(_mixin))
  }
</script>

{#if model && coreModel}
  <div class="attributes">
    {#each model.getGroups() as group (group._class)}
      <div class="group">
        <div class="caption-4">{group.label}</div>
        <table>
          {#each model.getOwnAttributes(group._class) as attr (attr.key)}
            <tr>
              <td class="cell-icon">
                {#if attr.icon}
                  <Icon icon={attr.icon} size="24" />
                {/if}
              </td>
              <td width="120px">
                <div class="label">{attr.label}</div>
              </td>
              <td>
                <div class="edit">
                  <AttributeEditor attribute={attr} bind:value={anyObject[attr.key]} />
                </div>
              </td>
            </tr>
          {/each}
        </table>
      </div>
    {/each}
    <div class="group">
      {#each getMixins(model, object) as _mixin, i (_mixin._class)}
        <div class="caption-4" style="cursor:pointer" on:click={(e) => toggleVisible(e)}>
          {getMixinLabel(_mixin._class)}
        </div>
        <table class="hidden">
          {#each model.getOwnAttributes(_mixin._class) as attr (attr.key)}
            <tr>
              <td class="cell-icon">
                {#if attr.icon}
                  <Icon icon={attr.icon} size="24" />
                {/if}
              </td>
              <td width="120px">
                <div class="label">{attr.label}</div>
              </td>
              <td>
                <div class="edit">
                  <AttributeEditor attribute={attr} bind:value={changedMixins[i][attr.key]} />
                </div>
              </td>
            </tr>
          {/each}
        </table>
      {/each}
    </div>
  </div>
{/if}

<style lang="scss">
  .attributes {
    display: flex;
    flex-wrap: wrap;

    margin-top: 1em;

    .group {
      padding: 0.2em;
    }
  }

  .hidden {
    display: none;
  }

  .label,
  .cell-icon {
    color: var(--theme-content-dark-color);
  }

  .edit {
    font-family: Raleway;
    font-size: 14px;
  }
</style>
