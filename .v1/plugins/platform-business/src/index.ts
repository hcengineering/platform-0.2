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

import { plugin, Plugin, Service, Resource } from '@anticrm/platform'
import { Ref, Doc, Property, Session, Class, Values, Instance } from '@anticrm/platform-core'

export interface User extends Doc {
}

export interface Account extends Doc {
  id: Property<string>
  user: Ref<User>
}

export interface BusinessObject extends Doc {
  createdOn: Property<Date>
  createdBy: Ref<Account>
  onBehalfOf: Ref<User>

  getText?: Property<Promise<() => string>>
  getImage?: Property<Promise<() => Resource<string>>>
}

export interface BusinessService extends Service {
  newBusinessObject<B extends BusinessObject> (session: Session, _class: Ref<Class<B>>, values: Values<Omit<B, keyof BusinessObject>>, _id?: Ref<B>): Promise<Instance<B>>
}

export default plugin('business' as Plugin<BusinessService>, {}, {
  method: {
    BusinessObject_getText: '' as Resource<() => Promise<string | undefined>>,
    BusinessObject_getImage: '' as Resource<() => Promise<Resource<string> | undefined>>,
  }
})
