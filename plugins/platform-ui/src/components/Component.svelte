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
  import { getContext, onMount } from 'svelte'

  import ui, { AnyComponent } from '@anticrm/platform-ui'
  import Spinner from './internal/Spinner.svelte'
  import Icon from './Icon.svelte'

  export let is: AnyComponent | undefined
  export let props: any

  const platform = getContext('platform') as Platform
  let component: AnyComponent
  const compUpdate = e => {
    if (component !== e) {
      component = e
    }
    return e
  }
  let componentPromise = new Promise((resolve) => {
    if (is) {
      platform.getResource(is).then(compUpdate).then(() => resolve())
    }
  })
  $: {
    if (is) {
      componentPromise = platform.getResource(is).then(compUpdate)
    }
  }
</script>

{#await componentPromise }
  <Spinner />
{:then ctor}
  <svelte:component this={ctor} {...props} on:change on:close on:open />
{:catch err}
  ERROR: {console.log(err, JSON.stringify(component))} {props} { err }
  <Icon icon={ui.icon.Error} size="32" />
{/await}
