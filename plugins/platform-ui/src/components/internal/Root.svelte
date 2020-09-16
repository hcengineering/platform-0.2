<script lang="ts">
  import type { Platform, Status } from "@anticrm/platform";
  import { PlatformStatus, Severity } from "@anticrm/platform";
  import type { UIService, AnyComponent } from "../..";
  import { setContext } from "svelte";

  import Theme from "@anticrm/sparkling-theme/src/components/Theme.svelte";
  import StatusComponent from "./Status.svelte";
  import Clock from "./Clock.svelte";
  import Component from "../Component.svelte";

  import { 
    CONTEXT_PLATFORM,
    CONTEXT_PLATFORM_UI,
  } from '../..'

  export let platform: Platform;
  export let ui: UIService;

  setContext(CONTEXT_PLATFORM, platform)
  setContext(CONTEXT_PLATFORM_UI, ui)

  let currentApp: AnyComponent;
  const location = ui.getLocation()
  location.subscribe((loc) => {
    currentApp = loc.pathname.split("/")[1] as AnyComponent;
  });

  let status: Status = { severity: Severity.OK, code: 0, message: "" };

  platform.addEventListener(
    PlatformStatus,
    async (event: string, platformStatus: Status) => {
      status = platformStatus;
    }
  )
</script>

<style lang="scss">
  $status-bar-height: 20px;
  $pictogram-size: 48px;

  #ui-root {
    display: flex;
    flex-direction: column;

    height: 100vh;

    .status-bar {
      background-color: var(--theme-bg-color);
      color: var(--theme-content-color);
      height: $status-bar-height;
      line-height: $status-bar-height;
      border-bottom: 1px solid var(--theme-nav-color);

      .container {
        display: flex;

        .logo {
          width: $pictogram-size;
          text-align: center;
          /*padding-left: 1em;*/
          /*padding-right: 1em;*/

          font-size: 1.25em;
          font-weight: 700;

          border-right: 1px solid var(--theme-nav-color);
        }

        .status-messages {
          flex-grow: 1;
          text-align: center;
        }

        .widgets {
          display: flex;
          flex-direction: row-reverse;

          // .widget {
          //   border-left: 1px solid var(--theme-nav-color);
          //   padding-right: 1em;
          //   padding-left: 1em;
          //   font-weight: 700;
          // }

          .clock {
            border-left: 1px solid var(--theme-nav-color);
            padding-right: 1em;
            padding-left: 1em;
            font-weight: 700;
          }
        }
      }
    }

    .error {
      margin-top: 45vh;
      text-align: center;
    }

    .app {
      height: calc(100vh - #{$status-bar-height});
      background-color: var(--theme-bg-color);
    }
  }
</style>

<Theme>
  <div id="ui-root">
    <div class="status-bar">
      <div class="container">
        <div class="logo">&#x24C5;</div>
        <div class="status-messages">
          <StatusComponent {status} />
        </div>
        <div class="widgets">
          <div class="clock">
            <Clock />
          </div>
          <!-- <div v-for="widget in widgets" :key="widget" class="widget">
            <widget :component="widget" />
          </div> -->
        </div>
      </div>
    </div>
    <div class="app">
      {#if currentApp}
        <Component is={currentApp} />
      {:else}
        <div class="caption-1 error">No application provided. {currentApp}</div>
      {/if}
    </div>
  </div>
</Theme>
