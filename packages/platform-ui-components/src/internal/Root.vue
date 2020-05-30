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
import { Platform } from '@anticrm/platform'
import { defineComponent, computed, reactive, onMounted, onUnmounted, inject, ref } from 'vue'
import ui from '@anticrm/platform-ui'
import { PlatformInjectionKey } from '..'

export default defineComponent({
  components: {},
  setup () {
    const platform = inject(PlatformInjectionKey) as Platform

    const app = ref('')
    const path = ref('')

    function onPathChange () {
      const pathname = window.location.pathname
      const split = pathname.split('/')

      app.value = split[1].length === 0 ? platform.getMetadata(ui.metadata.DefaultApplication) : split[1]
      path.value = split.splice(2).join('/')
    }

    onPathChange()

    onMounted(() => { window.addEventListener('popstate', onPathChange) })
    onUnmounted(() => { window.removeEventListener('popstate', onPathChange) })

    // E V E N T S

    function pushState (url) {
      history.pushState(null, null, url)
      onPathChange()
    }

    return { app, path, pushState }
  },
})
</script>

<template>
  <div id="app">
    <widget v-if="app" :component="app" :path="path" @pushState="pushState($event)" />
    <div v-else class="caption-1">Huston: no default application provided.</div>
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_globals.scss";

#app {
  @include root-style;

  height: 100vh;
  background-color: $content-bg-color;
}
</style>
