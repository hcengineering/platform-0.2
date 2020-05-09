<!--
// Copyright © 2020 Andrey Platov <andrey.v.platov@gmail.com>
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

import Vue, { PropType } from 'vue'
import platform from '@anticrm/platform'

import { Obj } from '@anticrm/platform-core'

import { UIPlugin, pluginId, AttrModel } from '@anticrm/platform-ui'
import InlineEdit from '@anticrm/platform-ui-controls/src/InlineEdit.vue'

export default Vue.extend({
  components: { InlineEdit },
  props: {
    object: Object as PropType<Promise<Obj>>,
    filter: Array as PropType<string[]>
  },
  data() {
    return {
      model: this.$uiPlugin.getDefaultAttrModel(this.filter)
    }
  },
  created() {
    this.$uiPlugin.getAttrModel(this.object, this.filter).then(result => this.model = result)
  }
})
</script>

<template>
  <div>
    <div v-for="prop in model" :key="prop.key">
      <span>{{ prop.label }}</span>
      <InlineEdit v-model="object[prop.key]" :placeholder="prop.placeholder" />
    </div>
  </div>
</template>
