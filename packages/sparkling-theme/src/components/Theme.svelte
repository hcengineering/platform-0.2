<script lang="ts">
  import { setContext, onMount } from "svelte";
  import { writable } from "svelte/store";
  import { themes as _themes } from "../themes";
  import type { Theme } from "../themes";

  export let themes = [..._themes];
  const getTheme = (name: string): Theme =>
    themes.find((h) => h.name === name) as Theme;
  let current = getTheme("dark");
  const Theme = writable(current);

  setContext("theme", {
    theme: Theme,
    setTheme: (name: string) => {
      const theme = getTheme(name);
      setRootColors(theme);
      Theme.update(() => theme);
    },
  });

  const setRootColors = (theme: Theme) => {
    for (let [prop, color] of Object.entries(theme.colors)) {
      let varString = `--theme-${prop}`;
      document.documentElement.style.setProperty(varString, color);
    }
    document.documentElement.style.setProperty("--theme-name", theme.name);
  };

  onMount(() => {
    setRootColors(current);
  });
</script>

<style lang="scss" global>
  * {
    --white-color: #fff;
    --status-blue-color: #2D6AB9;
    --status-green-color: #4396A2;
    --status-grey-color: #78726D;
    --status-maroon-color: #B92D52;

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
    background-color: var(--theme-bg-color);
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
    font-family: "IBM Plex Sans";
    font-style: normal;
    font-weight: 400;
    src: local("IBM Plex Sans"), local("IBMPlexSans"),
      url("~@anticrm/sparkling-theme/fonts/complete/woff2/IBMPlexSans-Regular.woff2")
        format("woff2"),
      url("~@anticrm/sparkling-theme/fonts/complete/woff/IBMPlexSans-Regular.woff")
        format("woff");
  }

  @font-face {
    font-family: "IBM Plex Sans";
    font-style: normal;
    font-weight: 500;
    src: local("IBM Plex Sans Medium"), local("IBMPlexSans-Medium"),
      url("~@anticrm/sparkling-theme/fonts/complete/woff2/IBMPlexSans-Medium.woff2")
        format("woff2"),
      url("~@anticrm/sparkling-theme/fonts/complete/woff/IBMPlexSans-Medium.woff")
        format("woff");
  }

  @font-face {
    font-family: "IBM Plex Sans";
    font-style: normal;
    font-weight: 700;
    src: local("IBM Plex Sans Bold"), local("IBMPlexSans-Bold"),
      url("~@anticrm/sparkling-theme/fonts/complete/woff2/IBMPlexSans-Bold.woff2")
        format("woff2"),
      url("~@anticrm/sparkling-theme/fonts/complete/woff/IBMPlexSans-Bold.woff")
        format("woff");
  }

  @font-face {
    font-family: "Raleway";
    font-style: normal;
    font-weight: 400;
    src: local("Raleway"),
      url("~@anticrm/sparkling-theme/fonts/complete/otf/Raleway-Regular.otf");
  }

  @font-face {
    font-family: "Raleway";
    font-style: normal;
    font-weight: 700;
    src: local("Raleway Bold"),
      url("~@anticrm/sparkling-theme/fonts/complete/otf/Raleway-Bold.otf");
  }

  .editbox {
    border: 1px solid var(--theme-bg-dark-color);
    border-radius: 4px;
    padding: 0.75em 1em;
    background-color: var(--theme-bg-accent-color);
    box-sizing: border-box;
    color: var(--theme-content-color);
    //transition: all .2s ease-in-out;

    &:focus-within {
      outline: none;
      background-color: var(--theme-bg-accent-hover);
      border-color: var(--theme-bg-dark-hover);
      color: var(--theme-content-color);
    }
  }

  .button {
    display: inline-block;
    border: 1px solid var(--theme-bg-dark-color);
    border-radius: 4px;
    padding: 0.5em 1.33em 0.5em;
    box-sizing: border-box;
    cursor: pointer;
    user-select: none;
    text-align: center;

    font: inherit;
    font-weight: 500;

    color: var(--theme-content-color);
    background-color: var(--theme-bg-accent-color);
    transition: all .2s ease-in-out;

    &:focus {
      outline: none;
    }

    &.large {
      padding: 0.75em 1.5em 0.75em;
    }

    &.small {
      padding: 0 0.6em 0;
    }

    &:hover {
      border-color: var(--theme-bg-dark-hover);
      // color: $highlight-color;
      // background-color: $highlight-color;
      background-color: var(--theme-bg-accent-hover);
      color: var(--theme-content-dark-color);
    }

    &.primary {
      // border-color: $highlight-color;
      background-color: var(--theme-content-color);
      // color: $nav-bg-color;
      border-color: var(--theme-content-color);
      color: var(--theme-bg-color);
    }

    &:hover.primary {
      background-color: var(--theme-content-dark-color);
      border-color: var(--theme-content-dark-color);
      color: var(--theme-bg-color);
      // border-color: $highlight-color;
      // box-shadow:inset 0px 0px 3px 0px currentColor;
      // color: $highlight-color;
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

  .icon-brd {
    height: 24px;
    width: 24px;
    fill: currentColor;
    position: relative;
  }
  .icon-brd-max {
    height: 42px;
    width: 42px;
    fill: currentColor;
    position: relative;
  }
  .icon-left {
    width: 24px;
    height: 24px;
  }

  .icon-embed {
    height: 16px;
    width: 16px;
    fill: currentColor;
    //top: 0.15em;
    position: relative;
  }

  .icon-embed-15x {
    height: 1.5em;
    width: 1.5em;
    fill: currentColor;
    top: 0.25em;
    position: relative;
  }

  .icon-embed-2x {
    height: 2em;
    width: 2em;
    top: 0.3em;
    fill: currentColor;
    position: relative;
  }

  .icon-2x {
    height: 2em;
    width: 2em;
    fill: currentColor;
    position: relative;
  }

  .caption-1 {
    font-family: var(--theme-font-caption);
    color: var(--theme-caption-color);
    // font-family: "Montserrat";
    // font-family: "Open Sans";
    font-size: 18px;
    font-weight: 500;
  }

  .caption-2 {
    font-family: var(--theme-font-caption);
    color: var(--theme-caption-color);
    // font-family: "Montserrat";
    // font-family: "Open Sans";
    font-size: 24px;
    font-weight: 400;
  }

  .caption-3 {
    font-family: var(--theme-font-caption);
    color: var(--theme-caption-color);
    // font-family: "Montserrat";
    // font-family: "Open Sans";
    font-size: 1.25em;
    font-weight: 500;
    padding: 1em 0.5em;
  }

  .caption-4 {
    font-family: "IBM Plex Sans";
    color: var(--theme-caption-color);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .caption-5 {
    font-family: "IBM Plex Sans";
    color: var(--theme-caption-color);
    font-size: 10px;
    font-weight: 400;
    text-transform: uppercase;
  }

  .caption-6 {
    font-family: "IBM Plex Sans";
    color: var(--theme-caption-color);
    font-size: 9px;
    font-weight: 700;
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
    color: var(--theme-content-color);

    font-family: var(--theme-font-content);
    font-size: 14px;
    font-weight: 400;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
</style>

<slot>
  <!-- content will go here -->
</slot>
