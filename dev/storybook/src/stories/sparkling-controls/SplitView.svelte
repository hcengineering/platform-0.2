<script lang='ts'>
  import Splitter from './Splitter.svelte'

  export let prevContent: any
  export let nextContent: any
  export let width: string = '100%'
  export let height: string = '100%'
  export let devMode: boolean = false
  export let minWidth: Number = 150
  export let spacing: Number = 0
  export let horizontal: boolean = false

  let prevDiv: HTMLElement
  let nextDiv: HTMLElement

  let orientedProp: string = horizontal ? 'height' : 'width'
</script>

<div class="container" style="width: {width}; height: {height}; flex-direction: {horizontal ? 'column' : 'row'}">
  <div class="wrap" bind:this={prevDiv}>
    {#if typeof(prevContent) === 'undefined'}
      <slot name="prevContent" />
    {:else}
      {prevContent}
    {/if}
  </div>
  <div class="spacing" style="{orientedProp}: {spacing}px; min-{orientedProp}: {spacing}px"></div>
  <Splitter {prevDiv} {nextDiv} {minWidth} {devMode} {horizontal} />
  <div class="spacing" style="{orientedProp}: {spacing}px; min-{orientedProp}: {spacing}px"></div>
  <div class="wrap" bind:this={nextDiv}>
    {#if typeof(nextContent) === 'undefined'}
      <slot name="nextContent" />
    {:else}
      {nextContent}
    {/if}
  </div>
</div>

<style lang="scss">
  .container {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100vh;
  }
  .wrap {
    overflow: auto;
    width: 100%;
    height: 100%;
  }
  .spacing {
    width: 0;
    height: 0;
    user-select: none;
  }
</style>