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
  import type { Space } from '@anticrm/domains'

  import EditBox from '@anticrm/sparkling-controls/src/EditBox.svelte'
  import SpaceBox from '@anticrm/platform-ui/src/components/SpaceBox.svelte'

  import type { Vacancy } from '..'

  export let vacancy: Vacancy
  export let spaces: Space[]
  export let space: Space | undefined
</script>

<div class="form">
  {#if spaces && spaces.length > 1}
    <SpaceBox label="Vacancy" {spaces} bind:space />
  {/if}
  <EditBox bind:value={vacancy.title} label="Title" />
  <EditBox bind:value={vacancy.description} label="Description" />
  <EditBox bind:value={vacancy.location} label="Location" placeholder="Russia, Novosibirsk" />
  <EditBox bind:value={vacancy.salary} label="Salary" />
</div>

<style lang="scss">
  .form {
    display: grid;
    grid-template-columns: auto;
    grid-gap: 10px;
  }
</style>
