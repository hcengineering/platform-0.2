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
  import { ClassModel } from '../..'
  import AttributeEditor from '../AttributeEditor.svelte'

  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'

  export let model: ClassModel
  export let object: any

  function toggleVisible (event: MouseEvent) {
    const table = (event.target as HTMLElement).nextElementSibling as HTMLElement
    if (table.style.display === 'none') {
      table.style.display = 'inherit'
    } else {
      table.style.display = 'none'
    }
  }
</script>

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
                <AttributeEditor attribute={attr} bind:value={object[attr.key]} />
              </div>
            </td>
          </tr>
        {/each}
      </table>
    </div>
    <div class="group">
      {#each model.getMixins(group._class) as _mixin (_mixin)}
        <div class="caption-4" style="cursor:pointer" on:click={(e) => toggleVisible(e)}>{_mixin.label}</div>
        <table style="display:none">
          {#each model.getOwnAttributes(_mixin._mixin) as attr (attr.key)}
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
                  <AttributeEditor attribute={attr} bind:value={object[attr.key]} />
                </div>
              </td>
            </tr>
          {/each}
        </table>
      {/each}
    </div>
  {/each}
</div>

<style lang="scss">
  .attributes {
    display: flex;
    flex-wrap: wrap;

    margin-top: 1em;

    .group {
      padding: 0.2em;
    }
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
