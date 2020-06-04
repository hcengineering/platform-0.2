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

import { defineComponent, PropType } from 'vue'
import { Platform } from '@anticrm/platform'

import core, { Obj, Doc, Ref, Class, CoreService, Instance } from '@anticrm/platform-core'
import { injectPlatform } from '..'

import PropPanel from './PropPanel.vue'

export default defineComponent({
  components: { PropPanel },
  props: {
    instance: Object as PropType<Instance<Doc>>,
    top: String,
    exclude: String
  },
  async setup (props) {
    const _ = await injectPlatform({ core: core.id })
    const coreService = _.deps.core
    const classes = coreService.getClassHierarchy(props.instance._class, props.top as Ref<Class<Obj>>)
    return { classes }
  }
})
</script>

<template>
  <table>
    <tr>
      <td valign="top" v-for="clazz in classes" :key="clazz">
        <Suspense>
          <PropPanel :clazz="clazz" :instance="instance" :exclude="exclude" />
        </Suspense>
      </td>
    </tr>
  </table>
</template>

<style scoped lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.container {
  display: inline-flex;
}
</style>
