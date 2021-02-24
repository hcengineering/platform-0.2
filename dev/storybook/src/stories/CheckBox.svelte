<script lang="ts">
  export let checked: boolean = false
  export let toRight: boolean = false
  export let editable: boolean = true
  export let fullWidth: boolean = true

  export let label: string = 'Text'

  function toggleState () {
    if (editable) {
      checked = !checked
    }
  }
</script>

<div class="checkbox-container">
  {#if (!toRight)}
    <div class="checkbox" class:active={checked} on:click={toggleState}></div>
    <div class="separator"></div>
  {/if}
  <div class="{fullWidth ? 'input-label-full' : 'input-label'}" on:click={toggleState}>
    {label}
  </div>
  {#if (toRight)}
    <div class="separator"></div>
    <div class="checkbox" class:active={checked} on:click={toggleState}></div>
  {/if}
</div>

<style lang="scss">
  .checkbox-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor: pointer;

    &:hover > .checkbox {
      border: solid 1px var(--theme-bg-dark-hover);
    }

    &:hover > .checkbox::before {
      background-color: var(--theme-bg-dark-hover);
    }

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
      background-color: var(--theme-bg-accent-color);
      border: solid 1px var(--theme-bg-dark-color);
      border-radius: 16px;
      position: relative;
      cursor: pointer;
      transition: all .2s ease-in-out;

      &::after {
        content: '';
        position: absolute;
        background-color: var(--theme-content-color);
        border-radius: 50%;
        width: 16px;
        height: 16px;
        top: 3px;
        left: 3px;
        transition: all .2s ease-in-out;
      }

      &:hover {
        background-color: var(--theme-bg-accent-hover);
        border-color: var(--theme-bg-dark-hover);
      }
    }

    .active {
      background-color: var(--theme-bg-dark-hover);
      border: solid 1px var(--theme-bg-dark-hover);

      &::after {
        content: '';
        position: absolute;
        background-color: var(--theme-content-color);
        border-radius: 16px;
        width: 16px;
        height: 16px;
        top: 3px;
        left: calc(100% - 19px);
        z-index: 1002;
        transition: all .2s ease-in-out;
      }

      &:hover {
        background-color: var(--theme-bg-dark-hover);
        border-color: var(--theme-content-color);
      }
    }
  }
</style>
