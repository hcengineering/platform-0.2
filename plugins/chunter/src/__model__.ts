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

import core, { ArrayOf$, Builder, Class$, extendIds, InstanceOf$, Primary, Prop } from '@anticrm/model'
import { UX } from '@anticrm/presentation/src/__model__'

import workbench from '@anticrm/workbench/src/__model__'
import _chunter, { Collab, Comment, Message, Page } from '.'

import { IntlString } from '@anticrm/platform-i18n'
import presentation from '@anticrm/presentation'

import { TEmb, TVDoc } from '@anticrm/model/src/__model__'
import { Class, Property, Ref } from '@anticrm/core'
import { WorkbenchApplication } from '@anticrm/workbench'
import activity from '@anticrm/activity'

export enum ChunterDomain {
  Chunter = 'chunter'
}

const chunter = extendIds(_chunter, {
  application: {
    Chunter: '' as Ref<WorkbenchApplication>,
    Chat: '' as Ref<WorkbenchApplication>,
    Pages: '' as Ref<WorkbenchApplication>
  },
  class: {
    Collab: '' as Ref<Class<Collab>>
  }
})

export default chunter

@Class$(chunter.class.Collab, core.class.VDoc)
@UX('Collaboration' as IntlString)
export class TCollab extends TVDoc implements Collab {
  @ArrayOf$()
  @InstanceOf$(chunter.class.Comment)
  @UX('Comments' as IntlString, { icon: chunter.icon.Chunter }) comments?: Comment[]
}

@Class$(chunter.class.Comment, core.class.Emb)
@UX('Comment' as IntlString)
export class TComment extends TEmb implements Comment {
  @Prop() _createdBy!: Property<string, string>
  @Prop() _createdOn!: Property<number, Date>

  @UX('Message' as IntlString, { icon: chunter.icon.Chunter })
  @Prop(core.class.String) message!: string
}

@Class$(chunter.class.Message, chunter.class.Collab, ChunterDomain.Chunter)
@UX('Message' as IntlString)
export class TMessage extends TVDoc implements Message {
  @UX('Message' as IntlString, { icon: chunter.icon.Chunter })
  @Prop(core.class.String)
  message!: string
}

@Class$(chunter.class.Page, chunter.class.Collab, ChunterDomain.Chunter)
@UX('Page' as IntlString)
class TPage extends TMessage implements Page {
  @Prop() @UX('Title' as IntlString, { icon: chunter.icon.Chunter }) @Primary() title!: string
}

export function model (S: Builder): void {
  S.add(TCollab, TMessage, TComment, TPage)

  S.mixin(chunter.class.Message, activity.mixin.ActivityInfo, {
    component: chunter.component.MessageInfo
  })

  S.createDocument(workbench.class.WorkbenchApplication, {
    route: 'chat',
    label: 'Chat' as IntlString,
    icon: chunter.icon.ChatView,
    component: chunter.component.ChatView,
    classes: [],
    spaceTitle: 'Channel',
    supportSpaces: true
  }, chunter.application.Chat)

  S.createDocument(workbench.class.WorkbenchApplication, {
    route: 'pages',
    label: 'Pages' as IntlString,
    icon: chunter.icon.PagesView,
    component: workbench.component.Application,
    classes: [chunter.class.Page],
    spaceTitle: 'Folder',
    supportSpaces: true
  }, chunter.application.Pages)

  S.mixin(chunter.class.Page, presentation.mixin.DetailForm, {
    component: chunter.component.PageProperties
  })

  S.mixin(chunter.class.Page, activity.mixin.ActivityInfo, {
    component: chunter.component.PageInfo
  })

  S.createDocument(workbench.class.ItemCreator, {
    app: chunter.application.Pages,
    class: chunter.class.Page,
    name: 'Page' as IntlString
  })

  S.createDocument(core.class.Space, {
    name: 'General',
    description: 'General channel',
    application: chunter.application.Chat,
    isPublic: true, // Available for all
    archived: false,
    spaceKey: 'GEN',
    users: []
  }, workbench.space.General)

  S.createDocument(core.class.Space, {
    name: 'Other',
    description: 'Other space',
    application: chunter.application.Chat,
    isPublic: true,
    spaceKey: 'OVR',
    archived: false,
    users: []
  }, workbench.space.Random)

  S.createDocument(core.class.Space, {
    name: 'Home',
    description: 'Pages home',
    application: chunter.application.Pages,
    isPublic: true,
    spaceKey: 'RAND',
    archived: false,
    users: []
  }, workbench.space.Other)
}
