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
  import PopupMenu from './menu/PopupMenu.svelte'
  import MonthCalendar from './calendar/MonthCalendar.svelte'
  import EditBox from '@anticrm/sparkling-controls/src/EditBox.svelte'

  export let width = '100%'
  export let label = ''
  export let value: Date | undefined = undefined
  export let placeholder: string
  export let relativeToParent = false
</script>

<PopupMenu width={220} {relativeToParent}>
  <div style={`width: ${width};`} slot="trigger">
    <EditBox value={value && value.toDateString()} {label} {placeholder} />
  </div>
  <MonthCalendar bind:selectedDate={value} />
</PopupMenu>
