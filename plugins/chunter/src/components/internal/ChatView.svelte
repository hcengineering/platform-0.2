<script type='ts'>
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

  import { Property, Ref, StringProperty } from '@anticrm/core'
  import { Space, CORE_CLASS_SPACE } from '@anticrm/domains'
  import { MessageNode } from '@anticrm/text'
  import ReferenceInput from '@anticrm/presentation/src/components/refinput/ReferenceInput.svelte'
  import ScrollView from '@anticrm/sparkling-controls/src/ScrollView.svelte'
  import { onDestroy } from 'svelte'
  import chunter, { getChunterService, Message } from '../..'
  import CommentComponent from './Comment.svelte'
  import DateItem from './DateItem.svelte'
  import { getCoreService } from '@anticrm/platform-ui'

  const coreService = getCoreService()
  const chunterService = getChunterService()

  export let space: Ref<Space>

  let spaceName: string
  let messages: Message[] = []

  const ms = getCoreService().subscribe(chunter.class.Message, { _space: space }, (docs) => {
    messages = docs
  }, onDestroy)

  $: {
    ms({ _space: space })
    // TODO: use Titles index instead of getting the whole Space object
    coreService.findOne(CORE_CLASS_SPACE, { _id: space })
      .then((spaceObj) => (spaceName = spaceObj ? '#' + spaceObj.name : ''))
  }

  function createMessage (message: MessageNode) {
    if (message) {
      chunterService.then((chunterService) => {
        const parsedMessage = chunterService.createMissedObjects(message)

        const comment = {
          _createdOn: Date.now() as Property<number, Date>,
          _createdBy: coreService.getUserId() as StringProperty,
          message: parsedMessage as StringProperty
        }
        // absent VDoc fields will be autofilled
        coreService.create(chunter.class.Message, {
          _space: space,
          comments: [comment]
        })
      })
    }
  }
</script>

<style lang='scss'>
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
      border-bottom: 1px solid var(--theme-bg-accent-color);
      display: flex;
      align-items: center;
    }

    .refContainer {
      margin: 0 2em 2em 2em;
    }
  }
</style>

<div class='chat'>
  <div class='captionContainer'>
    <span class='caption-1'>Чат {spaceName}</span>&nbsp;
  </div>
  <ScrollView height="100%" margin="2em" autoscroll={true}>
    <div class='content'>
      {#each messages as message (message._id)}
        {#if message.comments}
          <CommentComponent message={message.comments[0]} />
        {/if}
      {/each}
      <DateItem dateItem={new Date()} />
    </div>
  </ScrollView>
  <div class='refContainer'>
    <ReferenceInput on:message={(e) => createMessage(e.detail)} />
  </div>
</div>
