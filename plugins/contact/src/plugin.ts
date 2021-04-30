//
// Copyright © 2020-2021 Anticrm Platform Contributors.
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
//

import { Platform } from '@anticrm/platform'
import { Ref } from '@anticrm/core'
import contact, { User, ContactService } from '.'

import PersonInfo from './components/internal/PersonInfo.svelte'
import core, { CoreService } from '@anticrm/platform-core'
import { UIService, Asset } from '@anticrm/platform-ui'

export default async (platform: Platform, deps: { core: CoreService, ui: UIService }): Promise<ContactService> => {
  platform.setResource(contact.component.PersonInfo, PersonInfo)

  const coreService = deps.core

  // const uiService = deps.ui

  async function getUser (account: string): Promise<User> {
    const user = await coreService.findOne<User>(contact.mixin.User, { account: account })
    if (user === undefined) {
      throw new Error('Failed to find user')
    }
    return user
  }

  async function getMyName (): Promise<string> {
    const whoAmI = platform.getMetadata(core.metadata.WhoAmI)
    if (whoAmI === undefined) {
      return 'Nobody'
    }
    return await getUser(whoAmI).then(user => user?.name)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function getAvatar (user: Ref<User>): Asset {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('../assets/ava2x48.jpg') as Asset
  }

  const service = {
    getUser,
    getMyName,
    getAvatar
  }

  return service
}
