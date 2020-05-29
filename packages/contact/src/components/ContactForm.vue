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
import { defineComponent, ref, reactive, inject } from 'vue'
import { AnyComponent } from '@anticrm/platform-ui'
import { WorkbenchStateInjectionKey } from '@anticrm/platform-workbench'

import InlineEdit from '@anticrm/sparkling-controls/src/InlineEdit.vue'

export default defineComponent({
  components: { InlineEdit },
  setup (props, context) {
    const workbenchState = inject(WorkbenchStateInjectionKey)
    return {
      workbenchState
    }
  }
})
</script>

<template>
  <div>
    <InlineEdit class="caption-1" placeholder="Фамилия" />
    {{workbenchState}}Hallo
    <!-- <br /> v-model="content.firstName" v-model="content().firstName"
    <InlineEdit class="caption-2" v-model="content.lastName" placeholder="Имя Отчество" />
    <ObjectPanel :object="object" style="margin-top: 2em" />-->
  </div>
</template>

<style scoped lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.container {
  display: inline-flex;
}
</style>
