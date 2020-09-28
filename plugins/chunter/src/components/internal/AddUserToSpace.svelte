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
  import contact from '@anticrm/contact';
  import { Ref, Space, StringProperty } from '@anticrm/core'
  import { getCoreService, getUIService } from '../../utils'

  export let space: Ref<Space>
  let userAccount: string

  const coreService = getCoreService()
  const uiService = getUIService()

  function addUserToSpace () {
    console.log(`addUserToSpace: userAccount = '${userAccount}', space = '${space}'`)
    uiService.closeModal()

    coreService.then(coreService => {
      // first check that such user exists
      coreService.findOne(contact.mixin.User, { account: userAccount as StringProperty })
        .then(user => {
          if (user) {
            return coreService.addUserToSpace(userAccount, space)
          }
          throw new Error(`user '${userAccount}' not found`)
        }).catch(err => {
          // TODO: show pretty error message to the user
          console.log('Error adding user to the space!', err)
        })
    })
  }
</script>

<h1>Добавить пользователя<br/>в пространство</h1>
<!-- TODO: support autocompletion to quickly find user ccount -->
<input type="text" class="editbox" bind:value={ userAccount }/>
<button class="button" on:click={addUserToSpace}>Add</button>
