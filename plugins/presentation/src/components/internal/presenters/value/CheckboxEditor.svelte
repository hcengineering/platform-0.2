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
  import CheckBox from '@anticrm/sparkling-controls/src/CheckBox.svelte'
  import type { AttrModel } from '../../../../index'
  import { CORE_CLASS_ARRAY_OF, CORE_CLASS_INSTANCE_OF } from '@anticrm/core'

  export let value: boolean
  export let attribute: AttrModel
  export let editable: boolean = true

  $: readOnlyField = attribute && (attribute.type._class === CORE_CLASS_ARRAY_OF || attribute.type._class === CORE_CLASS_INSTANCE_OF)
</script>

<CheckBox bind:checked={value} placeholder={attribute.placeholder} {editable} />
