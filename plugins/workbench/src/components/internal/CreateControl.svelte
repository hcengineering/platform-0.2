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
  import ui from '@anticrm/platform-ui'

  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import PopupMenu from '@anticrm/sparkling-controls/src/menu/PopupMenu.svelte'
  import PopupItem from '@anticrm/sparkling-controls/src/menu/PopupItem.svelte'

  import { ItemCreator } from '../..'

  export let creators: ItemCreator[] = []
  export let onCreatorClick: (_id: ItemCreator) => void = () => {}
</script>

{#if creators.length === 0}
  <div />
{:else if creators.length === 1}
  <div class="control" on:click={() => onCreatorClick(creators[0])}>
    <Icon icon={ui.icon.Add} button={true} />
    <div class="controlLabel">New {creators[0].name}</div>
  </div>
{:else}
  <PopupMenu>
    <div class="control" slot="trigger">
      <Icon icon={ui.icon.Add} button={true} />
      <div class="controlLabel">New…</div>
    </div>
    {#each creators as creator}
      <PopupItem on:click={() => onCreatorClick(creator)}>
        {creator.name}
      </PopupItem>
    {/each}
  </PopupMenu>
{/if}

<style lang="scss">
  .control {
    display: flex;
    align-items: center;
  }

  .controlLabel {
    font-weight: 500;
    padding-left: 5px;
  }
</style>
