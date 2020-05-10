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

import contact from '.'
import core from '@anticrm/platform-core/src/__resources__'

import { Builder } from '@anticrm/platform-ui/src/__resources__/builder'
import { IntlString } from '@anticrm/platform-core-i18n'

export default (S: Builder) => {

  const email = S.createStruct(contact.class.Email, core.class.Type, {})
  const phone = S.createStruct(contact.class.Phone, core.class.Type, {})
  const twitter = S.createStruct(contact.class.Twitter, core.class.Type, {})
  const address = S.createStruct(contact.class.Address, core.class.Type, {})

  const contactClass = S.createClass(contact.class.Contact, core.class.Doc, {
    email: email.newInstance({}),
    phone: phone.newInstance({}),
    phoneWork: phone.newInstance({}),
    twitter: twitter.newInstance({}),
    address: address.newInstance({}),
    addressDelivery: address.newInstance({}),
  })

  S.decorateClass(contact.class.Email, {}, 'Email' as IntlString)

  S.decorateClass(contact.class.Contact, {
    phone: S.typeDeco({ label: 'Телефон' as IntlString })
  })
}

