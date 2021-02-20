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

<script>
  import Theme from '@anticrm/sparkling-theme/src/components/Theme.svelte'
  import ThemeSelector from '@anticrm/platform-ui/src/components/internal/ThemeSelector.svelte'

  export let child
  export let props = {}
</script>

<Theme>
  <div style="position: relative; width: 100%; height: 100vh; background-color: var(--theme-bg-color);">
    {#if typeof(props.content) !== 'undefined'}
      <svelte:component this={child} {...props} >{props.content}</svelte:component>
    {:else}
      <svelte:component this={child} {...props} />
    {/if}
    <div style="position: absolute; right: 0; top: 0; width: 150px; border: 1px solid var(--theme-bg-dark-color); text-align: center">
      <ThemeSelector />
    </div>
  </div>
</Theme>
