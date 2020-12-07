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

import { AnyLayout, Doc, Ref, Class, Tx, Index, TxContext } from './core'

export interface DocumentProtocol {
  find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]>
  findOne<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T | undefined>
  loadDomain (domain: string, index?: string, direction?: string): Promise<Doc[]>
}

export interface CoreProtocol extends DocumentProtocol {
  tx (tx: Tx): Promise<any>
}

export class TxProcessor {
  private indices: Index[]

  constructor (indices: Index[]) {
    this.indices = indices
  }

  process (ctx: TxContext, tx: Tx): Promise<any> {
    return Promise.all(this.indices.map(index => index.tx(ctx, tx)))
  }
}
