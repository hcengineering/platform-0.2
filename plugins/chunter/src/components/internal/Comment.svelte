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
  import { parseMessage } from '@anticrm/text'
  import type { User } from '@anticrm/contact'
  import { getContactService } from '@anticrm/contact'
  import type { Comment } from '../..'
  import MessageViewer from '@anticrm/presentation/src/components/MessageViewer.svelte'
  import type { Ref } from '@anticrm/core'
  import type { Asset } from '@anticrm/platform-ui'

  export let message: Comment

  let username: string
  const timestamp: string = new Date(message._createdOn).toLocaleString()
  let avatar: Promise<Asset>

  $: avatar = getContactService().then((service) => {
    return service.getUser(message._createdBy).then((user) => {
      username = user.name
      return service.getAvatar(user._id as Ref<User>)
    })
  })
</script>

<div class="chat-message-item">
  {#await avatar}
    <div class="avatar" />
  {:then avt}
    <img class="avatar" src={avt} alt="avatar" />
  {/await}
  <div class="details">
    <b>{username}</b>
    <span>{timestamp}</span>
    <MessageViewer message={parseMessage(message.message)} />
  </div>
</div>

<style lang="scss">
  @import '~@anticrm/sparkling-theme/styles/_global.scss';

  .chat-message-item {
    display: flex;
    margin-bottom: 1em;

    .avatar {
      object-fit: cover;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      z-index: 51;
    }

    .details {
      padding-left: 1em;
      position: relative;
      & > span {
        font-size: 11px;
      }
      &::before {
        position: absolute;
        content: '';
        left: -17px;
        height: calc(100% + 1em);
        width: 1px;
        z-index: 50;
      }
    }
  }
  :global(.theme-dark) .chat-message-item {
    .avatar {
      border: 1px solid $theme-dark-bg-dark-color;
      background-color: white;
      box-shadow: 0 0 0 2px $theme-dark-bg-color;
    }
    .details {
      & > b {
        color: $theme-dark-userlink-color;
      }
      & > span {
        color: $theme-dark-content-trans-color;
      }
      &::before {
        background-color: $theme-dark-bg-dark-color;
      }
    }
  }
  :global(.theme-grey) .chat-message-item {
    .avatar {
      border: 1px solid $theme-grey-bg-dark-color;
      background-color: white;
      box-shadow: 0 0 0 2px $theme-grey-bg-color;
    }
    .details {
      & > b {
        color: $theme-grey-userlink-color;
      }
      & > span {
        color: $theme-grey-content-trans-color;
      }
      &::before {
        background-color: $theme-grey-bg-dark-color;
      }
    }
  }
  :global(.theme-light) .chat-message-item {
    .avatar {
      border: 1px solid $theme-light-bg-dark-color;
      background-color: white;
      box-shadow: 0 0 0 2px $theme-light-bg-color;
    }
    .details {
      & > b {
        color: $theme-light-userlink-color;
      }
      & > span {
        color: $theme-light-content-trans-color;
      }
      &::before {
        background-color: $theme-light-bg-dark-color;
      }
    }
  }
</style>
