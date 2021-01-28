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

import { plugin, Plugin, Service } from '@anticrm/platform'
import { Mixin, Property, Ref } from '@anticrm/core'
import { VDoc } from '@anticrm/domains'

import ui, { Asset, AnyComponent, getPlatform } from '@anticrm/platform-ui'
import core from '@anticrm/platform-core'

export interface Contact extends VDoc {
  phone?: string
  email?: string
}

export interface Person extends Contact {
  name: string

  birthDate?: Property<number, Date>
}

export interface User extends Person {
  account: string
}

// P L U G I N

export interface ContactService extends Service {
  getUser (account: string): Promise<User>

  getAvatar (user: Ref<User>): Asset

  getMyName (): Promise<string>
}

const contactPlugin = plugin('contact' as Plugin<ContactService>, {
  core: core.id,
  ui: ui.id
}, {
  icon: {
    Date: '' as Asset,
    Phone: '' as Asset,
    Email: '' as Asset
  },
  component: {
    PersonProperties: '' as AnyComponent,
    UserLookup: '' as AnyComponent,
    LoginWidget: '' as AnyComponent
  },
  mixin: {
    User: '' as Ref<Mixin<User>>
  }
})
export default contactPlugin

export function getContactService (): Promise<ContactService> {
  return getPlatform().getPlugin(contactPlugin.id)
}
