<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let label: string = ''
  export let primary: boolean = false
  export let fullWidth: boolean = false

  const dispatch = createEventDispatcher()
  function onClick (event: MouseEvent) {
    dispatch('click', event)
  }
</script>

<button class="button" class:primary={primary} style="{fullWidth ? 'width: 100%' : ''}" on:click={onClick}>
  <slot />{label}
</button>

<style lang="scss">
  .button {
    display: inline-block;	
    padding: 0 25px;
    height: 56px;
    font-size: 14px;
    font-weight: 400;
    color: #fff;
    background-color: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 3%);
    border-radius: 10px;
    outline: none;
    cursor: pointer;
    &:hover {
      background-color: rgb(255 255 255 / 6%);
      border: 1px solid rgb(255 255 255 / 8%);
    }
    &:active {
      background-color: rgb(255 255 255 / 9%);
      border: 1px solid rgb(255 255 255 / 12%);
    }
  }

  .primary {
    background-color: #5143A8;
    border-color: rgb(255 255 255 / 10%);
    &:hover {
      background-color: #5143A8;
      border-color: rgb(255 255 255 / 10%);
    }
    &:active {
      background-color: #5143A8;
      border-color: rgb(255 255 255 / 10%);
    }
  }
</style>
