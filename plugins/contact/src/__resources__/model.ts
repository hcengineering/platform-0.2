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

import contact from '.'
import core from '@anticrm/platform-core/src/__model__'
import { Contact, Person } from '..'
import { Doc } from '@anticrm/platform-core'
import Builder from '@anticrm/platform-core/src/__model__/builder'

export default async (S: Builder) => [

  S.createStruct(contact.class.Email, core.class.Type, {}),
  S.createStruct(contact.class.Phone, core.class.Type, {}),

  S.createClass<Contact, Doc>({
    _id: contact.class.Contact,
    _extends: core.class.Doc,
    _attributes: {
      email: S.newInstance(contact.class.Email, {}),
      phone: S.newInstance(contact.class.Phone, {})
    }
  }),

  S.createClass<Person, Contact>({
    _id: contact.class.Person,
    _extends: contact.class.Contact,
    _attributes: {
      firstName: S.newInstance(core.class.Type, {}),
      lastName: S.newInstance(core.class.Type, {}),
      birthDate: S.newInstance(core.class.Type, {}),
    }
  }),

  S.decorateClass(contact.class.Email, { icon: contact.icon.Email }),
  S.decorateClass(contact.class.Phone, { icon: contact.icon.Phone }),
  S.decorateClass(contact.class.Twitter, { icon: contact.icon.Twitter }),
  S.decorateClass(contact.class.Address, { icon: contact.icon.Address }),

  S.decorateClass(contact.class.Contact, {
    decorators: { phone: await S.typeDeco({ placeholder: '+7 913 333 5555' as any }) }
  })

]


