<script lang="ts">
  export let checked = false
  export let toRight = false
  export let editable = true
  export let fullWidth = true
  export let label = ''

  function toggleState () {
    if (editable) {
      checked = !checked
    }
  }
</script>

<div class="checkbox-container">
  {#if !toRight}
    <div class="checkbox" class:active={checked} on:click={toggleState} />
    <div class="separator" />
  {/if}
  <div class={fullWidth ? 'input-label-full' : 'input-label'} on:click={toggleState}>
    <slot />{label}
  </div>
  {#if toRight}
    <div class="separator" />
    <div class="checkbox" class:active={checked} on:click={toggleState} />
  {/if}
</div>

<style lang="scss">
  @import "~@anticrm/sparkling-theme/styles/_global.scss";

  .checkbox-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor: pointer;

    .separator {
      width: 8px;
    }

    .input-label {
      flex-grow: 0;
    }
    .input-label-full {
      flex-grow: 1;
    }

    .checkbox {
      width: 43px;
      height: 22px;
      border-radius: 16px;
      position: relative;
      cursor: pointer;
      transition: all 0.2s ease-in-out;

      &::after {
        content: '';
        position: absolute;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        top: 3px;
        left: 3px;
        transition: all 0.2s ease-in-out;
      }
    }

    .active {
      &::after {
        content: '';
        position: absolute;
        border-radius: 16px;
        width: 16px;
        height: 16px;
        top: 3px;
        left: calc(100% - 19px);
        z-index: 1002;
        transition: all 0.2s ease-in-out;
      }
    }
  }

  :global(.theme-dark) .checkbox-container {
    &:hover > .checkbox {
      border: solid 1px $theme-dark-bg-dark-hover;
    }
    &:hover > .checkbox::before {
      background-color: $theme-dark-bg-dark-hover;
    }
    .checkbox {
      background-color: $theme-dark-bg-accent-color;
      border: solid 1px $theme-dark-bg-dark-color;
      &::after {
        background-color: $theme-dark-content-color;
      }
      &:hover {
        background-color: $theme-dark-bg-accent-hover;
        border-color: $theme-dark-bg-dark-hover;
      }
    }
    .active {
      background-color: $theme-dark-bg-dark-hover;
      border: solid 1px $theme-dark-bg-dark-hover;
      &::after {
        background-color: $theme-dark-content-color;
      }
      &:hover {
        background-color: $theme-dark-bg-dark-hover;
        border-color: $theme-dark-content-color;
      }
    }
  }
  :global(.theme-grey) .checkbox-container {
    &:hover > .checkbox {
      border: solid 1px $theme-grey-bg-dark-hover;
    }
    &:hover > .checkbox::before {
      background-color: $theme-grey-bg-dark-hover;
    }
    .checkbox {
      background-color: $theme-grey-bg-accent-color;
      border: solid 1px $theme-grey-bg-dark-color;
      &::after {
        background-color: $theme-grey-content-color;
      }
      &:hover {
        background-color: $theme-grey-bg-accent-hover;
        border-color: $theme-grey-bg-dark-hover;
      }
    }
    .active {
      background-color: $theme-grey-bg-dark-hover;
      border: solid 1px $theme-grey-bg-dark-hover;
      &::after {
        background-color: $theme-grey-content-color;
      }
      &:hover {
        background-color: $theme-grey-bg-dark-hover;
        border-color: $theme-grey-content-color;
      }
    }
  }
  :global(.theme-light) .checkbox-container {
    &:hover > .checkbox {
      border: solid 1px $theme-light-bg-dark-hover;
    }
    &:hover > .checkbox::before {
      background-color: $theme-light-bg-dark-hover;
    }
    .checkbox {
      background-color: $theme-light-bg-accent-color;
      border: solid 1px $theme-light-bg-dark-color;
      &::after {
        background-color: $theme-light-content-color;
      }
      &:hover {
        background-color: $theme-light-bg-accent-hover;
        border-color: $theme-light-bg-dark-hover;
      }
    }
    .active {
      background-color: $theme-light-bg-dark-hover;
      border: solid 1px $theme-light-bg-dark-hover;
      &::after {
        background-color: $theme-light-content-color;
      }
      &:hover {
        background-color: $theme-light-bg-dark-hover;
        border-color: $theme-light-content-color;
      }
    }
  }
</style>
