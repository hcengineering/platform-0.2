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

import core, { Builder, ModelClass, ModelMixin, Prop } from '@anticrm/platform-model'
import { UX } from '@anticrm/presentation-model'

import workbench from '@anticrm/workbench-model'
import { Property, StringProperty, THIS, GET, EasyScript } from '@anticrm/platform'
import contact from '@anticrm/contact-model'
import { Person } from '@anticrm/contact'
import { Message, Page, Comment } from '@anticrm/chunter'

import chunter, { ChunterDomain } from '.'
import { IntlString } from '@anticrm/platform-i18n'
import presentation from '@anticrm/presentation-core'

import { TVDoc } from '@anticrm/platform-model/src/model'

@ModelClass(chunter.class.Message, core.class.VDoc, ChunterDomain.Chunter)
@UX('Сообщение' as IntlString)
class TMessage extends TVDoc implements Message {
  @Prop() @UX('Сообщение' as IntlString, chunter.icon.Chunter) message!: string
  @Prop() @UX('Комментарии' as IntlString, chunter.icon.Chunter) comments?: Comment[]
}

@ModelClass(chunter.class.Page, chunter.class.Message)
@UX('Страница' as IntlString)
class TPage extends TMessage implements Page {
  @Prop() @UX('Название' as IntlString, chunter.icon.Chunter) title!: string
}

export default (S: Builder) => {

  S.add(TMessage, TPage)

  S.createDocument(workbench.class.Application, {
    label: 'Chunter' as StringProperty,
    icon: chunter.icon.Chunter,
    main: chunter.component.ChunterView,
    appClass: chunter.class.Message
  }, chunter.application.Chunter)

  S.createMixin(chunter.mixin.ChunterInfo, core.class.Class, {
    component: S.attr(core.class.Type, {})
  })

  S.mixin(chunter.class.Page, chunter.mixin.ChunterInfo, {
    component: chunter.component.PageInfo
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
