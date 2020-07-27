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

import { plugin, Plugin, Service } from '@anticrm/platform'
import { Property, Ref, Emb, Class } from '@anticrm/platform-core'
import { BusinessObject, User, Account } from '@anticrm/platform-business'
import { AnyComponent } from '@anticrm/platform-ui'

interface Message {
  onBehalfOf: Ref<User>
  createdOn: Property<Date>
  createdBy: Ref<Account>
  text: Property<string>
}

export interface EmbMessage extends Emb, Message { }

export interface Channel extends BusinessObject {

}

export interface DocMessage extends BusinessObject, Message {
  channel: Ref<Channel>
  participants: Ref<User>[]
  replies: EmbMessage[]
}

export default plugin('chunter' as Plugin<Service>, {}, {
  class: {
    DocMessage: '' as Ref<Class<DocMessage>>
  },
  component: {
    Chunter: '' as AnyComponent
  }
})
