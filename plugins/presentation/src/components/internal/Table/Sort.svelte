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

<style>
    .sort {
        right: 0;
        cursor: pointer;
        padding: 0 0.25em;
        color: #999;
    }
</style>

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
