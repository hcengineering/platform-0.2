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
import { Ref, Doc, Property } from '@anticrm/platform-core'

export interface Account extends Doc {
  id: Property<string>
}

export interface BusinessObject extends Doc {
  createdOn: Property<Date>
  createdBy: Ref<Account>
}

export default plugin('business' as Plugin<Service>, {}, {
})
