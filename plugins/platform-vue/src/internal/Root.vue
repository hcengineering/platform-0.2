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
import { Platform, TaskEvent, Task } from '@anticrm/platform'
import { defineComponent, computed, reactive, onMounted, onUnmounted, inject, ref, toRefs } from 'vue'
import ui, { AnyComponent } from '@anticrm/platform-ui'
import vue, { getVueService, getPlatform } from '..'

export const AppInjectionKey = 'AppInjectionKey'

const defaultStatus = 'Система готова к работе.'

export default defineComponent({
  components: {},
  setup () {
    const platform = getPlatform()
    const status = ref(defaultStatus)
    platform.addEventListener(TaskEvent.Start, (task: Task) => {
      status.value = task.name + '...'
    })
    platform.addEventListener(TaskEvent.Done, (task: Task) => {
      //status.value = defaultStatus
    })

    const vueService = getVueService()
    const current = computed(() => vueService.getLocation())
    return { status, current, appLoader: vue.component.AppLoader }
  },
})
</script>

<template>
  <div id="rich-client">
    <div class="status-bar">
      <div class="container">
        <div class="logo">
          <span class="text-1">anticrm</span>
          <span class="text-2">Platform</span>&nbsp;
          <span class="text-3">0.1.0</span>
        </div>
        <div class="status-messages">{{status}}</div>
        <div class="widgets">
          <div class="clock">11:47</div>
        </div>
      </div>
    </div>
    <div class="app">
      <widget
        v-if="current.app"
        :component="current.app"
        :path="current.path"
        :params="current.params"
        :fallback="appLoader"
      />
      <div v-else class="caption-1">Huston, no default application provided.</div>
    </div>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_globals.scss";
@import "~@anticrm/sparkling-theme/css/_variables.scss";

#rich-client {
  @include root-style;

  display: flex;
  flex-direction: column;

  height: 100vh;

  .status-bar {
    background-color: $content-color;
    color: $content-bg-color;
    height: $status-bar-height;
    line-height: $status-bar-height;
    // border-bottom: 1px solid red;
    // box-sizing: border-box;

    .container {
      display: flex;
      .logo {
        flex-grow: 1;
        padding-left: 1em;
        padding-right: 1em;
        .text-1 {
          font-size: 1em;
          font-weight: 400;
        }
        .text-2 {
          font-size: 1.25em;
          font-weight: 700;
        }
        .text-3 {
          font-size: 1em;
          font-weight: 700;
        }
      }

      .status-messages {
        flex-grow: 2;
      }

      .widgets {
        flex-grow: 4;
        display: flex;
        flex-direction: row-reverse;

        .clock {
          padding-right: 1em;
          font-size: 1em;
          font-weight: 700;
        }
      }
    }
  }

  .app {
    height: calc(100vh - #{$status-bar-height});
    background-color: $content-bg-color;
  }
}
</style>
