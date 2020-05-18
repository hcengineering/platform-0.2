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
import core from '@anticrm/platform-core/src/__resources__'

import UIBuilder from '@anticrm/platform-ui-model/src/__resources__/builder'

export default async (S: UIBuilder) => {

  const email = await S.createStruct(contact.class.Email, core.class.Type, {})
  const phone = await S.createStruct(contact.class.Phone, core.class.Type, {})
  const twitter = await S.createStruct(contact.class.Twitter, core.class.Type, {})
  const address = await S.createStruct(contact.class.Address, core.class.Type, {})

  return Promise.all([
    S.createClass(contact.class.Contact, core.class.Doc, {
      email: await email.newInstance({}),
      phone: await phone.newInstance({}),
      phoneWork: await phone.newInstance({}),
      twitter: await twitter.newInstance({}),
      address: await address.newInstance({}),
      addressDelivery: await address.newInstance({}),
    }),

    S.createClass(contact.class.Person, contact.class.Contact, {
      firstName: await S.string(),
      lastName: await S.string(),
      birthDate: await S.string(),
    }),

    S.decorateClass(contact.class.Email, { icon: contact.icon.Email }),
    S.decorateClass(contact.class.Phone, { icon: contact.icon.Phone }),
    S.decorateClass(contact.class.Twitter, { icon: contact.icon.Twitter }),
    S.decorateClass(contact.class.Address, { icon: contact.icon.Address }),

    S.decorateClass(contact.class.Contact, {
      decorators: { phone: await S.typeDeco({ placeholder: '+7 913 333 5555' as any }) }
    })

  ])

}

