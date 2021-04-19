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
  import { createEventDispatcher, getContext } from 'svelte'
  const dispatch = createEventDispatcher()
  const stateContext = getContext('table-state')

  export let dir = 'none'
  export let key
  export let labels = {
    asc: { title: 'Ascending', html: '&#8638;' },
    desc: { title: 'Desceding', html: '&#8595;' },
    unsorted: { title: 'Unsorted', html: '&#10607;' }
  }

  function onClick (event) {
    const state = stateContext.getState()

    const detail = {
      originalEvent: event,
      key,
      dir: dir !== 'desc' ? 'desc' : 'asc',
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
  {#if dir === 'asc'}
    <span title={labels.asc.title}>
      {@html labels.asc.html}
    </span>
  {:else if dir === 'desc'}
    <span title={labels.desc.title}>
      {@html labels.desc.html}
    </span>
  {:else}
    <span title={labels.unsorted.title}>
      {@html labels.unsorted.html}
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
