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

import { Ref, Class, Type } from '@anticrm/platform-core'
import { extendIds } from '@anticrm/platform-core/src/__resources__/utils'
import { Asset } from '@anticrm/platform-ui'
import { IntlString } from '@anticrm/platform-core-i18n'

import contact from '..'

export default extendIds(contact, {
  class: {
    Email: '' as Ref<Class<Type<string>>>,
    Phone: '' as Ref<Class<Type<string>>>,
    Twitter: '' as Ref<Class<Type<string>>>,
    Address: '' as Ref<Class<Type<string>>>,
  },
  icon: {
    Email: '' as Asset,
    Phone: '' as Asset,
    Twitter: '' as Asset,
    Address: '' as Asset,
  },
  string: {
    Email: '' as IntlString,
    Phone: '' as IntlString,
    Twitter: '' as IntlString,
    Address: '' as IntlString,

    Email_placeholder: '' as IntlString,
    Phone_placeholder: '' as IntlString,
    Twitter_placeholder: '' as IntlString,
    Address_placeholder: '' as IntlString,
  }
})
