<script lang="ts">
  export let text = ''
  export let color = ''
</script>

<div class="status" style="background-color: {color};">{text}</div>

<style lang="scss">
  .status {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    line-height: 11px;
    font-weight: 500;
    padding: 0px 4px;
    background-color: var(--theme-status-green-color);
    border-radius: 2px;
    color: var(--theme-white-color);
  }
</style>
