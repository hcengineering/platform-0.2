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
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import ChatMessageItem from './ChatMessageItem.svelte'
  import AddUserToSpace from './AddUserToSpace.svelte'
  import { onDestroy } from 'svelte'
  import core, { QueryResult } from '@anticrm/platform-core';
  import { AnyLayout, Ref, Space, VDoc } from '@anticrm/core'
  import { getChunterService, getCoreService, getUIService } from '../../utils'
  import chunter, { Message } from '../..'
  import contact, { User } from '@anticrm/contact'
  import ui from '@anticrm/platform-ui'

  const coreService = getCoreService()
  const chunterService = getChunterService()
  const uiService = getUIService()

  export let space: Ref<Space>

  let spaceName: string = ''
  let spaceUsers: User[] = []
  let messages: Message[] = []
  let unsubscribeFromMessages: () => void
  let unsubscribeFromSpace: () => void

  function subscribeForMessages(queryResult: QueryResult<Message>) {
    if (unsubscribeFromMessages) {
      unsubscribeFromMessages()
    }
    unsubscribeFromMessages = queryResult.subscribe(docs => messages = docs)
  }

  function subscribeForSpace(queryResult: QueryResult<Space>) {
    if (unsubscribeFromSpace) {
      unsubscribeFromSpace()
    }
    unsubscribeFromSpace = queryResult.subscribe(spaces => {
      console.log('spacesUpdated:', spaces)

      if (spaces && spaces.length > 0) {
        onSpaceUpdated(spaces[0]) // only one space expected here
      } else {
        spaceName = ''
        spaceUsers = []
      }
    })
  }

  function onSpaceUpdated(space: Space) {
    spaceName = '#' + space.name

    if (space.users && space.users.length > 0) {
      coreService.then(service => service.find(contact.mixin.User, { account: { $in: space.users } } as unknown as AnyLayout))
          .then(users => spaceUsers = users ?? [])
          .catch(err => {
            console.log('error while getting list of space users', err)
            spaceUsers = []
          })
    } else {
      spaceUsers = []
    }
  }

  $: {
    coreService.then(service => service.query(chunter.class.Message, { _space: space })).then(queryResult => subscribeForMessages(queryResult))
    coreService.then(service => service.query(core.class.Space, { _id: space })).then(queryResult => subscribeForSpace(queryResult))
  }

  onDestroy(() => {
    if(unsubscribeFromMessages) {
      unsubscribeFromMessages()
    }
    if (unsubscribeFromSpace) {
      unsubscribeFromSpace()
    }
  })

  function createMessage(message: string) {
    if (message) {
      chunterService.then(chunterService => {
        const parsedMessage = chunterService.createMissedObjects(message)
        coreService.then(coreService => {
          const newMessage = { _class: chunter.class.Message, _space: space, message: parsedMessage }
          // absent VDoc fields will be autofilled
          coreService.createVDoc(newMessage as unknown as VDoc)
        })
      })
    }
  }

  function addUserToSpace() {
    uiService.showModal(AddUserToSpace, {space})
  }
</script>

<div class="chat">
  <div>
    <span class="caption-1">Чат {spaceName}</span>&nbsp;
  </div>
  <div>
    <span class="caption-4">Пользователи в чате: </span>
    { #each spaceUsers as user, i }
      <span>{user.name}</span>
      { #if i < spaceUsers.length - 1 }
        <span>,&nbsp;</span>
      { /if }
    { /each }
    <a href="/" on:click|preventDefault = {addUserToSpace}>
      <Icon icon={ui.icon.Add} clazz="icon-embed"/>
    </a>
  </div>
  <ScrollView stylez="height:100%;" autoscroll={true}>
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
