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

import { Class, CoreProtocol, Doc, DocumentQuery, Emb, FindOptions, Ref, Storage, TxContext, Tx } from '@anticrm/core'
import { CollectionId } from '@anticrm/domains'

export class Cache implements Storage {
  private readonly coreProtocol: CoreProtocol

  constructor (coreProtocol: CoreProtocol) {
    this.coreProtocol = coreProtocol
  }

  async find<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): Promise<T[]> {
    return await this.coreProtocol.find<T>(_class, query, options)
  }

  async findIn <T extends Doc, C extends Emb>(
    _class: Ref<Class<T>>, _id: Ref<Doc>, _collection: CollectionId<T>,
    _itemClass: Ref<Class<C>>, query: DocumentQuery<C>,
    options?: FindOptions<C>): Promise<C[]> {
    return await this.coreProtocol.findIn<T, C>(_class, _id, _collection, _itemClass, query, options)
  }

  async findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
    return await this.coreProtocol.findOne<T>(_class, query)
  }

  async tx (ctx: TxContext, tx: Tx): Promise<any> {
    // Not implemented yet.
  }
}
