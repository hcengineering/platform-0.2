<script lang="ts">
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import { Asset } from "@anticrm/platform-ui";

  export let icon: Asset | undefined
  export let style: string = ''
  export let label: string = ''
  export let right: boolean = false

</script>

{#if (label !== '')}
  <div class="container" {style}>
    {#if (right)}
      <div class="text">{label}</div>
      <div class="separator"></div>
    {/if}
    <div class="bIcon">
      <Icon icon={icon} clazz='icon-embed' />
    </div>
    {#if (!right)}
      <div class="separator"></div>
      <div class="text">{label}</div>
    {/if}
  </div>
{:else}
  <div class="bIcon" {style}>
    <Icon icon={icon} clazz='icon-embed' />
  </div>
{/if}

<style lang="scss">
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    color: var(--theme-caption-color);

    &:hover {
      color: var(--theme-highlight-color);
    }
    &:hover .bIcon {
      background-color: var(--theme-bg-dark-color);
      border: solid 1px var(--theme-bg-dark-color);
      color: var(--theme-bg-color);
    }
  }
  .separator {
    width: .5em;
  }
  .bIcon {
    background-color: var(--theme-bg-accent-color);
    border: solid 1px var(--theme-bg-dark-color);
    border-radius: 50%;
    color: var(--theme-caption-color);
    width: 16px;
    height: 16px;

    &:hover {
      background-color: var(--theme-bg-dark-color);
      border: solid 1px var(--theme-bg-dark-color);
      color: var(--theme-bg-color);
    }
  }
  .text {
    font-weight: 500;
  }
</style>