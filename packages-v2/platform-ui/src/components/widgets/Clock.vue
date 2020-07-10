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
import { defineComponent, ref, onUnmounted } from 'vue'

export default defineComponent({
  setup () {
    const hours = ref('')
    const minutes = ref('')
    const delimiter = ref(false)
    const interval = setInterval(() => {
      const date = new Date()
      const h = date.getHours()
      hours.value = h < 10 ? '0' + h : h.toString()
      const m = date.getMinutes()
      minutes.value = m < 10 ? '0' + m : m.toString()
      delimiter.value = !delimiter.value
    }, 500)
    onUnmounted(() => {
      clearInterval(interval)
    })
    return { hours, minutes, delimiter: delimiter }
  },
})
</script>

<template>
  <div>
    <span>{{hours}}</span>
    <span :style="{visibility: delimiter ? 'visible' : 'hidden'}">:</span>
    <span>{{minutes}}</span>
  </div>
</template>
