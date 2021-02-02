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
  import { Ref, Class, Obj } from '@anticrm/core'
  import { ClassModel } from '../..'
  import AttributeEditor from '../AttributeEditor.svelte'

  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import { getPresentationService } from '../../utils'

  // export let _class: Ref<Class<Obj>>
  // export let excludeAttributes: string[] = []

  export let model: ClassModel
  export let object: any

  // $: getPresentationService()
  //   .then(service => service.getClassModel(_class))
  //   .then(m => { model = m.filterAttributes(excludeAttributes) })
</script>

<!-- { /if } -->
<style lang="scss">
  .attributes {
    display: flex;
    flex-wrap: wrap;

    margin-top: 1em;

    .group {
      padding: 0.5em;
    }
  }

  .label {
    color: var(--theme-content-dark-color);
  }

  .edit {
    font-family: Raleway;
    font-size: 14px;
  }
</style>

<!-- { #if model} -->
<div class="attributes">
  {#each model.getGroups() as group (group._class)}
    <div class="group">
      <div class="caption-4">{group.label}</div>
      <table>
        {#each model.getOwnAttributes(group._class) as attr (attr.key)}
          <tr>
            <td>
              {#if attr.icon}
                <span style="fill: var(--theme-content-dark-color)">
                  <Icon icon={attr.icon} className="icon-embed-15x" />
                </span>
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
  {/each}
</div>
