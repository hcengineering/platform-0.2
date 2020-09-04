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

import { UIBuilder } from '@anticrm/presentation-model'
import core from '@anticrm/platform-model'
import presentation from '@anticrm/presentation-model'
import workbench from '@anticrm/workbench-model'
import { Class, VDoc, Ref, StringProperty, Property, EasyScript, THIS, GET, CONCAT } from '@anticrm/platform'

import contact from '.'
import { Person } from '@anticrm/contact'
import { IntlString } from '@anticrm/platform-i18n'

export default (S: UIBuilder) => {

  S.createClassUI(contact.class.Contact, core.class.VDoc, {
    label: 'Контактная информация' as IntlString,
    _domain: 'contact' as Property<string, string>,
  }, {
    phone: S.attrUI(core.class.Type, {}, {
      label: 'Телефон' as IntlString,
      icon: contact.icon.Phone
    }),
    email: S.attrUI(core.class.Type, {}, {
      label: 'Электропочта' as IntlString,
      icon: contact.icon.Email
    }),
  })

  S.createClassUI(contact.class.Person, contact.class.Contact, {
    label: 'Персональная информация' as IntlString
  }, {
    firstName: S.attrUI(core.class.Type, {}, {
      label: 'Имя' as IntlString
    }),
    lastName: S.attrUI(core.class.Type, {}, {
      label: 'Фамилия' as IntlString
    }),
    birthDate: S.attrUI(core.class.Type, {}, {
      label: 'День рождения' as IntlString,
      icon: contact.icon.Date
    }),
    toStr: S.attr(core.class.ESFunc, {
      _default: `${THIS},firstName,${GET},${THIS},lastName,${GET},${CONCAT}` as EasyScript<() => string>
    }),
  })

  S.createMixin(contact.mixin.User, contact.class.Person, {
    account: S.attrUI(core.class.Type, {}, {
      label: 'Аккаунт' as IntlString
    }),
    displayName: S.attrUI(core.class.Type, {}, {
      label: 'Погоняло' as IntlString
    })
  })

  S.mixin(contact.class.Person as Ref<Class<Person>>, presentation.class.DetailForm, {
    component: contact.component.PersonProperties
  })

  S.mixin(contact.mixin.User, presentation.class.LookupForm, {
    component: contact.component.UserLookup
  })

  S.createDocument(workbench.class.WorkbenchCreateItem, {
    label: 'Контакт / Новый Пользователь' as StringProperty,
    icon: contact.icon.Phone,
    itemClass: contact.mixin.User as Ref<Class<VDoc>> // TODO: fix itemClass type
  })

}
