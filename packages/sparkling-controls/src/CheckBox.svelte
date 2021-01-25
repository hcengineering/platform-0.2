<script lang="ts">
  export let checked: boolean = false
  export const right: boolean = false
</script>

<div class="checkbox-container">
  {#if (!right)}
    <div class="checkbox" class:active={checked} on:click={() => {checked = !checked}}></div>
    <div class="separator"></div>
  {/if}
  <div class="input-label" on:click={() => {checked = !checked}}>
    <slot />
  </div>
  {#if (right)}
    <div class="separator"></div>
    <div class="checkbox" class:active={checked} on:click={() => {checked = !checked}}></div>
  {/if}
</div>

<style lang="scss">
  .checkbox-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 0.5em;
    cursor: pointer;
    &:hover>.checkbox {
      border: solid 1px var(--theme-bg-dark-color);
      box-shadow: 0 0 2px 2px var(--theme-highlight-color);
    }
    &:hover>.checkbox::before {
      background-color: var(--theme-bg-dark-color);
    }

    .separator {
      width: 1em;
    }

    .checkbox {
      width: 35px;
      height: 20px;
      border: solid 1px var(--theme-bg-accent-color);
      border-radius: 4px;
      position: relative;
      cursor: pointer;
      transition: all .2s ease-in-out;

      &::before {
        content: '';
        position: absolute;
        background-color: var(--theme-bg-accent-color);
        border-radius: 4px;
        width: 16px;
        height: 16px;
        top: 2px;
        left: 2px;
        transition: all .2s ease-in-out;
      }
      &:hover {
        border: solid 1px var(--theme-bg-dark-color);
        box-shadow: 0 0 2px 2px var(--theme-highlight-color);

        &::before {
          background-color: var(--theme-bg-dark-color);
        }
      }
    }
    .active {
      background-color: var(--theme-bg-accent-color);
      border: solid 1px var(--theme-bg-dark-color);

      &::before {
        content: '';
        position: absolute;
        background-color: var(--theme-bg-dark-color);
        border-radius: 4px;
        width: 16px;
        height: 16px;
        top: 2px;
        left: calc(100% - 18px);
        transition: all .2s ease-in-out;
      }
      &::after {
        content: '';
        background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z'/%3E%3C/svg%3E%0A");
        width: 12px;
        height: 12px;
        top: 4px;
        left: 3px;
        position: absolute;
      }
    }
  }
</style>