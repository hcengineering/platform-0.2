<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte'
  import { filter } from './utils'
  const dispatch = createEventDispatcher()
  const stateContext = getContext('table-state')

  export let index = -1
  export let text = ''

  export let labels = {
    placeholder: 'Search'
  }

  function onSearch (event) {
    const state = stateContext.getState()
    const detail = {
      originalEvent: event,
      filter,
      index,
      text,
      page: state.page,
      pageIndex: state.pageIndex,
      pageSize: state.pageSize,
      rows: state.filteredRows
    }
    dispatch('search', detail)

    if (detail.preventDefault !== true) {
      if (detail.text.length === 0) {
        stateContext.setRows(state.rows)
      } else {
        stateContext.setRows(
          detail.rows.filter(r => detail.filter(r, detail.text, index))
        )
      }
      stateContext.setPage(0, 0)
    } else {
      stateContext.setRows(detail.rows)
    }
  }
</script>

<style>
    .control-container {
        width: 100%;
        height: 50px;
        background: #333;
        border-radius: 15px;
        margin: 20px;
        display: flex;
        align-items: center;
        padding: 10px 0;
    }
    .search {
        width: 33.3%;
        float: right;
    }
    .search input {
        width: 100%;
        border: 1px solid #eee;
        border-radius: 3px;
        padding: 5px 3px;
    }

    @media screen and (max-width: 767px) {
        .search {
            width: 100%;
        }
    }
</style>
<div class="control-container">
  <div class="search">
    <input
      type="search"
      title={labels.placeholder}
      placeholder={labels.placeholder}
      bind:value={text}
      on:keydown={onSearch} />
  </div>

</div>
