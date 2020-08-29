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

export default defineComponent({
  components: {
  },
  props: {
    tx: Object as PropType<CreateTx>
  },
  setup (props, context) {
  }
})
</script>

<template>
  <div class="chunter-message-info">{{tx._attributes?.message}}</div>
</template>

<style lang="scss">
.chunter-message-info {
}
</style>