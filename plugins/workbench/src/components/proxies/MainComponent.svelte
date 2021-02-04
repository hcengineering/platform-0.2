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
  import { Platform } from '@anticrm/platform'
  import { Ref, Space } from '@anticrm/core'
  import { getContext } from 'svelte'

  import ui, { AnyComponent } from '@anticrm/platform-ui'
  import { WorkbenchApplication } from '../..'

  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import Spinner from '@anticrm/platform-ui/src/components/internal/Spinner.svelte'

  export let is: AnyComponent | undefined
  export let application: Ref<WorkbenchApplication>
  export let space: Ref<Space>

  const platform = getContext("platform") as Platform
  $: component = is ? platform.getResource(is) : null
</script>

{#if component}
{#await component}
  <Spinner />
{:then ctor}
  <svelte:component this={ctor} {application} {space} on:open/>
{:catch}
  <Icon icon={ui.icon.Error} size="32" />
{/await}
{/if}
