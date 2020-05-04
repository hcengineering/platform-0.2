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
import { _class, ref, intl, bag, instance, extension, Attibutes } from '@anticrm/platform-core/src/__model__/dsl'

export default {
  model: [
    _class(contact.class.Email, core.class.Type, {
      attributes: {}
    }),
    _class(contact.class.Phone, core.class.Type, {
      attributes: {}
    }),
    _class(contact.class.Twitter, core.class.Type, {
      attributes: {}
    }),
    _class(contact.class.Address, core.class.Type, {
      attributes: {}
    }),

    _class(contact.class.Contact, core.class.Doc, {
      attributes: {
        email: { _class: contact.class.Email },
        phone: { _class: contact.class.Phone },
        phoneWork: { _class: contact.class.Phone },
        twitter: { _class: contact.class.Twitter },
        address: { _class: contact.class.Address },
        addressDelivery: { _class: contact.class.Address },
      }
    })
  ]
}
