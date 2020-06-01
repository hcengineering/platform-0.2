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
import { Platform, Resource } from '@anticrm/platform'
import { defineComponent, reactive, computed, provide, inject, watch, PropType } from 'vue'
import workbench, { WorkbenchStateInjectionKey, WorkbenchState, ViewModelKind } from '..'
import ui, { AnyComponent, UIService, COMPONENT } from '@anticrm/platform-ui'
import { UIServiceInjectionKey, CoreServiceInjectionKey, PlatformInjectionKey } from '@anticrm/platform-ui-components'
import { Ref, Class, Doc, CoreService } from '@anticrm/platform-core'

import Button from '@anticrm/sparkling-controls/src/Button.vue'

export default defineComponent({
  components: {},
  props: {
    content: String
  },
  async setup (props, context) {
    const platform = inject(PlatformInjectionKey) as Platform
    const coreService = inject(CoreServiceInjectionKey) as CoreService
    const uiService = inject(UIServiceInjectionKey) as UIService

    const _class = props.content as Ref<Class<Doc>>

    const show = props.content as Resource<any>
    //const component = platform.adapt(show, COMPONENT)

    const clazz = await coreService.getInstance(_class)
    if (!coreService.is(clazz, ui.class.Form)) {
      throw new Error(`something went wrong, can't find 'Form' for the ${_class}.`)
    }
    const component = coreService.as(clazz, ui.class.Form).form
    const content = coreService.getDb().createDocument(_class, {})
    return {
      component, content
    }
  }
})
</script>

<template>
  <widget v-if="component" :component="component" :content="content" />
</template>