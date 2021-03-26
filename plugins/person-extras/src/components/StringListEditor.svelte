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
  import workbench from '@anticrm/workbench/src/__model__'

  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import EditBox from '@anticrm/sparkling-controls/src/EditBox.svelte'

  export let items: string[]
  export let label: string

  function addSkill() {
    items = [...items, '']
  }
</script>

{#if items.length > 0}
  <div class="root">
    {#each items as item}
      <EditBox bind:value={item} width="100%" {label} placeholder={label} />
    {/each}
  </div>
{/if}
<div class="add" on:click={addSkill}>
  <Icon icon={workbench.icon.Add} button={true} />
  <div class="add-label">Add {label}</div>
</div>

<style lang="scss">
  .root {
    display: grid;
    grid-template-columns: auto;
    grid-gap: 5px;

    padding: 5px;
    border: 1px solid;
    border-radius: 5px;
    border-color: var(--theme-bg-accent-color);
  }

  .add {
    display: flex;
    align-items: center;

    cursor: pointer;
  }

  .add-label {
    padding-left: 5px;
    font-weight: 500;
  }
</style>
