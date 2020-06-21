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
import { defineComponent, computed, reactive, onMounted, onUnmounted, inject, ref, toRefs } from 'vue'
import ui, { AnyComponent } from '@anticrm/platform-ui'
import vue, { getVueService } from '..'

export const AppInjectionKey = 'AppInjectionKey'

export default defineComponent({
  components: {},
  setup () {
    const vueService = getVueService()
    const current = computed(() => vueService.getLocation())
    return { current, appLoader: vue.component.AppLoader }
  },
})
</script>

<template>
  <div id="app">
    <widget
      v-if="current.app"
      :component="current.app"
      :path="current.path"
      :params="current.params"
      :fallback="appLoader"
    />
    <div v-else class="caption-1">Huston, no default application provided.</div>
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
