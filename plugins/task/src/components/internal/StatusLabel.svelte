<script lang="ts">
  export const text = ''
  export const color = ''
</script>

<div class="status" style="background-color: {color};">{text}</div>

<style lang="scss">
  @import '~@anticrm/sparkling-theme/styles/_global.scss';

  .status {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    line-height: 11px;
    font-weight: 500;
    padding: 0px 4px;
    background-color: $theme-status-green-color;
    border-radius: 2px;
    color: $theme-white-color;
  }
</style>
