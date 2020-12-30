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
  import { ObjectTx } from '@anticrm/core'
  import { Tx } from '@anticrm/model'
  import core from '@anticrm/platform-core'
  import { AnyComponent, Asset } from '@anticrm/platform-ui'
  import { User } from '@anticrm/contact'
  import { getContactService, getPresentationService, getPlatform } from '../../utils'
  import chunter from '../..'

  import Component from '@anticrm/platform-ui/src/components/Component.svelte'

  export let tx: Tx

  const platform = getPlatform()
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

<style lang="scss">
  .activity-item {
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

<div class="activity-item">
  <img class="avatar" src={avatar} />
  <div class="details">
    <b>{user ? user.name : ''}</b>
    15:23
    <div>
      <!-- {JSON.stringify(tx)} -->
      <Component is={info} props={{ tx }} />
    </div>
  </div>
</div>
