<script lang="ts">
  import type { Metadata, Platform, Status } from '@anticrm/platform'
  import { PlatformStatus, Severity } from '@anticrm/platform'
  import type { ApplicationRoute, UIService } from '../..'
  import { CONTEXT_PLATFORM, CONTEXT_PLATFORM_UI, routeMeta } from '../..'
  import { setContext } from 'svelte'

  import Theme from '@anticrm/sparkling-theme/src/components/Theme.svelte'
  import StatusComponent from './Status.svelte'
  import Clock from './Clock.svelte'
  import ThemeSelector from './ThemeSelector.svelte'
  import Component from '../Component.svelte'
  import Modal from './Modal.svelte'
  import uiPlugin from '../../.'
  import { PlatformStatusCodes } from '@anticrm/foundation'
  import { newRouter } from '../../'

  export let platform: Platform
  export let ui: UIService

  setContext(CONTEXT_PLATFORM, platform)
  setContext(CONTEXT_PLATFORM_UI, ui)

  const defaultApp = platform.getMetadata(uiPlugin.metadata.DefaultApplication) ?? ''
  const authMeta = platform.getMetadata(uiPlugin.metadata.LoginApplication) ?? ''
  const authApp = platform.getMetadata(routeMeta(authMeta))

  let authenticationRequired = false

  let currentApp: ApplicationRoute | undefined
  let currentAppErr: string | undefined

  interface ApplicationInfo {
    application: string
  }

  newRouter<ApplicationInfo>(
    ':application',
    (route) => {
      let appRoute: Metadata<ApplicationRoute> = routeMeta(defaultApp)
      if (route.application && route.application.length > 0 && route.application !== '#default') {
        appRoute = routeMeta(route.application)
      }
      if (appRoute) {
        const routeAppComponent = platform.getMetadata(appRoute)
        if (routeAppComponent) {
          currentAppErr = undefined
          currentApp = routeAppComponent
          return
        }
      }
      if (!currentApp) {
        currentAppErr = `There is no application route defined for ${appRoute}`
      }
    },
    { application: platform.getMetadata(routeMeta(defaultApp))?.route || '#default' }
  )

  const status: Status = { severity: Severity.OK, code: 0, message: '' }

  platform.addEventListener(PlatformStatus, (_event, status) => {
    if (status.severity === Severity.ERROR && status.code === PlatformStatusCodes.AUTHENTICATON_REQUIRED) {
      authenticationRequired = true
    } else if (status.severity === Severity.OK && status.code === PlatformStatusCodes.AUTHENTICATON_OK) {
      authenticationRequired = false
    }

    return Promise.resolve()
  })
</script>

<Theme>
  <div id="ui-root">
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
          <!-- <div v-for="widget in widgets" :key="widget" class="widget">
            <widget :component="widget" />
          </div> -->
        </div>
      </div>
    </div>
    <div class="app">
      {#if authenticationRequired && authApp}
        <Component is={authApp.component} props={{}} />
      {:else if currentApp}
        <Component is={currentApp.component} props={{}} />
      {:else}
        <div class="caption-1 error">
          Could not find application: "{currentAppErr}"
        </div>
      {/if}
    </div>
  </div>
  <Modal />
</Theme>

<style lang="scss">
  $status-bar-height: 20px;
  $pictogram-size: 51px;

  #ui-root {
    display: flex;
    flex-direction: column;

    height: 100vh;

    .status-bar {
      height: $status-bar-height;
      line-height: $status-bar-height;
      border-bottom: 1px solid var(--theme-bg-color);

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
    }
  }
</style>
