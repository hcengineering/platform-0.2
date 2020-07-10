<!--
// Copyright © 2020 Anticrm Platform Contributors.
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
  import { computed, defineComponent, ref } from 'vue'
  import ui, { getPlatform, getUIService } from '..'
  import { PlatformStatus, Severity, Status } from '@anticrm/platform'

  import Clock from './widgets/Clock.vue'

  export default defineComponent({
    components: {Clock},
    setup() {
      const platform = getPlatform()
      const uiService = getUIService()

      const status = ref('')
      const error = ref('')

      platform.addEventListener(PlatformStatus, async (event: string, platformStatus: Status) => {
        switch (platformStatus.severity) {
          case Severity.INFO:
            status.value = platformStatus.message + '...'
            break
          case Severity.ERROR:
            error.value = platformStatus.message + '.'
            break
          default:
            status.value = ''
        }
      })

      const location = computed(() => uiService.getLocation())

      return {status, error, location, spinner: ui.component.Spinner}
    }
  })
</script>

<template>
  <div id="ui-root">
    <div class="status-bar">
      <div class="container">
        <div class="logo">&#x24C5;</div>
        <div class="status-messages">{{status}} {{error}}</div>
        <div class="widgets">
          <div class="clock">
            <Clock/>
          </div>
        </div>
      </div>
    </div>
    <div class="app">
      <widget
          :component="location.app"
          :fallback="spinner"
          v-if="location.app"
      />
      <!--        :path="current.path"-->
      <!--        :params="current.params"-->
      <div v-else class="caption-1 error">No application provided.</div>
    </div>
  </div>
</template>

<style lang="scss">
  @import "~@anticrm/sparkling-theme/css/_globals.scss";
  @import "~@anticrm/sparkling-theme/css/_variables.scss";

  $status-bar-height: 20px;

  #ui-root {
    @include root-style;

    display: flex;
    flex-direction: column;

    height: 100vh;

    .status-bar {
      background-color: $side-bg-color;
      color: $content-color;
      height: $status-bar-height;
      line-height: $status-bar-height;
      border-bottom: 1px solid $nav-bg-color;
      box-sizing: border-box;

      .container {
        display: flex;

        .logo {
          padding-left: 1em;
          padding-right: 1em;

          font-size: 1.25em;
          font-weight: 700;

          border-right: 1px solid $nav-bg-color;
        }

        .status-messages {
          flex-grow: 1;
          text-align: center;
        }

        .widgets {
          display: flex;
          flex-direction: row-reverse;
          border-left: 1px solid $nav-bg-color;

          .clock {
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
      background-color: $content-bg-color;
    }
  }
</style>
