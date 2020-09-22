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

	export let stylez: string = ''
	export let scrollPosition: number = 0
	export let autoscroll: boolean = false

	let container: HTMLElement

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

<div class="scroll-view" style={stylez}>
	<div class="container" bind:this={container}>
		<slot />
	</div>
</div>

<style lang="scss">
	.scroll-view {
		position: relative;

		.container {
			overflow: auto;
			position: absolute;
			// border-bottom: 1px solid var(--theme-content-color-dark);
			// border-radius: 4px;
			height: 100%;
			width: 100%;
		}
	}
</style>
