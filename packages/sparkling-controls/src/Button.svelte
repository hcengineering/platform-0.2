<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  // --- 'small', 'large' --- //
  export let size: string = ''
  // --- 'primary', 'transparent' --- //
  export let kind: string = ''
  // --- ex: '100px', '25%' --- //
  export let width: string = ''

  const dispatch = createEventDispatcher();
  function onClick(event) {
    dispatch('click', event);
  }
</script>

<button
  type="button"
  class="button {size} {kind}"
  style="{(width !== '') ? 'width:' + width : ''}"
  on:click={onClick}
>
  <slot />
</button>

<style lang="scss">
  
</style>