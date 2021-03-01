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
  import { AttrModel } from '../../../../index'
  import InlineEdit from '@anticrm/sparkling-controls/src/InlineEdit.svelte'
  import { CORE_CLASS_ARRAY_OF, CORE_CLASS_INSTANCE_OF } from '@anticrm/core'

  export let value: string
  export let attribute: AttrModel
  export let maxWidth: number = 300
  export let editable: boolean
  export let textWrap: boolean

  // Do not allow edit of arrays and instances by this string presenter.
  $: readOnlyField = !editable || (attribute && (attribute.type._class === CORE_CLASS_ARRAY_OF || attribute.type._class === CORE_CLASS_INSTANCE_OF))
</script>

<style lang="scss">
  .wrapped-text {
    overflow-wrap: break-word;
    word-wrap: break-word;
    hyphens: auto;
  }
</style>

{#if readOnlyField}
  {#if maxWidth}
    <div style={ 'max-width:' + maxWidth + 'px' }>
      <div class="wrapped-text">
        {value}
      </div>
    </div>
  {:else}
    {value}
  {/if}
{:else}
  <InlineEdit bind:value placeholder={attribute.placeholder || ""} {maxWidth} {editable} />
{/if}
