<script lang="ts">
  // --- prop 'size': small, large --- //
  export let size: string = ''
  // --- prop 'kind': primary, transparent --- //
  export let kind: string = ''

  if ((size !== 'small') || (size !== 'large')) size = ''
  if ((kind !== 'primary') || (kind !== 'transparent')) size = ''
</script>

<button
  type="button"
  class="button {size} {kind}"
  on:click
>
  <slot />
</button>

<style lang="scss">
  .transparent {
    display: flex;
    border: none;
    cursor: pointer;
    user-select: none;
    font-weight: 500;
    color: var(--theme-content-color);
    background-color: transparent;
    align-items: center;
    justify-content: center;
    flex-wrap: nowrap;
    padding: 0;
    margin: 0;

    &:focus {
      outline: none;
    }

    &:hover {
      color: var(--theme-caption-color);
    }
  }
</style>