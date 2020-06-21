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
import { getSession } from '@anticrm/platform-vue'
import chunter from '..'

import EditBox from '@anticrm/sparkling-controls/src/EditBox.vue'
import Message from './Message.vue'

export default defineComponent({
  components: { EditBox, Message },
  setup () {
    const messages = ref([])

    const session = getSession()
    session.query(chunter.class.DocMessage, {}, result => {
      console.log('!!!!!!!!!!!!!!!!!')
      console.log(result)
      messages.value = result.concat()
    })

    return { messages }
  }
})
</script>

<template>
  <div class="chunter-chat">
    <Message v-for="message in messages" :key="message._id" :message="message" />
  </div>
</template>

<style lang="scss">
@import "~@anticrm/sparkling-theme/css/_variables.scss";

.chunter-chat {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: calc(100vh - 120px);
  overflow-y: scroll;
}
</style>
