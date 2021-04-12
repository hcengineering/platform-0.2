<script lang="ts">
  export let disabled = false
  export let selected = false
  export let style = ''
</script>

<button type="button" class="crm-toolbar-button small" {style} class:selected {disabled} on:click>
  <slot />
</button>

<style lang="scss">
  @import '~@anticrm/sparkling-theme/styles/_global.scss';

  .crm-toolbar-button {
    display: inline-block;
    border: 0px solid currentColor;
    border-radius: 2px;
    margin: 4px;
    padding: 0.5em 1em 0.5em;
    box-sizing: border-box;
    cursor: pointer;
    user-select: none;
    text-align: center;

    font: inherit;
    font-weight: 400;

    color: inherit;
    background-color: inherit;

    &:focus {
      outline: none;
    }
    &.selected {
      font-weight: bold;
    }
  }

  :global(.theme-dark) .crm-toolbar-button {
    &:focus {
      border-color: $theme-dark-doclink-color;
      box-shadow: inset 0px 0px 2px 0px $theme-dark-doclink-color;
    }
    &.selected {
      background-color: $theme-dark-bg-dark-color;
    }
    &:hover:enabled {
      color: $theme-dark-caption-color;
      border-color: $theme-dark-doclink-color;
      background-color: $theme-dark-bg-dark-color;
    }
  }
  :global(.theme-grey) .crm-toolbar-button {
    &:focus {
      border-color: $theme-grey-doclink-color;
      box-shadow: inset 0px 0px 2px 0px $theme-grey-doclink-color;
    }
    &.selected {
      background-color: $theme-grey-bg-dark-color;
    }
    &:hover:enabled {
      color: $theme-grey-caption-color;
      border-color: $theme-grey-doclink-color;
      background-color: $theme-grey-bg-dark-color;
    }
  }
  :global(.theme-light) .crm-toolbar-button {
    &:focus {
      border-color: $theme-light-doclink-color;
      box-shadow: inset 0px 0px 2px 0px $theme-light-doclink-color;
    }
    &.selected {
      background-color: $theme-light-bg-dark-color;
    }
    &:hover:enabled {
      color: $theme-light-caption-color;
      border-color: $theme-light-doclink-color;
      background-color: $theme-light-bg-dark-color;
    }
  }
</style>
