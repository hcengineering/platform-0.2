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
  import { computed, defineComponent, ref } from 'vue'
  import ui from '@anticrm/platform-ui'

  export default defineComponent({
    components: {},
    props: {
      path: Array,
      params: Object
    },

    // Adapt `content` to a `Component`. Forward to `Component`.
    setup(props, context) {
      const component = ref(ui.component.Spinner)
      const operation = computed(() => props.path[0])
      const resource = props.path.split('/')[0] as Resource<any>
      session.adapt(resource, ComponentKind)
        .then(comp => {
          component.value = comp
        })

      return {
        component, resource, operation
      }
    }
  })
</script>

<template>
  <div style="height: 100%">
    <widget
        :component="component"
        :operation="operation"
        :params="params"
        :resource="resource"
        v-if="component"
    />
  </div>
</template>