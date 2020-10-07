<script lang="ts">
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
  import { Ref, parseMessage, parseMessageText } from '@anticrm/core'
  import { Asset } from '@anticrm/platform-ui'
  import { User } from '@anticrm/contact'
  import { getContactService } from '../../utils'
  import { Message } from '../..'
  import MessageViewer from '@anticrm/presentation/src/components/MessageViewer.svelte'

  export let message: Message

  let username: string
  let avatar: Asset
  let timestamp: string = new Date(message._createdOn).toLocaleString()

  getContactService().then((service) => {
    service.getUser(message._createdBy).then((user) => {
      username = user.name
      avatar = service.getAvatar(user._id as Ref<User>)
    })
  })
</script>

<div class="chat-message-item">
  <img class="avatar" src="{avatar}" alt="avatar" />
  <div class="details">
    <b>{username}</b>
    {timestamp}
    { #if message.comments }
      <MessageViewer message={parseMessageText(message.comments[0].message)} />
      <!-- { #if message.comments && message.comments.length > 1 }
      { /if } -->
    { /if }
  </div>
</div>

<style lang="scss">
  .chat-message-item {
    display: flex;
    margin: 1em;

    .avatar {
      object-fit: cover;
      border-radius: 4px;
      width: 3em;
      height: 3em;
    }

    .details {
      padding-left: 1em;
    }
  }
</style>
