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
  import type { Platform } from '@anticrm/platform'
  import { getContext } from 'svelte'

  import type { AnyComponent } from '@anticrm/platform-ui'
  import ui from '@anticrm/platform-ui'
  import Spinner from '@anticrm/platform-ui/src/components/internal/Spinner.svelte'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import type { AttrModel } from '../../../index'

  export let is: AnyComponent | undefined
  export let value: any
  export let attribute: AttrModel
  export let editable = true
  export let maxWidth = 300
  export let maxHeight = 72

  let component: Promise<any>

  const platform = getContext('platform') as Platform
  $: component = is ? platform.getResource(is) : null

  const styles = {
    'max-width': `${maxWidth}px`,
    'max-height': `${maxHeight}px`,
    overflow: 'hidden'
  }

  $: cssVarStyles = Object.entries(styles)
    .map(([key, value]) => `${key}:${value}`)
    .join(';')
</script>

{#if component}
  {#await component}
    <Spinner />
  {:then ctor}
    <div style={cssVarStyles}>
      <svelte:component this={ctor} {attribute} {value} {editable} on:change />
    </div>
  {:catch err}
    <Icon icon={ui.icon.Error} size="32" />
  {/await}
{/if}
