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

import { Ref, Class } from '@anticrm/platform'
import { UIBuilder } from '@anticrm/presentation-model'
import workbench from '@anticrm/workbench-model'
import { Property, StringProperty, THIS, GET, EasyScript } from '@anticrm/platform'
import core from '@anticrm/platform-model'
import contact from '@anticrm/contact-model'
import { Person } from '@anticrm/contact'
import { Message, Page } from '@anticrm/chunter'

import chunter, { ChunterDomain } from '.'
import { IntlString } from '@anticrm/platform-i18n'
import presentation, { ClassUI } from '@anticrm/presentation-core'

export default (S: UIBuilder) => {

  S.createDocument(workbench.class.Application, {
    label: 'Chunter' as StringProperty,
    icon: chunter.icon.Chunter,
    main: chunter.component.ChunterView,
    appClass: chunter.class.Message
  }, chunter.application.Chunter)

  S.createClassUI(chunter.class.Message, core.class.VDoc, {
    _domain: ChunterDomain.Chunter as Property<string, string>,
    label: 'Сообщение' as IntlString
  }, {
    message: S.attrUI(core.class.Type, {}, {
      label: 'Сообщение' as IntlString,
      icon: chunter.icon.Chunter
    }),
    comments: S.attrUI(core.class.Type, {}, {
      label: 'Комментарии' as IntlString,
      icon: chunter.icon.Chunter
    }),
  })

  S.createClassUI(chunter.class.Page as unknown as Ref<ClassUI<Page>>, chunter.class.Message, {
    _domain: ChunterDomain.Chunter as Property<string, string>,
    label: 'Страница' as IntlString
  }, {
    title: S.attrUI(core.class.Type, {}, {
      label: 'Название' as IntlString,
      icon: chunter.icon.Chunter
    }),
  })

  S.createMixin(chunter.mixin.ChunterInfo, core.class.Class, {
    component: S.attr(core.class.Type, {})
  })

  S.mixin(contact.class.Person as Ref<Class<Person>>, chunter.mixin.ChunterInfo, { // TODO: type problems
    component: chunter.component.ContactInfo
  })

  S.mixin(chunter.class.Message as Ref<Class<Message>>, chunter.mixin.ChunterInfo, { // TODO: type problems
    component: chunter.component.MessageInfo
  })

  S.createDocument(workbench.class.WorkbenchCreateItem, {
    label: 'Chunter / Страница' as StringProperty,
    icon: contact.icon.Phone,
    itemClass: chunter.class.Page
  })

  S.mixin(chunter.class.Page, presentation.class.DetailForm, {
    component: chunter.component.PageProperties
  })

}
