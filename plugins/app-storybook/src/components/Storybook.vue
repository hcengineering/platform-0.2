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
import { defineComponent } from 'vue'
import InfoPanel from '@anticrm/sparkling-controls/src/InfoPanel.vue'
import LinkTo from '@anticrm/platform-vue/src/components/LinkTo.vue'

export default defineComponent({
  components: { InfoPanel, LinkTo }
})
</script>

<template>
  <div class="text-small-uppercase" style="padding: 2em;">
    <InfoPanel caption="Examples">
      <div class="crm-table">
        <div class="tr">
          <div class="td">
            <LinkTo app="component:storybook.Controls">Controls</LinkTo>
          </div>
        </div>
        <div class="tr">
          <div class="td">
            <LinkTo app="component:storybook.Persons">Table of Persons</LinkTo>
          </div>
        </div>
        <div class="tr">
          <div class="td">
            <LinkTo app="component:storybook.Calendar">Calendar</LinkTo>
          </div>
        </div>
      </div>
    </InfoPanel>
  </div>
</template>
