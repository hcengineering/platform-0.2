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
import { Platform } from '@anticrm/platform'

import core, { Obj, Doc, Ref, Class } from '@anticrm/platform-core'

import ui, { UIPlugin, AttrModel } from '@anticrm/platform-ui-model'
import PropPanel from './PropPanel.vue'

async function getClassHierarchy(platform: Platform, object: Promise<Obj>): Promise<Ref<Class<Obj>>[]> {
  const corePlugin = await platform.getPlugin(core.id)
  const clazz = (await object)._class
  return corePlugin.getClassHierarchy(clazz)
}

export default Vue.extend({
  components: { PropPanel },
  props: {
    object: Promise as PropType<Promise<Doc>>,
    filter: Array as PropType<string[] | undefined>,
  },
  data() {
    return {
      classes: [] as Ref<Class<Obj>>[]
    }
  },
  created() {
    getClassHierarchy(this.$platform, this.object).then(classes => this.classes = classes)
  }
})
</script>

<template>
  <table>
    <tr>
      <td valign="top" v-for="clazz in classes" :key="clazz">
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
