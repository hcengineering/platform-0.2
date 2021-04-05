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
  import { Space } from '@anticrm/domains'
  import ComboBox from '@anticrm/sparkling-controls/src/ComboBox.svelte'

  let selected = 0

  export let spaces: Space[]
  export let space: Space | undefined = spaces[0]
  export let label: string = 'Space'

  $: space = spaces[selected]

  let items = spaces?.map((x, idx) => ({
    id: idx,
    comboValue: x.name
  }))
</script>

<ComboBox {label} {items} bind:selected>
  <div slot="title">
    {spaces[selected].name}
  </div>
</ComboBox>
