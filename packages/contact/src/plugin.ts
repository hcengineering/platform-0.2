//
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
//

import { Platform, Service, StringProperty } from '@anticrm/platform'

import contact, { User, ContactService } from '.'
import PersonProperties from './components/PersonProperties.vue'
import UserLookup from './components/UserLookup.vue'
import { CoreService } from '@anticrm/platform-core'

/*!
 * Anticrm Platform™ Contact Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform, deps: { core: CoreService }): Promise<ContactService> => {

  platform.setResource(contact.component.PersonProperties, PersonProperties)
  platform.setResource(contact.component.UserLookup, UserLookup)

  const coreService = deps.core

  function getUser (account: string): Promise<User> {
    return coreService.findOne(contact.mixin.User, { account: account as StringProperty }) as Promise<User>
  }

  return {
    getUser
  }
}
