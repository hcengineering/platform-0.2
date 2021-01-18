<script>
  import ui, { Asset } from "@anticrm/platform-ui"
  import Icon from "./Icon.svelte"

  export let placeholder = 'Поиск по ...'
  let value = '';
</script>

<div class="finder">
  <input class="input" type="text" {placeholder} {value} />
  <Icon icon={ui.icon.Finder} clazz="icon-embed" style="top: 0" />
</div>

<style lang="scss">
  .finder {
    box-sizing: border-box;
    height: 3em;
    padding: 0em 1em;
    border: 1px solid var(--theme-bg-dark-color);
    border-radius: 4px;
    background-color: var(--theme-bg-accent-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .input {
    color: var(--theme-content-color);
    background-color: var(--theme-bg-accent-color);
    border: none;
    width: calc(100% - 2em);
    margin-top: 1px;
    &:focus {
      outline: none;
    }
  }
</style>