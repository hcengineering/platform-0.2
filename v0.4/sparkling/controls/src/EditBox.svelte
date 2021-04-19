<script lang="ts">
  export let label: string
  export let width: string
  export let value: string
  export let password: boolean
  export let id: string | undefined
</script>

<div class="editbox" style="{width ? 'width: ' + width : ''}">
  {#if password}
    <input type="password" class="{label ? '' : 'nolabel'}" {id} bind:value placeholder=" "/>
  {:else}
    <input type="text" class="{label ? '' : 'nolabel'}" {id} bind:value placeholder=" "/>
  {/if}
  {#if label}
    <div class="label">{label}</div>
  {/if}
</div>

<style lang="scss">
  .editbox {
    position: relative;
    font-family: inherit;
    height: 56px;
    background-color: var(--theme-bg-accent-color);
    border: 1px solid var(--theme-border-accent-color);
    border-radius: 10px;
    backdrop-filter: blur(12px);
    &:focus-within {
      background-color: var(--theme-bg-accent-hover);
      border-color: var(--theme-border-accent-hover);
    }
    input {
      width: 100%;
      height: 56px;
      padding: 14px 20px 0px;
      color: var(--theme-caption-color);
      background-color: transparent;
      outline: none;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      line-height: 17px;
    }
    .nolabel {
      padding-top: 0;
    }

    .label {
      position: absolute;
      top: 18px;
      left: 20px;
      font-size: 14px;
      color: var(--theme-caption-color);
      pointer-events: none;
      opacity: .3;
      transition: all 200ms;
    }
    input:focus + .label,
    input:not(:placeholder-shown) + .label {
      top: 10px;
      font-size: 12px; 
    }
  }
</style>
