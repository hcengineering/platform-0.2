<script lang="ts">
  // Copyright © 2020 Anticrm Platform Contributors.
  //
  // Licensed under the Eclipse Public License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License. You may
  // obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  //
  // See the License for the specific language governing permissions and
  // limitations under the License.

  import { afterUpdate } from 'svelte'

  export let scrollPosition = 0
  export let autoscroll = false
  export let accentColor = false
  export let width = ''
  export let height = ''
  export let margin = ''
  export let content = ''

  let container: HTMLElement
  let style = ''

  if (width !== '') style += 'width: ' + width + ';'
  if (height !== '') style += 'height: ' + height + ';'
  if (margin !== '') style += 'margin: ' + margin + ';'

  $: {
    if (container && !autoscroll && (scrollPosition > container.clientHeight || scrollPosition < container.scrollTop)) {
      container.scrollTo(0, scrollPosition)
    }
  }

  afterUpdate(() => {
    if (autoscroll) {
      container.scrollTo(0, container.scrollHeight)
    }
  })
</script>

<div class="scroll-view" {style}>
  <div class="container" class:accent-color={accentColor} bind:this={container}>
    <slot />{content}
  </div>
</div>

<style lang="scss">
  .scroll-view {
    position: relative;

    .container {
      overflow: auto;
      position: absolute;
      height: 100%;
      width: 100%;
    }
  }
  .accent-color::-webkit-scrollbar-track {
    background-color: var(--theme-bg-accent-color);
  }
</style>
