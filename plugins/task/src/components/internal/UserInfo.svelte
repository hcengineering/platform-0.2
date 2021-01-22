<script lang="ts">
  export const url: string = ''
  export const title: string = ''
  export const subtitle: string = ''
  export const color: string = ''
  export const style: string = ''
</script>

<div class="userInfo" style={style}>
  <img class="avatar" src="{url}" alt="">
  <div class="user">
    {title}
    {#if (subtitle !== '')}
      <span style="{(color !== '') ? 'color:' + color : ''}">{subtitle}</span>
    {/if}
  </div>
</div>

<style lang="scss">
  .userInfo {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .avatar {
    width: 32px;
    height: 32px;
    border: 1px solid var(--theme-content-trans-color);
    border-radius: 16px;
  }
  .user {
    padding-left: 1em;
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    color: var(--theme-accent-color);

    &>span {
      display: block;
      font-size: 11px;
      line-height: 14px;
      color: var(--status-grey-color);
    }
  }
</style>