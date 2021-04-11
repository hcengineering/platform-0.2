<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  // --- 'small', 'large' --- //
  export let size = ''
  // --- 'primary', 'transparent' --- //
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
  @import '~@anticrm/sparkling-theme/styles/_global.scss';

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
    transition: border-color 0.2s, color 0.2s, background-color 0.2s;
    &:focus {
      outline: none;
    }
  }
  :global(.theme-dark) .button {
    color: $theme-dark-content-color;
    background-color: $theme-dark-bg-accent-color;
    border-color: $theme-dark-bg-accent-color;
    &:hover {
      background-color: $theme-dark-bg-accent-hover;
      color: $theme-dark-content-dark-color;
    }
  }
  :global(.theme-grey) .button {
    color: $theme-grey-content-color;
    background-color: $theme-grey-bg-accent-color;
    border-color: $theme-grey-bg-accent-color;
    &:hover {
      background-color: $theme-grey-bg-accent-hover;
      color: $theme-grey-content-dark-color;
    }
  }
  :global(.theme-light) .button {
    color: $theme-light-content-color;
    background-color: $theme-light-bg-accent-color;
    border-color: $theme-light-bg-accent-color;
    &:hover {
      background-color: $theme-light-bg-accent-hover;
      color: $theme-light-content-dark-color;
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

  :global(.theme-dark) .primary {
    background-color: $theme-dark-content-color;
    border-color: $theme-dark-content-color;
    color: $theme-dark-bg-color;
    &:hover {
      background-color: $theme-dark-content-dark-color;
      border-color: $theme-dark-content-dark-color;
      color: $theme-dark-bg-color;
    }
  }
  :global(.theme-grey) .primary {
    background-color: $theme-grey-content-color;
    border-color: $theme-grey-content-color;
    color: $theme-grey-bg-color;
    &:hover {
      background-color: $theme-grey-content-dark-color;
      border-color: $theme-grey-content-dark-color;
      color: $theme-grey-bg-color;
    }
  }
  :global(.theme-dark) .primary {
    background-color: $theme-dark-content-color;
    border-color: $theme-dark-content-color;
    color: $theme-dark-bg-color;
    &:hover {
      background-color: $theme-dark-content-dark-color;
      border-color: $theme-dark-content-dark-color;
      color: $theme-light-bg-color;
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
    &:focus {
      outline: none;
    }
  }
  :global(.theme-dark) .transparent {
    color: $theme-dark-content-color;
    background-color: transparent;
    &:hover {
      color: $theme-dark-caption-color;
      background-color: transparent;
    }
  }
  :global(.theme-grey) .transparent {
    color: $theme-grey-content-color;
    background-color: transparent;
    &:hover {
      color: $theme-grey-caption-color;
      background-color: transparent;
    }
  }
  :global(.theme-light) .transparent {
    color: $theme-light-content-color;
    background-color: transparent;
    &:hover {
      color: $theme-light-caption-color;
      background-color: transparent;
    }
  }
</style>
