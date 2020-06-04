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
import { Platform, Resource } from '@anticrm/platform'
import { injectPlatform } from '@anticrm/platform-ui-components'
import core, { Ref, Class, Doc, CoreService, CLASS, Instance } from '@anticrm/platform-core'
import ui, { AnyComponent, UIService, COMPONENT } from '@anticrm/platform-ui'

import Button from '@anticrm/sparkling-controls/src/Button.vue'

export default defineComponent({
  components: {},
  props: {
    content: String
  },
  async setup (props, context) {
    const _ = await injectPlatform({ core: core.id })
    const coreService = _.deps.core

    const resource = props.content as Resource<any>
    const component = await coreService.adapt(resource, COMPONENT)

    let document: Ref<Doc>
    if (_.platform.getResourceKind(resource) === CLASS) {
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