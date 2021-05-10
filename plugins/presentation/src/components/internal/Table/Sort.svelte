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
  import { createEventDispatcher } from 'svelte'
  import { SortingOrder } from '@anticrm/core'

  const dispatch = createEventDispatcher()

  export let order: SortingOrder | undefined
  export let key

  function onClick () {
    switch (order) {
      case undefined:
        order = SortingOrder.Ascending
        break
      case SortingOrder.Ascending:
        order = SortingOrder.Descending
        break
      case SortingOrder.Descending:
        order = undefined
        break
    }

    dispatch('sort', { key, order })
  }
</script>

<span class="sort" on:click={onClick}>
  {#if order}
    {#if order === SortingOrder.Ascending}
      <span title={'Ascending'}>
        {@html '&#8638;'}
      </span>
    {:else if order === SortingOrder.Descending}
      <span title={'Descending'}>
        {@html '&#8595;'}
      </span>
    {/if}
  {:else}
    <span title={'Unsorted'}>
      {@html '&#10607;'}
    </span>
  {/if}
</span>

<style lang="scss">
  .sort {
    right: 0;
    cursor: pointer;
    padding: 0 0.25em;
    color: var(--theme-content-color);
  }
</style>
