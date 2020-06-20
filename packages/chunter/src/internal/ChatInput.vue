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
import { defineComponent, ref } from 'vue'
import { Ref } from '@anticrm/platform-core'
import { Account, User } from '@anticrm/platform-business'
import { getSession } from '@anticrm/platform-vue'

import chunter, { Channel } from '..'
import EditBox from '@anticrm/sparkling-controls/src/EditBox.vue'

export default defineComponent({
  components: { EditBox },
  setup () {
    const session = getSession()
    const text = ref('')

    function submit (value: string) {
      session.newInstance(chunter.class.DocMessage, {
        text: value, channel: '' as Ref<Channel>, participants: [], replies: [],
        createdOn: new Date(), createdBy: '' as Ref<Account>, onBehalfOf: '' as Ref<User>
      }).then(() => session.commit()).then(() => text.value = '')

      console.log('todo: submit ' + value)
    }
    return { submit, text }
  }
})
</script>

<template>
  <div class="chat-input">
    <EditBox v-model="text" @keyup.enter="submit($event.target.value)" />
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.chat-input {
  .edit-box {
    width: 100%;
    margin-bottom: 1em;
  }
}
</style>