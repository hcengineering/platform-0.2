<!--
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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
-->

<script lang="ts">
  import { setContext, onMount } from 'svelte'

  const current = 'theme-dark'

  const setRootColors = (theme: string) => {
    document.body.setAttribute('class', theme)
  }

  // setContext('theme', {
  //   setTheme: (name: string) => {
  //     setRootColors(name)
  //   }
  // })

  onMount(() => {
    // setRootColors(current)
  })
</script>

<slot>
  <!-- content will go here -->
</slot>

<style lang="scss" global>
  @import '../styles/colors.scss';

  * {
    box-sizing: border-box;
    --theme-white-color: #fff;
    --theme-status-blue-color: #2d6ab9;
    --theme-status-green-color: #4396a2;
    --theme-status-grey-color: #78726d;
    --theme-status-maroon-color: #b92d52;

    --theme-font-content: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
    --theme-font-caption: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;

    scrollbar-color: var(--theme-bg-dark-color) var(--theme-bg-accent-color);
    scrollbar-width: thin;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar:horizontal {
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background-color: va(--theme-bg-color);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--theme-bg-accent-color);
    border: 1px solid var(--theme-bg-dark-color);
    border-radius: 2px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--theme-bg-dark-color);
    border: 1px solid var(--theme-bg-dark-color);
    border-radius: 2px;
  }
  ::-webkit-scrollbar-corner {
    background: var(--theme-bg-accent-color);
    border: 1px solid var(--theme-bg-dark-color);
    border-radius: 2px;
  }

  @font-face {
    font-family: 'IBM Plex Sans';
    font-style: normal;
    font-weight: 400;
    src: local('IBM Plex Sans'), local('IBMPlexSans'),
      url('../fonts/complete/woff2/IBMPlexSans-Regular.woff2') format('woff2'),
      url('../fonts/complete/woff/IBMPlexSans-Regular.woff') format('woff');
  }

  @font-face {
    font-family: 'IBM Plex Sans';
    font-style: normal;
    font-weight: 500;
    src: local('IBM Plex Sans Medium'), local('IBMPlexSans-Medium'),
      url('../fonts/complete/woff2/IBMPlexSans-Medium.woff2') format('woff2'),
      url('../fonts/complete/woff/IBMPlexSans-Medium.woff') format('woff');
  }

  @font-face {
    font-family: 'IBM Plex Sans';
    font-style: normal;
    font-weight: 700;
    src: local('IBM Plex Sans Bold'), local('IBMPlexSans-Bold'),
      url('../fonts/complete/woff2/IBMPlexSans-Bold.woff2') format('woff2'),
      url('../fonts/complete/woff/IBMPlexSans-Bold.woff') format('woff');
  }

  @font-face {
    font-family: 'Raleway';
    font-style: normal;
    font-weight: 400;
    src: local('Raleway'), url('../fonts/complete/otf/Raleway-Regular.otf');
  }

  @font-face {
    font-family: 'Raleway';
    font-style: normal;
    font-weight: 700;
    src: local('Raleway Bold'), url('../fonts/complete/otf/Raleway-Bold.otf');
  }

  .editbox {
    border-radius: 4px;
    padding: 8px 16px;
    border: 1px solid var(--theme-bg-dark-color);
    background-color: var(--theme-bg-accent-color);
    color: var(--theme-content-color);
    transition: border-color 0.2s, color 0.2s, background-color 0.2s;
    &:focus-within {
      outline: none;
      background-color: var(--theme-bg-accent-hover);
      border-color: var(--theme-bg-dark-hover);
      color: var(--theme-content-color);
    }
    &-label {
      height: 54px;
      padding: 6px 16px 4px;
    }
    &-hoverState {
      background-color: var(--theme-bg-accent-hover);
      border-color: var(--theme-bg-dark-hover);
      color: var(--theme-content-color);
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
    border: 1px solid var(--theme-bg-dark-color);
    color: var(--theme-content-color);
    background-color: var(--theme-bg-accent-color);
    transition: border-color 0.2s, color 0.2s, background-color 0.2s;

    &:focus {
      outline: none;
    }
    &:hover {
      border-color: var(--theme-bg-dark-hover);
      background-color: var(--theme-bg-accent-hover);
      color: var(--theme-content-dark-color);
    }

    &.primary {
      background-color: var(--theme-content-color);
      border-color: var(--theme-content-color);
      color: var(--theme-bg-color);
      &:hover {
        background-color: var(--theme-content-dark-color);
        border-color: var(--theme-content-dark-color);
        color: var(--theme-bg-color);
      }
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
      color: var(--theme-content-color);
      &:focus {
        outline: none;
      }
      &:hover {
        color: var(--theme-caption-color);
      }
    }
  }

  a {
    color: inherit;
    text-decoration: none;
  }
  a:hover {
    color: var(--theme-doclink-color);
    text-decoration: none;
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

  .icon-button {
    background-color: var(--theme-bg-accent-color);
    border: solid 1px var(--theme-bg-dark-color);
    border-radius: 50%;
    fill: var(--theme-content-color);
    &:hover {
      background-color: var(--theme-bg-accent-hover);
      border-color: var(--theme-bg-dark-hover);
      fill: var(--theme-content-color);
    }
  }

  .popup {
    //height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .caption-1 {
    font-family: var(--theme-font-caption);
    font-size: 18px;
    font-weight: 500;
    color: var(--theme-caption-color);
  }

  .caption-2 {
    font-family: var(--theme-font-caption);
    font-size: 24px;
    font-weight: 400;
    color: var(--theme-caption-color);
  }

  .caption-3 {
    font-family: var(--theme-font-caption);
    font-size: 1.25em;
    font-weight: 500;
    padding: 1em 0.5em;
    color: var(--theme-caption-color);
  }

  .caption-4 {
    font-family: var(--theme-font-caption);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--theme-caption-color);
  }

  .caption-5 {
    font-family: var(--theme-font-caption);
    font-size: 10px;
    font-weight: 400;
    text-transform: uppercase;
    color: var(--theme-caption-color);
  }

  .caption-6 {
    font-family: var(--theme-font-caption);
    font-size: 9px;
    font-weight: 700;
    color: var(--theme-caption-color);
  }

  .text-small-uppercase {
    font-size: 10px;
    text-transform: uppercase;
  }

  .content-dark {
    color: var(--theme-content-dark-color);
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

      .tr {
        border-bottom: 1px solid var(--theme-bg-accent-color);
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
    font-family: var(--theme-font-content);
    font-size: 15px;
    font-weight: 400;

    color: var(--theme-content-color);
    background-color: var(--theme-bg-dark-color);

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
</style>
