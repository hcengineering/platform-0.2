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

  export let buttons = [-2, -1, 0, 1, 2]
  export let count: number
  export let page = 0
  export let pageSize = 10

  const labels = {
    first: '<<',
    last: '>>',
    next: '>',
    previous: '<'
  }

  $: pageCount = Math.floor(count / pageSize)

  function onChange (event: CustomEvent, toPage: number) {
    const detail = {
      originalEvent: event,
      page: toPage,
      pageIndex: toPage * pageSize
    }
    dispatch('pageChange', detail)

    if (detail.preventDefault !== true) {
      stateContext.setPage(detail.page, detail.pageIndex)
    }
  }
</script>

<ul>
  <li>
    <button disabled={page === 0} on:click={(e) => onChange(e, 0)}>
      {labels.first}
    </button>
  </li>
  <li>
    <button disabled={page === 0} on:click={(e) => onChange(e, page - 1)}>
      {labels.previous}
    </button>
  </li>
  {#each buttons as button}
    {#if page + button >= 0 && +page + button <= pageCount}
      <li>
        <button class:active={page === page + button} on:click={(e) => onChange(e, page + button)}>
          {page + button + 1}
        </button>
      </li>
    {/if}
  {/each}
  <li>
    <button disabled={page > pageCount - 1} on:click={(e) => onChange(e, page + 1)}>
      {labels.next}
    </button>
  </li>
  <li>
    <button disabled={page >= pageCount} on:click={(e) => onChange(e, pageCount)}>
      {labels.last}
    </button>
  </li>
</ul>

<style lang="scss">
  .active {
    background-color: var(--theme-bg-accent-color);
    border: 1px solid var(--theme-caption-color);
    color: var(--content-accent-color);
  }

  ul {
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
    list-style: none;
  }

  button {
    background: var(--theme-bg-color);
    color: var(--content-color);
    border: 1px solid var(--theme-content-dark-color);
    padding: 5px 10px;
    margin-left: 3px;
    float: left;
    cursor: pointer;
  }
</style>
