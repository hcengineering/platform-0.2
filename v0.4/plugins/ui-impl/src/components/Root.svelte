<script lang="ts">
  import { Status, Severity } from '@anticrm/status'
  import type { Platform } from '@anticrm/plugin'
  import type { AnyComponent, UIService } from '@anticrm/plugin-ui'
  import uiPlugin, { CONTEXT_PLATFORM, CONTEXT_PLATFORM_UI, applicationShortcutKey } from '@anticrm/plugin-ui'
  import { setContext } from 'svelte'

  import { Theme } from '@anticrm/sparkling-theme'
  import { Component } from '@anticrm/sparkling-components'

  import StatusComponent from './Status.svelte'
  import Clock from './Clock.svelte'
  import ThemeSelector from './ThemeSelector.svelte'
  import Modal from './Modal.svelte'
  
  export let platform: Platform
  export let ui: UIService

  setContext(CONTEXT_PLATFORM, platform)
  setContext(CONTEXT_PLATFORM_UI, ui)

  let application: AnyComponent | undefined

  interface RootRouteParams {
    application: AnyComponent | null
  }

  ui.newRouter<RootRouteParams>(
    ':application',
    (route) => {
      if (route.application) {
        const shortcut = platform.getMetadata(applicationShortcutKey(route.application))
        application = shortcut ?? route.application
      }
    },
    { application: null }
  )

  const status: Status = { severity: Severity.OK, code: 0, message: '' }

  platform.addEventListener('PlatformStatus', (_event, status) => {
    // if (status.severity === Severity.ERROR && status.code === PlatformStatusCodes.AUTHENTICATON_REQUIRED) {
    //   authenticationRequired = true
    // } else if (status.severity === Severity.OK && status.code === PlatformStatusCodes.AUTHENTICATON_OK) {
    //   authenticationRequired = false
    // }

    return Promise.resolve()
  })
</script>

<Theme>
  <div id="ui-root">
    <div class="bg-noise opacity-2"/>
    <div class="bg-cover"/>
    <div class="status-bar">
      <div class="container">
        <div class="logo">&#x24C5;</div>
        <div class="status-messages">
          <StatusComponent {status} />
        </div>
        <div class="widgets">
          <div class="widget">
            <Clock />
          </div>
          <div class="widget">
            <ThemeSelector />
          </div>
        </div>
      </div>
    </div>
    <div class="app">
      {#if application}
        <Component is={application} props={{}} />
      {:else}
        <div class="caption-1 error">
          Application not found: {application}
        </div>
      {/if}
    </div>
  </div>
  <Modal />
</Theme>

<style lang="scss">
  @import "@anticrm/sparkling-theme/styles/mixins.scss";

  $status-bar-height: 20px;
  $pictogram-size: 51px;

  #ui-root {
    position: relative;
    display: flex;
    flex-direction: column;

    height: 100vh;

    .bg-cover {
      @include bg-layer(linear-gradient(112.79deg, #AEA4CC 2.31%, rgba(196, 150, 191, 0) 98.9%), 0.05);
    }

    .status-bar {
      height: $status-bar-height;
      line-height: $status-bar-height;

      .container {
        display: flex;

        .logo {
          width: $pictogram-size;
          text-align: center;
          font-size: 1.25em;
          font-weight: 700;
        }

        .status-messages {
          flex-grow: 1;
          text-align: center;
        }

        .widgets {
          display: flex;
          flex-direction: row-reverse;

          .widget {
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
      min-width: 1200px;
      min-height: 800px;
    }
  }
</style>
