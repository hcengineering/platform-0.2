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

import { Class, CoreProtocol, Doc, DocumentQuery, FindOptions, Ref, Storage, TxContext } from '@anticrm/core'
import { TxOperation } from '@anticrm/domains'

export class Cache implements Storage {
  async store (tx: TxContext, doc: Doc): Promise<void> {  // eslint-disable-line
  }

  async update (tx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, operations: TxOperation[]): Promise<void> { // eslint-disable-line
  }

  async remove (tx: TxContext, _class: Ref<Class<Doc>>, doc: Ref<Doc>): Promise<void> { // eslint-disable-line
  }

  private readonly coreProtocol: CoreProtocol

  constructor (coreProtocol: CoreProtocol) {
    this.coreProtocol = coreProtocol
  }

  async find<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): Promise<T[]> {
    return await this.coreProtocol.find<T>(_class, query, options)
  }

  async findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
    return await this.coreProtocol.findOne<T>(_class, query)
  }
}
