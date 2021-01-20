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
	import { Ref, Doc } from '@anticrm/core'
	import workbench, { Perspective } from '../..'
	import { find, getUIService } from '../../utils'
	import { getContext } from 'svelte'
	import chunter from '@anticrm/chunter'
	import task from '@anticrm/task'

	import Component from '@anticrm/platform-ui/src/components/Component.svelte'
	import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
	import LinkTo from '@anticrm/platform-ui/src/components/LinkTo.svelte'
	import Spotlight from './Spotlight.svelte'

	let perspectives: Perspective[] = []
	let current: Ref<Doc>

	const uiService = getUIService()
	const location = uiService.getLocation()
	location.subscribe((loc) => {
		current = loc.pathname.split('/')[2] as Ref<Doc>
	})

	find(workbench.class.Perspective, {}).then((p) => {
		perspectives = p
	})

	$: component = perspectives.find((h) => h._id === current)?.component

	function handleKeydown(ev: KeyboardEvent) {
    if (ev.code === 'KeyS' && ev.ctrlKey) {
			uiService.showModal(Spotlight, {})
    }
	}

	let selected: number = 0;
</script>

<div id="workbench">
	<nav>
		{#each perspectives as perspective (perspective._id)}
			<div class="app-icon" class:current-app="{perspective._id === current}">
				<LinkTo
					href="{'/' + workbench.component.Workbench + '/' + perspective._id}"
				>
					<div class="icon">
						<Icon icon="{perspective.icon}" clazz="icon-2x" />
					</div>
				</LinkTo>
			</div>
		{/each}
		<div class="app-icon">
			<div class={(selected === 0) ? 'selectedApp' : 'iconApp'} on:click={() => {selected = 0}}>
				<Icon icon="{chunter.icon.ActivityView}" clazz="icon-left" /></div>
			<div class={(selected === 1) ? 'selectedApp' : 'iconApp'} on:click={() => {selected = 1}}>
				<Icon icon="{chunter.icon.ChatView}" clazz="icon-left" /></div>
			<div class={(selected === 2) ? 'selectedApp' : 'iconApp'} on:click={() => {selected = 2}}>
				<Icon icon="{workbench.icon.Pages}" clazz="icon-left" /></div>
			<div class={(selected === 3) ? 'selectedApp' : 'iconApp'} on:click={() => {selected = 3}}>
				<Icon icon="{task.icon.Task}" clazz="icon-left" /></div>
		</div>
		<div class="remainder"></div>
	</nav>

	<main>
		{#if component}
			<Component is="{component}" />
		{/if}
	</main>

</div>

<svelte:window on:keydown={handleKeydown}/>

<style lang="scss">
	#workbench {
		display: flex;
		height: 100%;
	}

	nav {
		width: 60px;
		background-color: var(--theme-bg-color);

		display: flex;
		flex-direction: column;

		.app-icon {
			border-bottom: solid 1px var(--theme-bg-accent-color);
			border-right: solid 1px var(--theme-bg-accent-color);

			.icon {
				padding: 1em;
			}

			&.current-app {
				background-color: var(--theme-bg-color);
				border-right: solid 1px var(--theme-bg-color);
			}
		}

		.iconApp {
			padding: 1em;
			fill: var(--theme-content-dark-color);
			cursor: pointer;
		}
		.selectedApp {
			padding: 1em;
			fill: var(--theme-accent-color);
		}

		.remainder {
			flex-grow: 1;
			border-right: solid 1px var(--theme-bg-accent-color);
		}
	}

	main {
		background-color: var(--theme-bg-color);
		width: 100%;
	}
</style>
