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
  import ChatMessageItem from './ChatMessageItem.svelte'
  import { onDestroy } from 'svelte'
  import { QueryResult } from '@anticrm/platform-core';
  import { VDoc } from '@anticrm/core'
  import { getChunterService, getCoreService } from '../../utils'
  import chunter, { Message } from '../..'

  const coreService = getCoreService()
  const chunterService = getChunterService()

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
    chunterService.then(chunterService => {
      const parsedMessage = chunterService.createMissedObjects(message)
      coreService.then(coreService => {
        const newMessage = { _class: chunter.class.Message, message: parsedMessage }
        // absent VDoc fields will be autofilled
        coreService.createVDoc(newMessage as unknown as VDoc)
      })
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
          <ChatMessageItem message={message} />
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
    }
  }
</style>
