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
import { defineComponent, reactive, computed, provide, inject, watch, PropType } from 'vue'
import { Platform, Resource, getResourceKind } from '@anticrm/platform'
import { injectPlatform } from '@anticrm/platform-vue'
import core, { Ref, Class, Doc, CoreService, ClassKind, Instance } from '@anticrm/platform-core'
import ui, { AnyComponent, UIService, ComponentKind } from '@anticrm/platform-ui'
import { getCoreService } from '..'

import Button from '@anticrm/sparkling-controls/src/Button.vue'

export default defineComponent({
  components: {},
  props: {
    content: String
  },
  async setup (props, context) {
    const resource = props.content as Resource<any>
    const coreService = getCoreService()
    const component = await coreService.adapt(resource, ComponentKind)

    let document: Ref<Doc>
    if (getResourceKind(resource) === ClassKind) {
      const _class = resource as Ref<Class<Doc>>
      document = coreService.getDb().createDocument(_class, {
        firstName: 'Валентин Генрихович',
        lastName: 'Либерзон',
        phone: '+7 913 333 7777'
      })._id
      console.log('CREATE!')
      console.log(document)
    }

    return {
      component, document
    }
  }
})
</script>

<template>
  <widget v-if="component" :component="component" :content="document" />
</template>