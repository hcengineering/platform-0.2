<!--
  -
  - Copyright © 2020 Anticrm Platform Contributors.
  -
  - Licensed under the Eclipse Public License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License. You may
  - obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  -
  - See the License for the specific language governing permissions and
  - limitations under the License.
  -
  -->

<script lang="ts">
import { defineComponent, computed, reactive, onMounted, onUnmounted, provide } from 'vue'
import { UIStateInjectionKey, UIState, AnyComponent } from '..'
import SysInfo from './SysInfo.vue'

export default defineComponent({
  components: { SysInfo },
  setup () {
    const path = window.location.pathname
    const split = path.split('/')

    const initState: UIState = { app: split[1] as AnyComponent, path }
    const uiState = reactive(initState)

    provide(UIStateInjectionKey, uiState)

    const listener = () => { uiState.path = window.location.pathname }
    onMounted(() => { window.addEventListener('popstate', listener) })
    onUnmounted(() => { window.removeEventListener('popstate', listener) })

    return { uiState }
  },
})
</script>

<template>
  <div id="app">
    <widget v-if="uiState.app" :component="uiState.app" />
    <SysInfo v-else />
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
