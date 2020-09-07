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
import { CreateTx } from '@anticrm/platform'

import { getCoreService, getContactService } from '../utils'
import { User } from '@anticrm/contact'

import { getChunterService } from '..'

export default defineComponent({
  components: {
  },
  props: {
    tx: Object as PropType<CreateTx>
  },
  setup (props, context) {
    const chunterService = getChunterService()

    return {
      parseMessage: chunterService.parseMessage
    }
  }
})
</script>

<template>
  <div class="chunter-message-info">
    <span v-for="(node, index) in parseMessage(tx._attributes?.message)" :key="index">
      <span v-if="node.kind === 1">{{node}}</span>
      <span v-else>{{node.text}}</span>
    </span>
  </div>
</template>

<style lang="scss">
.chunter-message-info {
}
</style>