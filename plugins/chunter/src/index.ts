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

import { plugin, Plugin, Service, Metadata } from '@anticrm/platform'
import { Asset, AnyComponent } from '@anticrm/platform-ui'
import {
  DateProperty,
  StringProperty,
  Emb,
  Class,
  Ref,
  VDoc,
  Mixin,
  MessageNode,
} from '@anticrm/core'
import core from '@anticrm/platform-core'
import { ComponentExtension } from '@anticrm/presentation'

// P E R S I S T E N C E  M O D E L

export interface Collab extends VDoc {
  comments?: Comment[]
}

export interface Comment extends Emb {
  _createdOn: DateProperty
  _createdBy: StringProperty
  _modifiedOn?: DateProperty
  message: string
}

export interface Message extends Collab {}

export interface Page extends Collab {
  title: string
}

// P L U G I N

export interface ChunterService extends Service {
  createMissedObjects(doc: MessageNode): string
}

export default plugin(
  'chunter' as Plugin<ChunterService>,
  { core: core.id },
  {
    icon: {
      Chunter: '' as Asset
    },
    class: {
      Message: '' as Ref<Class<Message>>,
      Comment: '' as Ref<Class<Comment>>,
      Page: '' as Ref<Class<Page>>
    },
    component: {
      ActivityView: '' as AnyComponent,
      ChatView: '' as AnyComponent,
      MessageInfo: '' as AnyComponent,
      SpaceInfo: '' as AnyComponent,
      PageProperties: '' as AnyComponent,
      PageInfo: '' as AnyComponent
    },
    mixin: {
      ActivityInfo: '' as Ref<Mixin<ComponentExtension<VDoc>>>
    }
  }
)
