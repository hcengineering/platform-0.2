<script lang="ts">
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import task from '@anticrm/task'

  export const style: string = ''
  export const width: string = ''
  export let combo: boolean = false
</script>

<div class="button {style}"
  style="{(width !== '') ? 'flex-basis:' + width + ';' : ''}
         {combo ? 'padding-right:1em;': ''}">

  <slot/>
  {#if (combo)}
    <div class="icon">
      <Icon icon={task.icon.ArrowDown} clazz="icon-embed" />
    </div>
  {/if}
</div>

<style lang="scss">
  .button {
    padding: 0.25em;
    font-weight: 500;
    text-align: center;
    background-color: var(--theme-bg-accent-color);
    border: 1px solid var(--theme-bg-dark-color);
    border-radius: 4px;
    color: var(--theme-content-dark-color);
    cursor: pointer;
    position: relative;
    &:hover {
      background-color: var(--theme-bg-dark-color);
      color: var(--theme-caption-color);
    }
    .icon {
      position: absolute;
      top: 0.25em;
      right: 0.5em;
    }
  }
  .leftButton {
    border-radius: 4px 0 0 4px;
  }
  .centerButton {
    border-radius: 0px;
    border-left: none;
    border-right: none;
  }
  .rightButton {
    border-radius: 0 4px 4px 0;
  }
</style>