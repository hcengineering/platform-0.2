<script lang="ts">
  export let url = ''
  export let title = ''
  export let subtitle = ''
  export let color = ''
  export let userColor = ''
  export let subtitleOnTop = false
</script>

<div class="userInfo">
  <img class="avatar" src={url} alt="" />
  <div class="user" style={userColor !== '' ? 'color:' + userColor : ''}>
    {#if !subtitleOnTop}
      {title}
    {/if}
    {#if subtitle !== ''}
      <span style={color !== '' ? 'color:' + color : ''}>{subtitle}</span>
    {/if}
    {#if subtitleOnTop}
      {title}
    {/if}
  </div>
</div>

<style lang="scss">
  @import "~@anticrm/sparkling-theme/styles/_global.scss";

  .userInfo {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .avatar {
    width: 32px;
    height: 32px;
    border: 1px solid transparent;
    border-radius: 16px;
  }
  :global(.theme-dark) .avatar {
    border-color: $theme-dark-content-trans-color;
  }
  :global(.theme-grey) .avatar {
    border-color: $theme-grey-content-trans-color;
  }
  :global(.theme-light) .avatar {
    border-color: $theme-light-content-trans-color;
  }

  .user {
    padding-left: 1em;
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    & > span {
      display: block;
      font-size: 11px;
      line-height: 14px;
      color: $theme-status-grey-color;
    }
  }
  :global(.theme-dark) .user {
    color: $theme-dark-userlink-color;
  }
  :global(.theme-grey) .user {
    color: $theme-grey-userlink-color;
  }
  :global(.theme-light) .user {
    color: $theme-light-userlink-color;
  }
</style>
