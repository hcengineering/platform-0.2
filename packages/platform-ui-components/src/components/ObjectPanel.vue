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

import { defineComponent, PropType, inject } from 'vue'
import { Platform } from '@anticrm/platform'

import core, { Obj, Doc, Ref, Class, CoreService } from '@anticrm/platform-core'
import { PlatformInjectionKey, CoreServiceInjectionKey } from '..'

import PropPanel from './PropPanel.vue'

// async function getClassHierarchy (platform: Platform, object: Promise<Obj>): Promise<Ref<Class<Obj>>[]> {
//   const corePlugin = await platform.getPlugin(core.id)
//   const clazz = (await object)._class
//   return corePlugin.getClassHierarchy(clazz)
// }

export default defineComponent({
  components: { PropPanel },
  props: {
    content: Object as PropType<Doc>,
    filter: Array as PropType<string[] | undefined>,
  },
  setup (props) {
    const coreService = inject(CoreServiceInjectionKey) as CoreService
    const classes = coreService.getClassHierarchy(props.content._class).splice(0, 2)
    console.log('classes: ' + classes.toString())
    console.log(props.content)
    return { classes }
  }
})
</script>

<template>
  <table>
    <tr>
      <td valign="top" v-for="clazz in classes" :key="clazz">
        <Suspense>
          <PropPanel :clazz="clazz" :content="content" />
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
