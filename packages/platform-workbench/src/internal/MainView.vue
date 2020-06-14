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
import { getSession } from '@anticrm/platform-vue'
import core, { Ref, Class, Doc, CoreService, ClassKind, Instance } from '@anticrm/platform-core'
import ui, { AnyComponent, UIService, ComponentKind } from '@anticrm/platform-ui'

import Button from '@anticrm/sparkling-controls/src/Button.vue'

export default defineComponent({
  components: {},
  props: {
    path: String,
    params: Object
  },

  // Adapt `content` to a `Component`. Forward to `Component`.
  async setup (props, context) {
    const session = getSession()
    const operation = computed(() => props.path.split('/')[1])
    const resource = props.path.split('/')[0] as Resource<any>
    const component = await session.adapt(resource, ComponentKind)

    return {
      component, resource, operation
    }
  }
})
</script>

<template>
  <div>
    <div class="caption-5">{{path}} : {{operation}}</div>
    <widget
      v-if="component"
      :component="component"
      :resource="resource"
      :operation="operation"
      :params="params"
    />
  </div>
</template>