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
  import type { WorkbenchApplication } from '../..'

  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import Spinner from '@anticrm/platform-ui/src/components/internal/Spinner.svelte'
  import type { Space } from '@anticrm/domains'

  export let is: AnyComponent | undefined
  export let application: WorkbenchApplication
  export let space: Space | undefined

  const platform = getContext('platform') as Platform
  let component: AnyComponent
  const compUpdate = (e) => {
    if (component !== e) {
      component = e
    }
    return e
  }
  let componentPromise = new Promise((resolve) => {
    if (is) {
      platform
        .getResource(is)
        .then(compUpdate)
        .then(() => resolve())
    }
  })
  $: {
    if (is) {
      componentPromise = platform.getResource(is).then(compUpdate)
    }
  }
</script>

{#await componentPromise}
  <Spinner />
{:then ctor}
  <svelte:component this={component} {application} {space} on:open />
{:catch err}
  <Icon icon={ui.icon.Error} size="32" />
  {{ err }}
{/await}
