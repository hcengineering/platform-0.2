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

import StatusComponent from './Status.vue'
import Clock from './widgets/Clock.vue'

export default defineComponent({
  components: { Status: StatusComponent, Clock },
  setup () {
    const platform = getPlatform()
    const uiService = getUIService()

    const status = ref(new Status(Severity.OK, 0, ''))
    const icon = ref('')

    platform.addEventListener(PlatformStatus, async (event: string, platformStatus: Status) => {
      status.value = platformStatus
    })

    const location = computed(() => uiService.getLocation())

    return { status, icon, location, spinner: ui.component.Spinner, widgets: uiService.widgets }
  }
})
</script>

<template>
  <div id="ui-root">
    <div class="status-bar">
      <div class="container">
        <div class="logo">&#x24C5;</div>
        <div class="status-messages">
          <Status :status="status" />
        </div>
        <div class="widgets">
          <div class="clock">
            <Clock />
          </div>
          <div v-for="widget in widgets" :key="widget" class="widget">
            <widget :component="widget" />
          </div>
        </div>
      </div>
    </div>
    <div class="app">
      <widget
        :component="location.app"
        :fallback="spinner"
        :location="location"
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
    /*box-sizing: border-box;*/

    .container {
      display: flex;

      .logo {
        width: $pictogram-size;
        text-align: center;
        /*padding-left: 1em;*/
        /*padding-right: 1em;*/

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

        .widget {
          border-left: 1px solid $nav-bg-color;
          padding-right: 1em;
          padding-left: 1em;
          font-weight: 700;
        }

        .clock {
          border-left: 1px solid $nav-bg-color;
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
