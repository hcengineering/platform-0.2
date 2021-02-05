<script lang="ts">
  // --- 'small', 'large' --- //
  export let size: string = ''
  // --- 'primary', 'transparent' --- //
  export let kind: string = ''
  // --- ex: '100px', '25%' --- //
  export let width: string = ''
</script>

<button
  type="button"
  class="button {size} {kind}"
  style="{(width !== '') ? 'width:' + width : ''}"
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