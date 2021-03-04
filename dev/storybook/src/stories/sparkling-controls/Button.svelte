<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  // --- 'small', 'large' --- //
  export let size: string = ''
  // --- 'primary', 'transparent' --- //
  export let kind: string = ''
  // --- ex: '100px', '25%' --- //
  export let width: string = ''

  export let label: string = ''

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
  <slot>{label}</slot>
</button>

<style lang="scss">
  .button {
    display: inline-block;
    border: 1px solid var(--theme-bg-dark-color);
    height: auto;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    user-select: none;

    font: inherit;
    font-weight: 500;
    font-size: 14px;

    color: var(--theme-content-color);
    background-color: var(--theme-bg-accent-color);
    transition: border-color .2s, color .2s, background-color .2s;

    &:focus {
      outline: none;
    }
    &:hover {
      border-color: var(--theme-bg-dark-hover);
      background-color: var(--theme-bg-accent-hover);
      color: var(--theme-content-dark-color);
    }
  }

  .large {
    height: auto;
    padding: 16px 32px;
  }

  .small {
    height: auto;
    padding: 0 4px;
  }

  .primary {
    background-color: var(--theme-content-color);
    border-color: var(--theme-content-color);
    color: var(--theme-bg-color);

    &:hover {
      background-color: var(--theme-content-dark-color);
      border-color: var(--theme-content-dark-color);
      color: var(--theme-bg-color);
    }
  }

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
      background-color: transparent;
      color: var(--theme-caption-color);
    }
  }
</style>