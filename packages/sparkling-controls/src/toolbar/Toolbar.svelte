<script type="ts">
</script>

<div class="crm-toolbar-toolbar">
	<div class="left-panel">
		<slot />
	</div>
	<div class="right-panel">
		<slot name="right" />
	</div>
</div>

<style lang="scss">
	.crm-toolbar-toolbar {
		flex-direction: row;
		display: flex;
		min-height: 2em;
		padding: 2px;
		// background-color: #111111;

		.left-panel {
			display: flex;
			align-items: stretch;
		}
		.right-panel {
			flex-grow: 1;
			display: flex;
			align-items: stretch;
			flex-direction: row-reverse;
			:global {
				div {
					display: inherit;
				}
			}
		}
	}
</style>
