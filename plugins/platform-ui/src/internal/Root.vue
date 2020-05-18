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
  import { defineComponent } from 'vue'
  import { platformConfig } from '.'
  import Background from './SysInfo.vue'

  export default defineComponent({
    components: { Background },
    setup() {
      return { platformConfig }
    }
  })
</script>

<template>
  <div id="app">
    <widget v-if="platformConfig.app" :component="platformConfig.app"/>
    <Background v-else/>
  </div>
</template>

<style lang="scss">
  @import "~@anticrm/platform-ui-theme/css/_globals.scss";

  #app {
    @include root-style;

    height: 100vh;
    background-color: $content-bg-color;
  }
</style>
