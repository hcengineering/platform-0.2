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
import { Resource } from '@anticrm/platform'
import { defineComponent, PropType, inject, ref } from 'vue'
import { AnyComponent } from '@anticrm/platform-ui'
import { getPlatform } from '..'

export default defineComponent({
  props: {
    action: String
  },
  setup (props, context) {
    const working = ref(false)

    function execute () {
      working.value = true
      this.$platform.getResource(props.action as Resource<any>).then(action => {
        const result = action(context.attrs)
        if (result instanceof Promise) {
          result.then(() => working.value = false)
        } else {
          working.value = false
        }
      })
    }
    return {
      working,
      execute
    }
  }
})
</script>

<template>
  <div @click.prevent="execute()">
    <slot />
  </div>
</template>
