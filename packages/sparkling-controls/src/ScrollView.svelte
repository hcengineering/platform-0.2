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

	export let scrollPosition: number = 0
	export let autoscroll: boolean = false
	export let accentColor: boolean = false
	export let width: string = ''
	export let height: string = ''
	export let margin: string = ''

	let container: HTMLElement
	let style: string = ''

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
		<slot />
	</div>
</div>

<style lang="scss">
  .scroll-view {
    position: relative;

    // FireFox
    scrollbar-color: var(--theme-bg-dark-color) var(--theme-bg-accent-color);
    scrollbar-width: thin;

    // Other
    &::-webkit-scrollbar {
      width: 8px;
    }
    &::-webkit-scrollbar:horizontal {
      height: 8px;
    }
    &::-webkit-scrollbar-track {
      background-color: var(--theme-bg-color);
    }
    &::-webkit-scrollbar-thumb {
      background: var(--theme-bg-accent-color);
      border: 1px solid var(--theme-bg-dark-color);
      border-radius: 2px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: var(--theme-bg-dark-color);
      border: 1px solid var(--theme-bg-dark-color);
      border-radius: 2px;
    }
    &::-webkit-scrollbar-corner {
      background: var(--theme-bg-accent-color);
      border: 1px solid var(--theme-bg-dark-color);
      border-radius: 2px;
    }

    .container {
      overflow: auto;
      position: absolute;
      // border-bottom: 1px solid var(--theme-content-color-dark);
      // border-radius: 4px;
      height: 100%;
      width: 100%;
    }
    .accent-color::-webkit-scrollbar-track {
      background-color: var(--theme-bg-accent-color);
    }
  }
</style>
