<script context="module" lang="ts">
  export interface PaginationState {}

  export interface OnPageChangeEvent {
    originalEvent: CustomEvent
    page: number
    pageIndex: number
  }
</script>

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
    const detail: OnPageChangeEvent = {
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
    color: white;
  }

  ul {
    flex: 1;
    float: right;
    list-style: none;
  }

  li {
    float: left;
  }

  button {
    background: #242429;
    color: white;
    border: 1px solid #ccc;
    padding: 5px 10px;
    margin-left: 3px;
    float: left;
    cursor: pointer;
  }
</style>
