<script lang="ts">
  import { Status, Severity } from '@anticrm/status'
  import type { Platform } from '@anticrm/plugin'
  import { PlatformStatus } from '@anticrm/plugin'
  import type { AnyComponent, UIService } from '@anticrm/plugin-ui'
  import uiPlugin, { CONTEXT_PLATFORM, CONTEXT_PLATFORM_UI, applicationShortcutKey } from '@anticrm/plugin-ui'
  import { setContext } from 'svelte'

  import { Theme } from '@anticrm/sparkling-theme'
  import { Component } from '@anticrm/sparkling-components'

  import StatusComponent from './Status.svelte'
  import Clock from './Clock.svelte'
  import Mute from './icons/Mute.svelte'
  import WiFi from './icons/WiFi.svelte'
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

  let status: Status = { severity: Severity.OK, code: 0, message: '' }

  platform.addEventListener(PlatformStatus, async (_event, _status) => {
    status = _status
    console.log('Platfrom Status', _event, _status)
  })
</script>

<Theme>
  <div id="ui-root">
    <div class="status-bar">
      <div class="container">
        <div class="status-messages">
          <StatusComponent {status} />
        </div>
        <div class="widgets">
          <div class="clock">
            <Clock />
          </div>
          <div class="widget">
            <Mute size={16}/>
          </div>
          <div class="widget">
            <WiFi size={16}/>
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
  $status-bar-height: 32px;

  #ui-root {
    position: relative;
    display: flex;
    flex-direction: column;

    height: 100vh;

    .status-bar {
      min-height: $status-bar-height;

      .container {
        display: flex;
        align-items: center;
        height: 100%;

        .status-messages {
          flex-grow: 1;
          text-align: center;
        }

        .widgets {
          display: flex;
          align-items: center;
          flex-direction: row-reverse;

          .clock {
            margin: 0 40px 0 24px;
            font-weight: 500;
            font-size: 12px;
            color: var(--theme-caption-color);
            opacity: 0.3;
          }
          .widget {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            opacity: 0.3;
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
