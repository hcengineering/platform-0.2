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
import { AnyComponent } from '@anticrm/platform-ui'
import { getVueService } from '..'

export default defineComponent({
  props: {
    app: String as unknown as PropType<AnyComponent>,
    path: String
  },
  setup (props) {
    return {
      navigate: getVueService().navigate
    }
  }
})
</script>

<template>
  <a href="#" @click.prevent="navigate({app, path})">
    <slot />
  </a>
</template>
