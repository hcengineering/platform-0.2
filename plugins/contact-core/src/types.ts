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

import { Doc, id, Ref, Class, Type, AsString } from '@anticrm/platform-core'

export interface Contact extends Doc {
  email?: AsString<string>
  phone?: AsString<string>
  phoneWork?: AsString<string>
  twitter?: AsString<string>
  address?: AsString<string>
  addressDelivery?: AsString<string>
}

export const pluginId = 'contact-core'
export default id(pluginId, {
  class: {
    Contact: '' as Ref<Class<Contact>>,
  }
})
