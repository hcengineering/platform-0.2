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

import { inject } from 'vue'
import { DateProperty, Emb, plugin, Plugin, Service, StringProperty, VDoc, Ref, Mixin, Class } from '@anticrm/platform'
import { AnyComponent, Asset } from '@anticrm/platform-ui'
import contact from '@anticrm/contact'
import core from '@anticrm/platform-core'
import ui from '@anticrm/platform-ui'
import { ComponentExtension, ClassUI } from '@anticrm/presentation-core'

// P E R S I S T E N C E  M O D E L

export interface Comment extends Emb {
  _createdOn: DateProperty
  _createdBy: StringProperty
  _modifiedOn?: DateProperty
  message: string
}

export interface Message extends VDoc {
  message: string
  comments: Comment[]
}

export interface Page extends Message {
  title: string
}

// R U N T I M E  M O D E L

export enum MessageElementKind {
  TEXT = 0,
  LINK = 1
}

export interface MessageElement {
  kind: MessageElementKind
  text: string
}

export interface MessageText extends MessageElement {
}

export interface MessageLink extends MessageElement {
  _class: Ref<Class<VDoc>>
  _id: Ref<VDoc>
}

// P L U G I N

export interface ChunterService extends Service {
  parseMessage (message: string): MessageElement[]
  createMissedObjects (message: string): string
}

export const ChunterServiceInjectionKey = 'chunter-injection-key'

export function getChunterService (): ChunterService {
  return inject(ChunterServiceInjectionKey) as ChunterService
}

export default plugin('chunter' as Plugin<ChunterService>, { core: core.id, ui: ui.id, contact: contact.id }, {
  icon: {
    Chunter: '' as Asset,
  },
  component: {
    ChunterView: '' as AnyComponent,
    PageInfo: '' as AnyComponent,
    ContactInfo: '' as AnyComponent,
    MessageInfo: '' as AnyComponent,
    PageProperties: '' as AnyComponent,
  },
  mixin: {
    ChunterInfo: '' as Ref<Mixin<ComponentExtension<VDoc>>>,
  },
  class: {
    Message: '' as Ref<ClassUI<Message>>,
    Page: '' as Ref<Class<Page>>
  }

})
