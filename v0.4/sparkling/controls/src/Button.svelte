<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  // --- 'small', 'large' --- //
  export let size = ''
  // --- 'primary', 'icon', 'transparent' --- //
  export let kind = ''
  // --- ex: '100px', '25%' --- //
  export let width = ''

  export let label = ''

  const dispatch = createEventDispatcher()
  function onClick (event) {
    dispatch('click', event)
  }
</script>

<button type="button" class="button {size} {kind}" style={width !== '' ? 'width:' + width : ''} on:click={onClick}>
  <slot />{label}
</button>

<style lang="scss">
  .button {
    display: inline-block;
    height: auto;
    border: solid 1px transparent;
    border-radius: 12px;
    padding: 8px 16px;
    cursor: pointer;
    user-select: none;
    font: inherit;
    font-weight: 500;
    font-size: 14px;
    color: var(--theme-content-color);
    background-color: var(--theme-bg-accent-color);
    border-color: var(--theme-bg-accent-color);
    transition: border-color 0.2s, color 0.2s, background-color 0.2s;
    &:focus {
      outline: none;
    }
    &:hover {
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

  .icon {
    padding: 14px 28px;
    border-radius: 8px;
    color: var(--theme-content-color);
    background-color: var(--theme-bg-accent-color);
    border: solid 1px var(--theme-bg-accent-color);
    &:hover {
      color: var(--theme-caption-color);
      border-color: var(--theme-bg-dark-hover);
    }
  }

  .transparent {
    display: flex;
    border: none;
    cursor: pointer;
    user-select: none;
    font-weight: 500;
    align-items: center;
    justify-content: center;
    flex-wrap: nowrap;
    padding: 0;
    margin: 0;
    color: var(--theme-content-color);
    background-color: transparent;
    &:focus {
      outline: none;
    }
    &:hover {
      color: var(--theme-caption-color);
      background-color: transparent;
    }
  }
</style>
