<script lang="ts">
	export let disabled: boolean = false
	export let selected: boolean = false
	export let style: string = ''
</script>

<button
	type="button"
	class="crm-toolbar-button small"
	style="{style}"
	class:selected
	disabled="{disabled}"
	on:click
>
	<slot />
</button>

<style lang="scss">
	.crm-toolbar-button {
		display: inline-block;
		border: 0px solid currentColor;
		border-radius: 2px;
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
			border-color: var(--theme-highlight-color);
			box-shadow: inset 0px 0px 2px 0px var(--theme--highlight-color);
		}
		&.selected {
			background-color: var(--theme-highlight-color);
			font-weight: bold;
			// background-color: darken(--theme-highlight-color, 10%);
		}

		&:hover:enabled {
			border-color: var(--theme-highlight-color);
			// color: $highlight-color;
			background-color: var(--theme-highlight-color);
			// background-color: darken($highlight-color, 30%);
		}
	}
</style>
