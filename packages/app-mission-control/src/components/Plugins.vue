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
import { PluginInfo, PluginStatus } from '@anticrm/platform'

export default defineComponent({
  props: {
    plugins: Array
  },
  setup () {
    return {
      status (info: PluginInfo) {
        return (info.status === PluginStatus.RUNNING) ? '☀︎' : ''
      }
    }
  }
})
</script>

<template>
  <table class="mc-plugins-container">
    <tr v-for="config in plugins" :key="config.id">
      <td>platform-{{config.id}}</td>
      <td>{{config.version}}</td>
      <td>{{status(config)}}</td>
    </tr>
  </table>
</template>

<style lang="scss">
.mc-plugins-container {
  border-spacing: 0;
}
</style>