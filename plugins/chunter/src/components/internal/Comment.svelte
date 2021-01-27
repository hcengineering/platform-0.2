<script lang='ts'>
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
  import { parseMessage } from '@anticrm/core'
  import { Asset } from '@anticrm/platform-ui'
  import { getContactService, User } from '@anticrm/contact'
  import { Comment } from '../..'
  import MessageViewer from '@anticrm/presentation/src/components/MessageViewer.svelte'
  import { Ref } from '@anticrm/model'

  export let message: Comment

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

<style lang='scss'>
  .chat-message-item {
    display: flex;
    margin-bottom: 1em;

    .avatar {
      object-fit: cover;
      border: 1px solid var(--theme-bg-dark-color);
      box-shadow: 0 0 0 2px var(--theme-bg-color);
      border-radius: 50%;
      width: 32px;
      height: 32px;
      z-index: 51;
    }

    .details {
      padding-left: 1em;
      position: relative;

      & > b {
        color: var(--theme-userlink-color);
      }

      & > span {
        font-size: 11px;
        color: var(--theme-content-trans-color);
      }

      &::before {
        position: absolute;
        content: '';
        left: -17px;
        height: calc(100% + 1em);
        width: 1px;
        background-color: var(--theme-bg-dark-color);
        z-index: 50;
      }
    }
  }
</style>

<div class='chat-message-item'>
  <img class='avatar' src={avatar} alt='avatar' />
  <div class='details'>
    <b>{username}</b>
    <span>{timestamp}</span>
    <MessageViewer message={parseMessage(message.message)} />
  </div>
</div>
