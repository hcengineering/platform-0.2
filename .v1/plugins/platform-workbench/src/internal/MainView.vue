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
import { defineComponent, ref, computed } from 'vue'
import { Platform, Resource, getResourceKind } from '@anticrm/platform'
import vue, { getSession } from '@anticrm/platform-vue'
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
  setup (props, context) {
    const component = ref(vue.component.AppLoader)
    const session = getSession()
    const operation = computed(() => props.path.split('/')[1])
    const resource = props.path.split('/')[0] as Resource<any>
    session.adapt(resource, ComponentKind)
      .then(comp => { component.value = comp })

    return {
      component, resource, operation
    }
  }
})
</script>

<template>
  <div style="height: 100%">
    <widget
      v-if="component"
      :component="component"
      :resource="resource"
      :operation="operation"
      :params="params"
    />
  </div>
</template>