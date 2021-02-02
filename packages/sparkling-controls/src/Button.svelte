<script lang="ts">
  export let className: string = ''
</script>

<button
  type="button"
  class="button {className}"
  on:click
>
  <slot />
</button>

<style lang="scss">
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
      color: var(--theme-caption-color);
    }
  }

  .actionButtonLeft {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25em;
    border-radius: 4px 0 0 4px;
  }
  .actionButtonCenter {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25em;
    border-radius: 0px;
    border-left: none;
    border-right: none;
  }
  .actionButtonRight {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25em;
    border-radius: 0 4px 4px 0;
  }
  .w40 {
    flex-basis: 40%;
    width: 40%;
  }
  .w20 {
    flex-basis: 20%;
    width: 20%;
  }
</style>