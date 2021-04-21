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
  import ComboBox from '@anticrm/sparkling-controls/src/ComboBox.svelte'
  import type { AttrModel } from '@anticrm/presentation'
  import { Enum, EnumKey, EnumOf } from '@anticrm/core'
  import { getCoreService } from '@anticrm/presentation'

  export let value: any
  export let attribute: AttrModel
  export let editable = true

  let selected = 0
  let _enum: Enum<EnumKey> | undefined
  let items: Array<any> = []
  const label = attribute.label

  getCoreService().then(cs => {
    _enum = cs.getModel().get((attribute.type as EnumOf<EnumKey>).of)
    if (_enum) {
      for (const key in _enum._literals) {
        items.push({
          id: key,
          comboValue: _enum._literals[key].label
        })

        if (value === _enum._literals[key]) {
          selected = items.findIndex((p) => p.id === key)
        }
      }
      items = items
    }
  })

  $: {
    if (_enum && items.length) {
      value = _enum._literals[items[selected].id]
    }
  }
</script>

{#if items.length}
  <ComboBox {label} {items} {editable} bind:selected>
    <div slot="title">
      {items[selected].comboValue}
    </div>
  </ComboBox>
{/if}
