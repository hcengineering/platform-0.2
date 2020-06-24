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
import vue, { getPlatform } from '../..'
import { NetworkActivity } from '@anticrm/platform'

import Icon from '../../components/Icon.vue'

export default defineComponent({
  components: { Icon },
  setup () {
    const activity = ref(false)
    const listener = (active: boolean) => {
      console.log('ACTIVITY', active)
      activity.value = active
    }

    const platform = getPlatform()
    platform.addEventListener(NetworkActivity, listener)
    onUnmounted(() => {
      platform.removeEventListener(listener)
    })
    return { vue, activity }
  },
})
</script>

<template>
  <div>
    <Icon
      :icon="vue.icon.Network"
      class="icon-embed"
      :style="{visibility: activity ? 'visible' : 'hidden'}"
    />
  </div>
</template>
