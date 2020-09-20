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

import { Application, Ref, Class, StringProperty } from '@anticrm/core'

import { extendIds, Builder, ModelClass, Primary, Prop, Text } from '@anticrm/model'
import { UX } from '@anticrm/presentation/src/__model__'

import workbench from '@anticrm/workbench/src/__model__'
import contact from '@anticrm/contact/src/__model__'
import { Person } from '@anticrm/contact'
import _chunter, { Message, Page, Comment, Collab } from '.'

import { IntlString } from '@anticrm/platform-i18n'
import presentation from '@anticrm/presentation'

import core, { TVDoc } from '@anticrm/platform-core/src/__model__'

export enum ChunterDomain {
  Chunter = 'chunter'
}

const chunter = extendIds(_chunter, {
  application: {
    Chunter: '' as Ref<Application>
  },
  class: {
    Collab: '' as Ref<Class<Collab>>
  }
})

export default chunter

@ModelClass(chunter.class.Collab, core.class.VDoc)
@UX('Collaboration' as IntlString)
class TCollab extends TVDoc implements Collab {
  @Prop() @UX('Комментарии' as IntlString, chunter.icon.Chunter) comments?: Comment[]
}

@ModelClass(chunter.class.Message, chunter.class.Collab, ChunterDomain.Chunter)
@UX('Сообщение' as IntlString)
class TMessage extends TVDoc implements Message {
  @Text() @UX('Сообщение' as IntlString, chunter.icon.Chunter) message!: string
}

@ModelClass(chunter.class.Page, chunter.class.Collab, ChunterDomain.Chunter)
@UX('Страница' as IntlString)
class TPage extends TMessage implements Page {
  @Prop() @UX('Название' as IntlString, chunter.icon.Chunter) @Primary() title!: string
}

export function model (S: Builder) {
  S.add(TCollab, TMessage, TPage)

  // S.createDocument(workbench.class.Application, {
  //   label: 'Chunter' as StringProperty,
  //   icon: chunter.icon.Chunter,
  //   main: chunter.component.ChunterView,
  //   appClass: chunter.class.Message
  // }, chunter.application.Chunter)

  S.createMixin(chunter.mixin.ActivityInfo, core.class.Class, {
    component: S.attr(core.class.Type, {})
  })

  // S.mixin(chunter.class.Page, chunter.mixin.ChunterInfo, {
  //   component: chunter.component.PageInfo
  // })

  // S.mixin(contact.class.Person as Ref<Class<Person>>, chunter.mixin.ChunterInfo, { // TODO: type problems
  //   component: chunter.component.ContactInfo
  // })

  // S.mixin(chunter.class.Message as Ref<Class<Message>>, chunter.mixin.ChunterInfo, { // TODO: type problems
  //   component: chunter.component.MessageInfo
  // })

  // S.createDocument(workbench.class.WorkbenchCreateItem, {
  //   label: 'Chunter / Страница' as StringProperty,
  //   icon: contact.icon.Phone,
  //   itemClass: chunter.class.Page
  // })

  // S.mixin(chunter.class.Page, presentation.class.DetailForm, {
  //   component: chunter.component.PageProperties
  // })
}
