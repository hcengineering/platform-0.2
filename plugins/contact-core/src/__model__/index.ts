//
// Copyright © 2020 Andrey Platov <andrey.v.platov@gmail.com>
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

import contact from './id'
import core from '@anticrm/platform-core/src/__model__/id'

import { Type } from '@anticrm/platform-core'
import { createClass } from '@anticrm/platform-core/src/__model__/'
import { createDocs } from '@anticrm/platform-core/src/__model__/utils'


const model = [
  createClass(contact.class.Email, core.class.Type, {}),
  createClass(contact.class.Phone, core.class.Type, {}),
  createClass(contact.class.Twitter, core.class.Type, {}),
  createClass(contact.class.Address, core.class.Type, {}),

  createClass(contact.class.Contact, core.class.Doc, {
    email: new Type(contact.class.Email),
    phone: new Type(contact.class.Phone),
    phoneWork: new Type(contact.class.Phone),
    twitter: new Type(contact.class.Twitter),
    address: new Type(contact.class.Address),
    addressDelivery: new Type(contact.class.Address),
  })
]

export default {
  events: createDocs(model)
}
