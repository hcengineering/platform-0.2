<script type="ts">
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

  import type { DocumentValue, Ref, StringProperty } from '@anticrm/core'
  import { DateProperty } from '@anticrm/core'
  import type { Space } from '@anticrm/domains'
  import type { MessageNode } from '@anticrm/text'
  import ReferenceInput from '@anticrm/presentation/src/components/refinput/ReferenceInput.svelte'
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import type { Message } from '../..'
  import chunter, { getChunterService } from '../..'
  import CommentComponent from './Comment.svelte'
  import { getCoreService, getUserId, liveQuery } from '@anticrm/presentation'

  import DateItem from './DateItem.svelte'
  import Button from '@anticrm/sparkling-controls/src/Button.svelte'
  import Icon from '@anticrm/platform-ui/src/components/Icon.svelte'
  import ui from '@anticrm/platform-ui'
  import type { QueryUpdater } from '@anticrm/presentation'

  const coreService = getCoreService()
  const chunterService = getChunterService()

  export let space: Space

  let spaceName: string
  let messages: Message[] = []

  const userId = getUserId()
  let ms: Promise<QueryUpdater<Message>>

  $: ms = liveQuery<Message>(ms, chunter.class.Message, { _space: space._id as Ref<Space> }, (docs) => {
    messages = docs
  })

  $: spaceName = space ? '#' + space.name : ''

  function createMessage (message: MessageNode) {
    if (message) {
      chunterService.then((chunterService) => {
        const parsedMessage = chunterService.createMissedObjects(message)

        const comment = {
          _createdOn: Date.now() as DateProperty,
          _createdBy: userId as StringProperty,
          message: parsedMessage
        }

        // absent VDoc fields will be autofilled
        coreService.then((cs) =>
          cs.create<Message>(chunter.class.Message, {
            _space: space._id as Ref<Space>,
            comments: [comment]
          } as DocumentValue<Message>)
        )
      })
    }
  }
</script>

<div class="chat">
  <div class="captionContainer">
    <span class="caption-1">Chat {spaceName}</span>&nbsp;
  </div>
  <ScrollView height="100%" margin="2em" autoscroll={true}>
    <div class="content">
      {#each messages as message (message._id)}
        {#if message.comments}
          <CommentComponent message={message.comments[0]} />
        {/if}
      {/each}
      <DateItem dateItem={new Date()} />
      <div style="height: 20px" />
      <Button kind="icon">
        <Icon icon={ui.icon.Message} size="32" />
      </Button>
      <Button kind="icon">
        <Icon icon={ui.icon.Phone} size="32" />
      </Button>
      <Button kind="icon">
        <Icon icon={ui.icon.Mail} size="32" />
      </Button>
      <Button kind="icon">
        <Icon icon={ui.icon.More} size="32" />
      </Button>
      <div style="height: 20px" />
    </div>
  </ScrollView>
  <div class="refContainer">
    <ReferenceInput on:message={(e) => createMessage(e.detail)} />
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

    .captionContainer {
      box-sizing: border-box;
      width: 100%;
      height: 5em;
      padding: 2em;
      display: flex;
      align-items: center;
      border-bottom: 1px solid var(--theme-bg-accent-color);
    }

    .refContainer {
      margin: 0 2em 2em 2em;
    }
  }
</style>
