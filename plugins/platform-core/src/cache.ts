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

import { AnyLayout, Class, CoreProtocol, Doc, Domain, QueryResult, Ref } from '@anticrm/core'

export class Cache implements Domain {

  private coreProtocol: CoreProtocol

  constructor(coreProtocol: CoreProtocol) {
    this.coreProtocol = coreProtocol
  }

  find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
    return this.coreProtocol.find(_class, query) as Promise<T[]>
  }

  query<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): QueryResult<T> {
    return {
      subscribe: (cb: (result: T[]) => void) => {
        this.find(_class, query).then(result => { cb(result) })
        return () => { }
      }
    }
  }
}