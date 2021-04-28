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
  import { createEventDispatcher, getContext } from 'svelte'
  const dispatch = createEventDispatcher()
  const stateContext = getContext('table-state')

  // eslint-disable-next-line no-unused-vars
  enum SortOrder {
    // eslint-disable-next-line no-unused-vars
    UNSORTED = 'Unsorted',
    // eslint-disable-next-line no-unused-vars
    ASC = 'Ascending',
    // eslint-disable-next-line no-unused-vars
    DESC = 'Descending'
  }

  export let dir = SortOrder.UNSORTED
  export let key

  const labels = {
    [SortOrder.ASC]: { title: 'Ascending', html: '&#8638;' }, // title is gonna be intl value
    [SortOrder.DESC]: { title: 'Descending', html: '&#8595;' },
    [SortOrder.UNSORTED]: { title: 'Unsorted', html: '&#10607;' }
  }

  function onClick (event) {
    const state = stateContext.getState()

    const detail = {
      originalEvent: event,
      key,
      dir: dir !== SortOrder.DESC ? SortOrder.DESC : SortOrder.ASC,
      rows: state.filteredRows
    }

    dispatch('sort', detail)

    if (detail.preventDefault !== true) {
      dir = detail.dir
    }
    stateContext.setRows(detail.rows)
  }
</script>

<span class="sort" on:click={onClick}>
  {#if dir === SortOrder.ASC}
    <span title={labels[SortOrder.ASC].title}>
      {@html labels[SortOrder.ASC].html}
    </span>
  {:else if dir === SortOrder.DESC}
    <span title={labels[SortOrder.DESC].title}>
      {@html labels[SortOrder.DESC].html}
    </span>
  {:else}
    <span title={labels[SortOrder.UNSORTED].title}>
      {@html labels[SortOrder.UNSORTED].html}
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
