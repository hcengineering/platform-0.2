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

import core, { Builder, Class$, extendIds, Mixin$, Primary, Prop } from '@anticrm/model'
import { Class, Property, Ref } from '@anticrm/core'

import { Space } from '@anticrm/domains'
import _contact, { Contact, Person, User } from '.'
import { IntlString } from '@anticrm/platform-i18n'
import { TVDoc } from '@anticrm/model/src/__model__'
import { UX } from '@anticrm/presentation/src/__model__'
import activity from '@anticrm/activity'

const contact = extendIds(_contact, {
  application: {},
  class: {
    Contact: '' as Ref<Class<Contact>>
  },
  space: {
    Contact: '' as Ref<Space>
  }
})

export default contact

@Class$(contact.class.Contact, core.class.VDoc, 'contact')
@UX('Contact Information' as IntlString)
class TContact extends TVDoc implements Contact {
  @Prop() @UX('Phone' as IntlString, { icon: contact.icon.Phone }) phone?: string
  @Prop() @UX('Email' as IntlString, { icon: contact.icon.Email }) email?: string
  @Prop() @UX('Telegram username' as IntlString, { icon: contact.icon.Telegram }) telegramUserName?: string
}

@Class$(contact.class.Person, contact.class.Contact)
@UX('Personal information' as IntlString)
export class TPerson extends TContact implements Person {
  @Primary()
  @Prop() @UX('Name' as IntlString) name!: string

  @Prop() @UX('Birthday' as IntlString, { icon: contact.icon.Date }) birthDate?: Property<number, Date>
}

@Mixin$(contact.mixin.User, contact.class.Person)
export class TUser extends TPerson implements User {
  @Prop() @UX('Account' as IntlString) account!: string
}

export function model (S: Builder): void {
  S.add(TContact, TPerson, TUser)

  S.mixin(contact.class.Person, activity.mixin.ActivityInfo, {
    component: contact.component.PersonInfo
  })
}
