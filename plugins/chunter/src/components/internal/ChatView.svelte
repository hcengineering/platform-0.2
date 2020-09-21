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

<script type="ts">
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import ReferenceInput from '@anticrm/presentation/src/components/refinput/ReferenceInput.svelte'
  import { onDestroy } from 'svelte'
  import { QueryResult } from '@anticrm/platform-core';
  import { parseMessage } from '@anticrm/core'
  import { getCoreService } from '../../utils'
  import chunter, { Message } from '../..'

  const coreService = getCoreService()

  let messages: Message[] = []
  let unsubscribe: () => void

  function subscribe(queryResult: QueryResult<Message>) {
    if (unsubscribe) unsubscribe()
    unsubscribe = queryResult.subscribe(docs => messages = docs)
  }

  // TODO: select messages only for the active space
  $: coreService.then(service => service.query(chunter.class.Message, {})).then(queryResult => subscribe(queryResult))

  onDestroy(() => { if(unsubscribe) unsubscribe() })

  function createMessage(message: string) {
    console.log('ChatView, user entered:', message)

    coreService.then(service => {
      // TODO: specify space
      const newMessage = { _class: chunter.class.Message, _id: service.generateId(), message }
      service.createDoc(newMessage)
    })
  }
</script>

<div class="chat">
  <div>
    <span class="caption-1">Чат</span>&nbsp;
  </div>
  <ScrollView stylez="height:100%;">
    <div class="content">
      { #each messages as message (message._id) }
        <!-- TODO: pretty message representation (avatar, name, timestamp) -->
        <div class="message-item">
          { #each parseMessage(message.message) as pm }
            <span>{@html pm.text}</span>
          { /each }
        </div>
      { /each }
    </div>
  </ScrollView>
  <div>
    <ReferenceInput on:message={e => createMessage(e.detail)}/>
  </div>
</div>

<style lang="scss">
  .chat {
    height: 100%;
    display: flex;
    flex-direction: column;  

    .content {
      flex-grow: 1;

      .message-item {
        display: flex;
        margin: 1em;
        padding-left: 1em;
      }
    }
  }
</style>
