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

import { defineComponent, ref, PropType } from 'vue'
import { getPlatform } from '@anticrm/platform-vue'
import i18n, { IntlString } from '@anticrm/platform-core-i18n'

export default defineComponent({
  props: {
    id: String as unknown as PropType<IntlString>,
    params: Object,
  },
  setup (props) {
    const platform = getPlatform()
    const text = ref('to be translated')
    platform.getPlugin(i18n.id).then(plugin => text.value = plugin.translate(props.id, props.params))
    return { text }
  }
})
</script>

<template>
  <span>{{text}} {{params}}</span>
</template>
