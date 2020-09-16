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
    border: 1px solid var(--theme-separator-color);
    border-radius: 0.5em;
    padding: 0.5em 0.75em;
    background-color: var(--theme-nav-color);
    box-sizing: border-box;
    color: inherit;
    font: inherit;

    &:focus {
      outline: none;
      border-color: var(--theme-highlight-color);
    }
  }

  .button {
    display: inline-block;
    border: 1px solid currentColor;
    border-radius: 2em;
    padding: 0.5em 1.33em 0.5em;
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
      box-shadow: inset 0px 0px 2px 0px var(--theme-highlight-color);
    }

    &.large {
      padding: 0.75em 1.5em 0.75em;
    }

    &.small {
      padding: 0 0.6em 0;
    }

    &:hover {
      border-color: var(--theme-highlight-color);
      // color: $highlight-color;
      // background-color: $highlight-color;
      background-color: var(--theme-highlight-color);
    }

    &.primary {
      // border-color: $highlight-color;
      background-color: var(--theme-highlight-color);
      // color: $nav-bg-color;
      font-weight: bold;
    }

    &:hover.primary {
      background-color: var(--theme-highlight-color);
      // border-color: $highlight-color;
      // box-shadow:inset 0px 0px 3px 0px currentColor;
      // color: $highlight-color;
    }
  }

  a {
    color: inherit;
    // text-decoration: none;
  }

  a:hover {
    color: var(--theme-highlight-color);
    text-decoration: underline;
  }

  .icon-embed {
    height: 1em;
    width: 1em;
    fill: currentColor;
    top: 0.15em;
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
    // font-family: "Montserrat";
    // font-family: "Open Sans";
    font-size: 36px;
    font-weight: 700;
  }

  .caption-2 {
    font-family: var(--theme-font-caption);
    // font-family: "Montserrat";
    // font-family: "Open Sans";
    font-size: 24px;
    font-weight: 400;
  }

  .caption-3 {
    font-family: var(--theme-font-caption);
    // font-family: "Montserrat";
    // font-family: "Open Sans";
    font-size: 14px;
    font-weight: 400;
    text-transform: uppercase;
  }

  .caption-4 {
    font-family: "IBM Plex Sans";
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .caption-5 {
    font-family: "IBM Plex Sans";
    font-size: 10px;
    font-weight: 400;
    text-transform: uppercase;
  }

  .caption-6 {
    font-family: "IBM Plex Sans";
    font-size: 9px;
    font-weight: 700;
  }

  .text-small-uppercase {
    font-size: 10px;
    text-transform: uppercase;
  }

  .content-dark {
    color: var(--theme-content-color-dark);
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
        border-bottom: 1px solid var(--theme-separator-color);
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

  body {
    color: var(--theme-content-color);

    font-family: var(--theme-font-content);
    font-size: 12px;
    font-weight: 400;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
</style>

<slot>
  <!-- content will go here -->
</slot>
