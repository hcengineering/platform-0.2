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

export default defineComponent({
  setup () {
    return {
      credits: [
        ["Andrey Platov", "Project Sponsor"],
        ["", "Project Manager"],
        ["", "Product Owner"],
        ["", "Product Manager"],
        ["", "Senior Frontend Engineer"],
        ["", "Senior Backend Engineer"],
        ["", "Senior DevOps"],
        ["", "System Architect"],
        ["", "Release Manager"],
        ["", "UI/UX Lead"],
        ["", "QA Lead"],
      ]
    }
  }
})
</script>

<template>
  <table class="mc-credits-container">
    <tr v-for="(credit, index) in credits" :key="index">
      <td style="white-space:nowrap">{{credit[0]}}</td>
      <td>{{credit[1]}}</td>
    </tr>
  </table>
</template>

<style lang="scss">
.mc-credits-container {
  border-spacing: 0;
}
</style>