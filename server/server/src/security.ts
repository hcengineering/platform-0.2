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

import { AnyLayout, Class, Doc, Index, Ref, Tx } from '@anticrm/core'
import { SpaceStorage } from './spaceStorage'

export class SecurityIndex implements Index {
  private storage: SpaceStorage
  private account: string

  constructor (store: SpaceStorage, account: string) {
    this.storage = store
    this.account = account
  }

  tx (tx: Tx): Promise<any> {
    // TODO: throw some kind of SecurityError if the account has no rights to execute the transaction
    return Promise.resolve()
  }

  find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
    // TODO: add security filter to the query
    return this.storage.find(_class, query)
  }
}
