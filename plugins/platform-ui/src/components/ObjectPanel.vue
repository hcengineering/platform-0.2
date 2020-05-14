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
import platform from '@anticrm/platform'

import core, { Obj, Ref, Class } from '@anticrm/platform-core'

import ui, { UIPlugin, AttrModel } from '@anticrm/platform-ui'
import PropPanel from './PropPanel.vue'

export default Vue.extend({
  components: { PropPanel },
  props: {
    object: Object as PropType<Obj>,
    filter: Array as PropType<string[]>
  },
  data() {
    return {
      // classes: this.$uiPlugin.groupByType(this.$uiPlugin.getDefaultAttrModel(this.filter)),
      // classModel: this.$uiPlugin.getClassModel(this.object.getClass())
    }
  },
  computed: {
    classes(): Class<Obj>[] {
      const result = [] as Class<Obj>[]
      let clazz = this.object.getClass() as Class<Obj> | undefined
      while (true) {
        result.push(clazz)
        const _extends = clazz._extends
        if (!_extends || _extends === core.class.Doc)
          break
        clazz = clazz.getSession().getInstance(_extends, core.class.Class) // TODO: getInstance(unknown) fails
      }
      return result
    }
  },
  // created() {
  //   this.$uiPlugin.getAttrModel(this.object, this.filter)
  //     .then(result => this.model = this.$uiPlugin.groupByType(result))
  // }
})
</script>

<template>
  <table>
    <tr>
      <td valign="top" v-for="clazz in classes" :key="clazz._id">
        <PropPanel :clazz="clazz" :object="object" />
      </td>
    </tr>
  </table>
</template>


<style scoped lang="scss">
@import "~@anticrm/platform-ui-theme/css/_variables.scss";

.container {
  display: inline-flex;
}
</style>
