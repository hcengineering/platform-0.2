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

import core, { Builder, Class$, Primary, Prop, ArrayOf$, InstanceOf$, extendIds, Mixin$ } from '@anticrm/model'
import { UX } from '@anticrm/presentation/src/__model__'

import workbench from '@anticrm/workbench/src/__model__'
import _chunter, { Message, Page, Comment, Collab } from '.'

import { IntlString } from '@anticrm/platform-i18n'
import presentation, { ComponentExtension } from '@anticrm/presentation'

import { TEmb, TMixin, TVDoc } from '@anticrm/model/src/__model__'
import { Application, VDoc, Ref, Class, Property } from '@anticrm/core'

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

@Class$(chunter.class.Collab, core.class.VDoc)
@UX('Collaboration' as IntlString)
class TCollab extends TVDoc implements Collab {
  @ArrayOf$()
  @InstanceOf$(chunter.class.Comment)
  @UX('Комментарии' as IntlString, chunter.icon.Chunter) comments?: Comment[]
}

@Class$(chunter.class.Comment, core.class.Emb)
@UX('Комментарий' as IntlString)
class TComment extends TEmb implements Comment {
  @Prop() _createdBy!: Property<string, string>
  @Prop() _createdOn!: Property<number, Date>

  @UX('Сообщение' as IntlString, chunter.icon.Chunter)
  @Prop(core.class.String) message!: string
}

@Class$(chunter.class.Message, chunter.class.Collab, ChunterDomain.Chunter)
@UX('Сообщение' as IntlString)
class TMessage extends TVDoc implements Message {
  @UX('Сообщение' as IntlString, chunter.icon.Chunter)
  @Prop(core.class.String)
  message!: string
}

@Class$(chunter.class.Page, chunter.class.Collab, ChunterDomain.Chunter)
@UX('Страница' as IntlString)
class TPage extends TMessage implements Page {
  @Prop() @UX('Название' as IntlString, chunter.icon.Chunter) @Primary() title!: string
}

@Mixin$(chunter.mixin.ActivityInfo, core.class.Mixin)
class TActivityInfo extends TMixin<VDoc> implements ComponentExtension<VDoc> {
  @Prop() component!: any
}

export function model (S: Builder): void {
  S.add(TCollab, TMessage, TComment, TPage, TActivityInfo)

  S.mixin(chunter.class.Message, chunter.mixin.ActivityInfo, {
    component: chunter.component.MessageInfo
  })

  S.createDocument(workbench.class.WorkbenchApplication, {
    label: 'Страницы' as IntlString,
    icon: workbench.icon.DefaultPerspective,
    component: workbench.component.Application,
    classes: [chunter.class.Page]
  })

  S.mixin(chunter.class.Page, presentation.class.DetailForm, {
    component: chunter.component.PageProperties
  })

  S.mixin(chunter.class.Page, chunter.mixin.ActivityInfo, {
    component: chunter.component.PageInfo
  })

  S.mixin(core.class.Space, chunter.mixin.ActivityInfo, {
    component: chunter.component.SpaceInfo
  })
}
