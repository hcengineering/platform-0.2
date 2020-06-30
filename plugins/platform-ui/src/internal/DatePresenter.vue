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

import { PropType, defineComponent, ref, computed } from 'vue'
import { getI18nService } from '@anticrm/platform-vue'
import ui from '@anticrm/platform-ui'

const currentTime = ref(Math.round(Date.now() / 1000)) // seconds
setInterval(() => { currentTime.value = Math.round(Date.now() / 1000) }, 1000)

export default defineComponent({
  components: {},
  props: {
    modelValue: Object as PropType<Date>
  },
  setup (props) {

    const i18n = getI18nService()

    const text = computed(() => {
      if (!props.modelValue) {
        return 'нет данных'
      }
      const seconds = Math.round(props.modelValue.getTime() / 1000)
      const duration = currentTime.value - seconds
      return i18n.translate(ui.strings.TimeSince, { count: Math.round(duration / 60) })
    })

    return { text }
  }
})

</script>

<template>
  <span>{{ text }}</span>
</template>

