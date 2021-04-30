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
  import type { AttrModel } from '..'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import ui, { getPlatform } from '@anticrm/platform-ui/'

  export let value: unknown
  export let attribute: AttrModel
  export let maxWidth = 300

  let component: Promise<any>

  const platform = getPlatform()
  $: component = platform.getResource(attribute.presenter)
</script>

{#await component then ctor}
  <svelte:component this={ctor} {attribute} editable = {true} {maxWidth} bind:value />
{:catch err}
  <Icon icon={ui.icon.Error} size="32" /> {err}
{/await}
