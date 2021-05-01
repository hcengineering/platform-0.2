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
  import type { Platform } from '@anticrm/plugin'
  import { getContext } from 'svelte'
  import type { AnyComponent } from '@anticrm/plugin-ui'
  import ui from '@anticrm/plugin-ui'
  
  import { Spinner } from '@anticrm/sparkling-controls'
  
  import Icon from './Icon.svelte'
  import ErrorBoundary from './internal/ErrorBoundary'

  export let is: AnyComponent
  export let props: any

  const platform = getContext('platform') as Platform
  $: component = platform.getResource(is)
</script>

{#await component}
  <div class="spinner-container"><div class="inner"><Spinner /></div></div>
{:then Ctor}
  <ErrorBoundary>
    <Ctor {...props} on:change on:close on:open />
  </ErrorBoundary>
{:catch err}
  ERROR: {console.log(err, JSON.stringify(component))}
  {props}
  {err}
  <Icon icon={ui.icon.Error} size="32" />
{/await}

<style lang="scss">

.spinner-container {
  display: flex;
  height: 100%;
}

.spinner-container .inner {
  margin: auto
}

</style>
