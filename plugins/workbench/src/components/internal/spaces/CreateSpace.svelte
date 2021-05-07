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
  import { getContext, createEventDispatcher } from 'svelte'

  import { Platform } from '@anticrm/platform'
  import { AnyComponent } from '@anticrm/platform-ui'
  import type { WorkbenchApplication } from '@anticrm/workbench'
  import Spinner from '@anticrm/platform-ui/src/components/internal/Spinner.svelte'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'

  import DefaultSpaceCreator from './DefaultSpaceCreator.svelte'
  import workbench from '../../..'

  const dispatch = createEventDispatcher()

  export let application: WorkbenchApplication
  let makePrivate = false

  let componentP: Promise<AnyComponent | undefined>

  const platform = getContext('platform') as Platform
  $: componentP = application.spaceCreator ? platform.getResource(application.spaceCreator) : Promise.resolve(undefined)
</script>

<div class="root">
  <div class="header">
    <div class="caption-1">Create {makePrivate ? 'private ' : ''} {application.spaceTitle}</div>
    <a href="/" on:click|preventDefault={() => dispatch('close')}>
      <Icon icon={workbench.icon.Close} button={true} />
    </a>
  </div>
  {#if application.spaceCreator !== undefined}
    {#await componentP}
      <Spinner />
    {:then component}
      <svelte:component this={component} {application} bind:makePrivate on:close />
    {/await}
  {:else}
    <DefaultSpaceCreator {application} bind:makePrivate on:close />
  {/if}
</div>

<style lang="scss">
  .root {
    padding: 24px;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
</style>
