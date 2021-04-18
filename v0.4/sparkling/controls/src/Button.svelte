<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let label: string
  export let primary: boolean = false
  export let width: string

  const dispatch = createEventDispatcher()
  function onClick (event: MouseEvent) {
    dispatch('click', event)
  }
</script>

<button class="button" class:primary={primary} style="{width ? 'width: ' + width : ''}" on:click={onClick}>
  <div>{label}</div>
</button>

<style lang="scss">
  .button {
    height: 56px;
    padding: 0;
    border: none;
    overflow: hidden;
    background-color: var(--theme-bg-accent-color);
    border-radius: 10px;
    outline: none;
    cursor: pointer;
    backdrop-filter: blur(12px);

    div {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 25px;
      width: 100%;
      height: 100%;

      font-size: 14px;
      line-height: 17px;
      font-weight: 400;

      color: var(--theme-caption-color);
      border: 1px solid var(--theme-border-accent-color);
      border-radius: 10px;
      text-shadow: var(--theme-text-shadow);
      &:hover {
        background-color: var(--theme-bg-accent-hover);
        border: 1px solid var(--theme-border-accent-hover);
      }
      &:active {
        background-color: var(--theme-bg-accent-active);
        border: 1px solid var(--theme-border-accent-active);
      }
    }
  }

  .primary {
    background-color: var(--theme-primary-color);
  }
</style>
