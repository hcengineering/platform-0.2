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
<script lang='ts'>
  import type { ObjectTx } from '@anticrm/domains'
  import type { Tx } from '@anticrm/core'
  import type { AnyComponent, Asset } from '@anticrm/platform-ui'
  import type { User } from '@anticrm/contact'
  import { getContactService } from '@anticrm/contact'
  import chunter from '../..'
  import { getPresentationService } from '@anticrm/presentation'

  import Component from '@anticrm/platform-ui/src/components/Component.svelte'

  export let tx: Tx

  const contactService = getContactService()
  const presentationService = getPresentationService()

  let user: User
  let avatar: Asset
  let info: AnyComponent

  $: {
    const objectClass = (tx as ObjectTx)._objectClass
    contactService
      .then((c) => c.getUser(tx._user))
      .then((u) => {
        user = u
      })
    contactService
      .then((c) => c.getAvatar(tx._id))
      .then((a) => {
        avatar = a
      })
    presentationService.then((p) => {
      info = p.getComponentExtension(objectClass, chunter.mixin.ActivityInfo)
    })
  }
</script>

<style lang='scss'>
  .activity-item {
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

<div class='activity-item'>
  <img class='avatar' src={avatar} alt='avatar'/>
  <div class='details'>
    <b>{user ? user.name : ''}</b>
    <span>15:23</span>
    <div>
      <!-- {JSON.stringify(tx)} -->
      <Component is={info} props={{ tx }} />
    </div>
  </div>
</div>
