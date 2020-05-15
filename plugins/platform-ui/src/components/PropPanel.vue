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

import Vue, { PropType } from 'vue'

import { Obj, Class, Ref } from '@anticrm/platform-core'

import ui, { UIPlugin, AttrModel } from '@anticrm/platform-ui'
import InlineEdit from '@anticrm/platform-ui-controls/src/InlineEdit.vue'
import Icon from './Icon.vue'

export default Vue.extend({
  components: { InlineEdit, Icon },
  props: {
    object: Promise as PropType<Promise<Obj>>,
    clazz: String as unknown as PropType<Ref<Class<Obj>>>,
    filter: Array as PropType<string[]>
  },
  data() {
    return {
      model: this.$uiPlugin.groupByType(this.$uiPlugin.getDefaultAttrModel(this.filter)),
      classModel: this.$uiPlugin.getClassModel(this.clazz),
      content: {}
    }
  },
  created() {
    this.$uiPlugin.getOwnAttrModel(this.clazz, this.filter)
      .then(result => this.model = this.$uiPlugin.groupByType(result))
    this.object.then(res => this.content = res)
  }
})
</script>

<template>
  <div>
    <div class="caption-4" style="margin-bottom: 1em">{{classModel.label}}</div>
    <div v-for="(attrs, type) in model" :key="type" class="container">
      <div style="margin-right: 0.5em">
        <Icon :icon="attrs[0].icon" class="icon-embed-2x" />
      </div>
      <div style="margin-right: 1em; margin-bottom: 1em">
        <div v-for="prop in attrs" :key="prop.key">
          <div class="caption-4">{{ prop.label }}</div>
          <InlineEdit v-model="content[prop.key]" :placeholder="prop.placeholder" />
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped lang="scss">
@import "~@anticrm/platform-ui-theme/css/_variables.scss";

.container {
  display: inline-flex;
}
</style>
