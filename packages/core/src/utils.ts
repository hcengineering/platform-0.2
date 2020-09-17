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

import { AnyLayout, Doc, Ref, Class, Tx, Index, Storage } from './core'

export interface CoreProtocol {
  find (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc[]>
  findOne (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc | undefined>
  tx (tx: Tx): Promise<void>
  loadDomain (domain: string, index?: string, direction?: string): Promise<Doc[]>
}

export class TxProcessor {
  private indices: Index[]

  constructor (indices: Index[]) {
    this.indices = indices
  }

  process (tx: Tx): Promise<any> {
    return Promise.all(this.indices.map(index => index.tx(tx)))
  }

}
