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

import { defineComponent, inject } from 'vue'
import { Platform, Metadata } from '@anticrm/platform'
import ui, { PlatformInjectionKey } from '..'

export default defineComponent({
  props: {
    icon: {
      type: String,
      required: true
    }
  },
  setup (props) {
    const platform = inject(PlatformInjectionKey) as Platform
    console.log(props.icon)
    const url = props.icon ??
      platform.getMetadata(ui.icon.Default) ?? 'https://pltfo.com'
    return { url }
  }
})
</script>

<template>
  <svg>
    <use :xlink:href="url" />
  </svg>
</template>
