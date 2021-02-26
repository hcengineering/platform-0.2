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
		box-sizing: border-box;
		flex-direction: row;
		display: flex;
		min-height: 24px;
		align-items: center;
		// background-color: #111111;

		.left-panel {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
		}
		.right-panel {
			flex-grow: 1;
			display: flex;
			align-items: center;
			flex-direction: row-reverse;
			:global {
				div {
					display: inherit;
				}
			}
		}
	}
</style>
