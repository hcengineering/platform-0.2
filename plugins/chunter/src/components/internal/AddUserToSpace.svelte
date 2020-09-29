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
  import contact, { User } from '@anticrm/contact';
  import { mixinKey, Ref, Space, StringProperty, Tx } from '@anticrm/core'
  import core from '@anticrm/platform-core'
  import { getCoreService, getUIService } from '../../utils'

  export let space: Ref<Space>
  export let spaceUsers: User[]
  let userAccountToAdd: string

  const coreService = getCoreService()
  const uiService = getUIService()

  function isAccountInSpace (account: string) {
    const accountKey = mixinKey(contact.mixin.User, 'account')
    return spaceUsers.map(user => (user as any)[accountKey]).indexOf(account) >= 0
  }

  function addUserToSpace () {
    console.log(`addUserToSpace: userAccountToAdd = '${userAccountToAdd}', space = '${space}'`)
    uiService.closeModal()

    if (!userAccountToAdd || userAccountToAdd.length <= 0) {
      // empty account given, nothing to do
      return
    }

    if (isAccountInSpace(userAccountToAdd)) {
      // the space already contains this user, nothing to do
      console.log(`account '${userAccountToAdd}' is already in space '${space}'`)
      return
    }

    coreService.then(coreService => {
      // first check that such user exists
      coreService.findOne(contact.mixin.User, { account: userAccountToAdd as StringProperty })
        .then(user => {
          if (!user) {
            throw new Error(`user '${userAccountToAdd}' not found`)
          }

          // add new user account to the 'users' collection via Push transaction
          const tx = {
            _class: core.class.PushTx,
            _objectId: space,
            _objectClass: core.class.Space,
            _attribute: 'users' as StringProperty,
            _attributes: userAccountToAdd as StringProperty,
            _space: space
          }

          // absent Tx fields will be autofilled
          return coreService.tx(tx as unknown as Tx)
        }).catch(err => {
          // TODO: show pretty error message to the user
          console.log('Error adding user to the space!', err)
        })
    })
  }
</script>

<h1>Добавить пользователя<br/>в пространство</h1>
<!-- TODO: support autocompletion to quickly find user ccount -->
<input type="text" class="editbox" bind:value={ userAccountToAdd }/>
<button class="button" on:click={addUserToSpace}>Add</button>
