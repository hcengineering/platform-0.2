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
import { defineComponent, ref, reactive, inject, computed, PropType } from 'vue'
import { Instance } from '@anticrm/platform-core'
import { AnyComponent } from '@anticrm/platform-ui'
import { Person, Contact } from '..'

import InlineEdit from '@anticrm/sparkling-controls/src/InlineEdit.vue'
import ObjectPanel from '@anticrm/platform-ui/src/components/ObjectPanel.vue'

export default defineComponent({
  components: { InlineEdit, ObjectPanel },
  props: {
    content: Object as PropType<Instance<Person>>
  },
  setup (props, context) {
    return {
    }
  }
})
</script>

<template>
  <div>
    <div>
      <InlineEdit class="caption-1" v-model="content.firstName" placeholder="Фамилия" />
    </div>
    <div>
      <InlineEdit class="caption-2" v-model="content.lastName" placeholder="Имя Отчество" />
    </div>
    <ObjectPanel :content="content" style="margin-top: 2em" />
  </div>
</template>

<style scoped lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.container {
  display: inline-flex;
}
</style>
