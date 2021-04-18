<script lang="ts">
  export let label: string
  export let width: string
  export let value: string
  export let placeholder: string
  export let password: boolean = false
  export let id: string | undefined = undefined
  let input: HTMLElement
</script>

<div class="editbox" style="{width ? 'width: ' + width : ''}" on:click={() => input.focus()}>
  {#if label}
    <div class="label">{label}</div>
  {/if}
  {#if password}
    <input type="password" bind:this={input} {id} bind:value {placeholder}/>
  {:else}
    <input type="text" bind:this={input} {id} bind:value {placeholder}/>
  {/if}
</div>

<style lang="scss">
  .editbox {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 56px;
    padding: 10px 20px;
    background-color: var(--theme-bg-accent-color);
    border: 1px solid var(--theme-border-accent-color);
    border-radius: 10px;
    backdrop-filter: blur(12px);

    &:focus-within {
      background-color: var(--theme-bg-accent-hover);
      border-color: var(--theme-border-accent-hover);
    }
    .label {
      font-size: 12px;
      line-height: 14px;
      color: var(--theme-caption-color);
      text-shadow: var(--theme-text-shadow);
      opacity: .3;
    }
    input {
      background-color: transparent;
      border: none;
      padding: 0;
      font-size: 14px;
      line-height: 17px;
      color: var(--theme-caption-color);
      outline: none;
      text-shadow: var(--theme-text-shadow);
    }
  }
</style>
