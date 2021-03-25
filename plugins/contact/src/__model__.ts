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

import core, { extendIds, Builder, Class$, Mixin$, Prop } from '@anticrm/model'
import { Class, Ref, Property } from '@anticrm/core'
import { Space } from '@anticrm/domains'
import _contact, { Contact, Person, User } from '.'
import { IntlString } from '@anticrm/platform-i18n'
import { TVDoc } from '@anticrm/model/src/__model__'
import { UX } from '@anticrm/presentation/src/__model__'
import presentation from '@anticrm/presentation'

const contact = extendIds(_contact, {
  application: {},
  class: {
    Contact: '' as Ref<Class<Contact>>,
    Person: '' as Ref<Class<Person>>
  },
  // mixin: {
  //   User: '' as Ref<Mixin<User>>
  // }
  space: {
    Contact: '' as Ref<Space>
  }
})

export default contact

@Class$(contact.class.Contact, core.class.VDoc, 'contact')
@UX('Контактная информация' as IntlString)
class TContact extends TVDoc implements Contact {
  @Prop() @UX('Телефон' as IntlString, { icon: contact.icon.Phone }) phone?: string
  @Prop() @UX('Электропочта' as IntlString, { icon: contact.icon.Email }) email?: string
}

@Class$(contact.class.Person, contact.class.Contact)
@UX('Персональная информация' as IntlString)
export class TPerson extends TContact implements Person {
  @Prop() @UX('Имя' as IntlString) name!: string
  @Prop() @UX('День рождения' as IntlString, { icon: contact.icon.Date }) birthDate?: Property<number, Date>
}

@Mixin$(contact.mixin.User, contact.class.Person)
export class TUser extends TPerson implements User {
  @Prop() @UX('Аккаунт' as IntlString) account!: string
}

export function model (S: Builder): void {
  S.add(TContact, TPerson, TUser)

  S.mixin(contact.class.Person as Ref<Class<Person>>, presentation.mixin.DetailForm, {
    component: contact.component.PersonProperties
  })

  S.mixin(contact.mixin.User, presentation.mixin.LookupForm, {
    component: contact.component.UserLookup
  })

  // S.createDocument(workbench.class.WorkbenchCreateItem, {
  //   label: 'Контакт / Новый Пользователь' as StringProperty,
  //   icon: contact.icon.Phone,
  //   itemClass: contact.mixin.User as Ref<Class<VDoc>> // TODO: fix itemClass type
  // })
}
