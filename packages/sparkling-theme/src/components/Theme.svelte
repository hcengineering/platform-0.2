<script lang="ts">
  import { setContext, onMount } from 'svelte'

  const current = 'theme-dark'

  setContext('theme', {
    setTheme: (name: string) => {
      setRootColors(name)
    }
  })

  const setRootColors = (theme: string) => {
    document.body.setAttribute('class', theme)
  }

  onMount(() => {
    setRootColors(current)
  })
</script>

<slot>
  <!-- content will go here -->
</slot>

<style lang="scss" global>
  @import "~@anticrm/sparkling-theme/styles/_global.scss";

  * {
    box-sizing: border-box;
  }
  :global(.theme-dark) * {
    scrollbar-color: $theme-dark-bg-dark-color $theme-dark-bg-accent-color;
    scrollbar-width: thin;
  }
  :global(.theme-grey) * {
    scrollbar-color: $theme-grey-bg-dark-color $theme-grey-bg-accent-color;
    scrollbar-width: thin;
  }
  :global(.theme-light) * {
    scrollbar-color: $theme-light-bg-dark-color $theme-light-bg-accent-color;
    scrollbar-width: thin;
  }

  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar:horizontal { height: 8px; }

  :global(.theme-dark) ::-webkit-scrollbar-track {
    background-color: $theme-dark-bg-color;
  }
  :global(.theme-grey) ::-webkit-scrollbar-track {
    background-color: $theme-grey-bg-color;
  }
  :global(.theme-light) ::-webkit-scrollbar-track {
    background-color: $theme-light-bg-color;
  }
  :global(.theme-dark) ::-webkit-scrollbar-thumb {
    background: $theme-dark-bg-accent-color;
    border: 1px solid $theme-dark-bg-dark-color;
    border-radius: 2px;
  }
  :global(.theme-grey) ::-webkit-scrollbar-thumb {
    background: $theme-grey-bg-accent-color;
    border: 1px solid $theme-grey-bg-dark-color;
    border-radius: 2px;
  }
  :global(.theme-light) ::-webkit-scrollbar-thumb {
    background: $theme-light-bg-accent-color;
    border: 1px solid $theme-light-bg-dark-color;
    border-radius: 2px;
  }
  :global(.theme-dark) ::-webkit-scrollbar-thumb:hover {
    background: $theme-dark-bg-dark-color;
    border: 1px solid $theme-dark-bg-dark-color;
    border-radius: 2px;
  }
  :global(.theme-grey) ::-webkit-scrollbar-thumb:hover {
    background: $theme-grey-bg-dark-color;
    border: 1px solid $theme-grey-bg-dark-color;
    border-radius: 2px;
  }
  :global(.theme-light) ::-webkit-scrollbar-thumb:hover {
    background: $theme-light-bg-dark-color;
    border: 1px solid $theme-light-bg-dark-color;
    border-radius: 2px;
  }
  :global(.theme-dark) ::-webkit-scrollbar-corner {
    background: $theme-dark-bg-accent-color;
    border: 1px solid $theme-dark-bg-dark-color;
    border-radius: 2px;
  }
  :global(.theme-grey) ::-webkit-scrollbar-corner {
    background: $theme-grey-bg-accent-color;
    border: 1px solid $theme-grey-bg-dark-color;
    border-radius: 2px;
  }
  :global(.theme-light) ::-webkit-scrollbar-corner {
    background: $theme-light-bg-accent-color;
    border: 1px solid $theme-light-bg-dark-color;
    border-radius: 2px;
  }

  @font-face {
    font-family: 'IBM Plex Sans';
    font-style: normal;
    font-weight: 400;
    src: local('IBM Plex Sans'), local('IBMPlexSans'),
      url('~@anticrm/sparkling-theme/fonts/complete/woff2/IBMPlexSans-Regular.woff2') format('woff2'),
      url('~@anticrm/sparkling-theme/fonts/complete/woff/IBMPlexSans-Regular.woff') format('woff');
  }

  @font-face {
    font-family: 'IBM Plex Sans';
    font-style: normal;
    font-weight: 500;
    src: local('IBM Plex Sans Medium'), local('IBMPlexSans-Medium'),
      url('~@anticrm/sparkling-theme/fonts/complete/woff2/IBMPlexSans-Medium.woff2') format('woff2'),
      url('~@anticrm/sparkling-theme/fonts/complete/woff/IBMPlexSans-Medium.woff') format('woff');
  }

  @font-face {
    font-family: 'IBM Plex Sans';
    font-style: normal;
    font-weight: 700;
    src: local('IBM Plex Sans Bold'), local('IBMPlexSans-Bold'),
      url('~@anticrm/sparkling-theme/fonts/complete/woff2/IBMPlexSans-Bold.woff2') format('woff2'),
      url('~@anticrm/sparkling-theme/fonts/complete/woff/IBMPlexSans-Bold.woff') format('woff');
  }

  @font-face {
    font-family: 'Raleway';
    font-style: normal;
    font-weight: 400;
    src: local('Raleway'), url('~@anticrm/sparkling-theme/fonts/complete/otf/Raleway-Regular.otf');
  }

  @font-face {
    font-family: 'Raleway';
    font-style: normal;
    font-weight: 700;
    src: local('Raleway Bold'), url('~@anticrm/sparkling-theme/fonts/complete/otf/Raleway-Bold.otf');
  }

  .editbox {
    border-radius: 4px;
    padding: 8px 16px;
    box-sizing: border-box;
    transition: border-color 0.2s, color 0.2s, background-color 0.2s;
    &:focus-within {
      outline: none;
    }
    &-label {
      height: 54px;
      padding: 6px 16px 4px;
    }
  }
  :global(.theme-dark) .editbox {
    border: 1px solid $theme-dark-bg-dark-color;
    background-color: $theme-dark-bg-accent-color;
    color: $theme-dark-content-color;
    &:focus-within {
      background-color: $theme-dark-bg-accent-hover;
      border-color: $theme-dark-bg-dark-hover;
      color: $theme-dark-content-color;
    }
    &-hoverState {
      background-color: $theme-dark-bg-accent-hover;
      border-color: $theme-dark-bg-dark-hover;
      color: $theme-dark-content-color;
    }
  }
  :global(.theme-grey) .editbox {
    border: 1px solid $theme-grey-bg-dark-color;
    background-color: $theme-grey-bg-accent-color;
    color: $theme-grey-content-color;
    &:focus-within {
      background-color: $theme-grey-bg-accent-hover;
      border-color: $theme-grey-bg-dark-hover;
      color: $theme-grey-content-color;
    }
    &-hoverState {
      background-color: $theme-grey-bg-accent-hover;
      border-color: $theme-grey-bg-dark-hover;
      color: $theme-grey-content-color;
    }
  }
  :global(.theme-light) .editbox {
    border: 1px solid $theme-light-bg-dark-color;
    background-color: $theme-light-bg-accent-color;
    color: $theme-light-content-color;
    &:focus-within {
      background-color: $theme-light-bg-accent-hover;
      border-color: $theme-light-bg-dark-hover;
      color: $theme-light-content-color;
    }
    &-hoverState {
      background-color: $theme-light-bg-accent-hover;
      border-color: $theme-light-bg-dark-hover;
      color: $theme-light-content-color;
    }
  }

  .button {
    display: inline-block;
    height: 32px;
    border-radius: 4px;
    padding: 0.5em 1.33em 0.5em;
    box-sizing: border-box;
    cursor: pointer;
    user-select: none;
    text-align: center;
    font: inherit;
    font-weight: 500;
    transition: border-color 0.2s, color 0.2s, background-color 0.2s;

    &:focus {
      outline: none;
    }

    &.large {
      height: 42px;
      padding: 0.75em 1.5em 0.75em;
    }

    &.small {
      height: 24px;
      padding: 0 0.6em 0;
    }

    &.transparent {
      display: flex;
      border: none;
      cursor: pointer;
      user-select: none;
      font-weight: 500;
      background-color: transparent;
      align-items: center;
      justify-content: center;
      flex-wrap: nowrap;
      padding: 0;
      margin: 0;
      &:focus {
        outline: none;
      }
    }
  }
  :global(.theme-dark) .button {
    border: 1px solid $theme-dark-bg-dark-color;
    color: $theme-dark-content-color;
    background-color: $theme-dark-bg-accent-color;
    &:hover {
      border-color: $theme-dark-bg-dark-hover;
      background-color: $theme-dark-bg-accent-hover;
      color: $theme-dark-content-dark-color;
    }
    &.primary {
      background-color: $theme-dark-content-color;
      border-color: $theme-dark-content-color;
      color: $theme-dark-bg-color;
    }
    &:hover.primary {
      background-color: $theme-dark-content-dark-color;
      border-color: $theme-dark-content-dark-color;
      color: $theme-dark-bg-color;
    }
    &.transparent {
      color: $theme-dark-content-color;
      &:hover {
        color: $theme-dark-caption-color;
      }
    }
  }
  :global(.theme-grey) .button {
    border: 1px solid $theme-grey-bg-dark-color;
    color: $theme-grey-content-color;
    background-color: $theme-grey-bg-accent-color;
    &:hover {
      border-color: $theme-grey-bg-dark-hover;
      background-color: $theme-grey-bg-accent-hover;
      color: $theme-grey-content-dark-color;
    }
    &.primary {
      background-color: $theme-grey-content-color;
      border-color: $theme-grey-content-color;
      color: $theme-grey-bg-color;
    }
    &:hover.primary {
      background-color: $theme-grey-content-dark-color;
      border-color: $theme-grey-content-dark-color;
      color: $theme-grey-bg-color;
    }
    &.transparent {
      color: $theme-grey-content-color;
      &:hover {
        color: $theme-grey-caption-color;
      }
    }
  }
  :global(.theme-light) .button {
    border: 1px solid $theme-light-bg-dark-color;
    color: $theme-light-content-color;
    background-color: $theme-light-bg-accent-color;
    &:hover {
      border-color: $theme-light-bg-dark-hover;
      background-color: $theme-light-bg-accent-hover;
      color: $theme-light-content-dark-color;
    }
    &.primary {
      background-color: $theme-light-content-color;
      border-color: $theme-light-content-color;
      color: $theme-light-bg-color;
    }
    &:hover.primary {
      background-color: $theme-light-content-dark-color;
      border-color: $theme-light-content-dark-color;
      color: $theme-light-bg-color;
    }
    &.transparent {
      color: $theme-light-content-color;
      &:hover {
        color: $theme-light-caption-color;
      }
    }
  }

  a {
    color: inherit;
    text-decoration: none;
  }
  a:hover {
    text-decoration: none;
  }
  :global(.theme-dark) a:hover {
    color: $theme-dark-doclink-color;
  }
  :global(.theme-grey) a:hover {
    color: $theme-grey-doclink-color;
  }
  :global(.theme-light) a:hover {
    color: $theme-light-doclink-color;
  }

  .icon {
    fill: currentColor;
    position: relative;
  }
  .icon-12 {
    height: 12px;
    width: 12px;
  }
  .icon-16 {
    height: 16px;
    width: 16px;
  }
  .icon-24 {
    height: 24px;
    width: 24px;
  }
  .icon-32 {
    width: 32px;
    height: 32px;
  }
  .icon-42 {
    width: 42px;
    height: 42px;
  }

  :global(.theme-dark) .icon-button {
    background-color: $theme-dark-bg-accent-color;
    border: solid 1px $theme-dark-bg-dark-color;
    border-radius: 50%;
    fill: $theme-dark-content-color;
    &:hover {
      background-color: $theme-dark-bg-accent-hover;
      border-color: $theme-dark-bg-dark-hover;
      fill: $theme-dark-content-color;
    }
  }
  :global(.theme-grey) .icon-button {
    background-color: $theme-grey-bg-accent-color;
    border: solid 1px $theme-grey-bg-dark-color;
    border-radius: 50%;
    fill: $theme-grey-content-color;
    &:hover {
      background-color: $theme-grey-bg-accent-hover;
      border-color: $theme-grey-bg-dark-hover;
      fill: $theme-grey-content-color;
    }
  }
  :global(.theme-light) .icon-button {
    background-color: $theme-light-bg-accent-color;
    border: solid 1px $theme-light-bg-dark-color;
    border-radius: 50%;
    fill: $theme-light-content-color;
    &:hover {
      background-color: $theme-light-bg-accent-hover;
      border-color: $theme-light-bg-dark-hover;
      fill: $theme-light-content-color;
    }
  }

  .popup {
    //height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .caption-1 {
    font-family: $font-caption;
    font-size: 18px;
    font-weight: 500;
  }
  :global(.theme-dark) .caption-1 {
    color: $theme-dark-caption-color;
  }
  :global(.theme-grey) .caption-1 {
    color: $theme-grey-caption-color;
  }
  :global(.theme-light) .caption-1 {
    color: $theme-light-caption-color;
  }

  .caption-2 {
    font-family: $font-caption;
    font-size: 24px;
    font-weight: 400;
  }
  :global(.theme-dark) .caption-2 {
    color: $theme-dark-caption-color;
  }
  :global(.theme-grey) .caption-2 {
    color: $theme-grey-caption-color;
  }
  :global(.theme-light) .caption-2 {
    color: $theme-light-caption-color;
  }

  .caption-3 {
    font-family: $font-caption;
    font-size: 1.25em;
    font-weight: 500;
    padding: 1em 0.5em;
  }
  :global(.theme-dark) .caption-3 {
    color: $theme-dark-caption-color;
  }
  :global(.theme-grey) .caption-3 {
    color: $theme-grey-caption-color;
  }
  :global(.theme-light) .caption-3 {
    color: $theme-light-caption-color;
  }

  .caption-4 {
    font-family: $font-caption;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
  }
  :global(.theme-dark) .caption-4 {
    color: $theme-dark-caption-color;
  }
  :global(.theme-grey) .caption-4 {
    color: $theme-grey-caption-color;
  }
  :global(.theme-light) .caption-4 {
    color: $theme-light-caption-color;
  }

  .caption-5 {
    font-family: $font-caption;
    font-size: 10px;
    font-weight: 400;
    text-transform: uppercase;
  }
  :global(.theme-dark) .caption-5 {
    color: $theme-dark-caption-color;
  }
  :global(.theme-grey) .caption-5 {
    color: $theme-grey-caption-color;
  }
  :global(.theme-light) .caption-5 {
    color: $theme-light-caption-color;
  }

  .caption-6 {
    font-family: $font-caption;
    font-size: 9px;
    font-weight: 700;
  }
  :global(.theme-dark) .caption-6 {
    color: $theme-dark-caption-color;
  }
  :global(.theme-grey) .caption-6 {
    color: $theme-grey-caption-color;
  }
  :global(.theme-light) .caption-6 {
    color: $theme-light-caption-color;
  }

  .text-small-uppercase {
    font-size: 10px;
    text-transform: uppercase;
  }

  :global(.theme-dark) .content-dark {
    color: $theme-dark-content-dark-color;
  }
  :global(.theme-grey) .content-dark {
    color: $theme-grey-content-dark-color;
  }
  :global(.theme-light) .content-dark {
    color: $theme-light-content-dark-color;
  }

  .crm-table {
    display: table;
    border-collapse: collapse;

    .tr {
      display: table-row;
    }

    .thead {
      display: table-header-group;
    }

    .th {
      display: table-cell;
      padding: 0.5em;
    }

    .tbody {
      display: table-row-group;

      :global(.theme-dark) .tr {
        border-bottom: 1px solid $theme-dark-bg-accent-color;
      }
      :global(.theme-grey) .tr {
        border-bottom: 1px solid $theme-grey-bg-accent-color;
      }
      :global(.theme-light) .tr {
        border-bottom: 1px solid $theme-light-bg-accent-color;
      }
    }

    .td {
      display: table-cell;
    }

    .tfoot {
      display: table-footer-group;
    }

    .col {
      display: table-column;
    }

    .colgroup {
      display: table-column-group;
    }

    .caption {
      display: table-caption;
    }
  }

  .noselect {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  body {
    font-family: $font-content;
    font-size: 15px;
    font-weight: 400;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  body.theme-dark {
    color: $theme-dark-content-color;
    background-color: $theme-dark-bg-dark-color;
  }
  body.theme-grey {
    color: $theme-grey-content-color;
    background-color: $theme-grey-bg-dark-color;
  }
  body.theme-light {
    color: $theme-light-content-color;
    background-color: $theme-light-bg-dark-color;
  }
</style>
