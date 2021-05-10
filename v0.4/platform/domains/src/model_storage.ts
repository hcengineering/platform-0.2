//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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

import { Class, Doc, DocumentQuery, FindOptions, Model, Ref, Storage, Tx, TxContext } from '@anticrm/core'
import domains, { CreateTx, DeleteTx, UpdateTx } from '.'
import { updateDocument } from './tx'

export class ModelStorage implements Storage {
  model: Model
  constructor (model: Model) {
    this.model = model
  }

  async find<T extends Doc> (clazz: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): Promise<T[]> {
    const result = this.model.find(clazz, query, options)

    if (options?.countCallback !== undefined) {
      options.countCallback(options?.skip ?? 0, options?.limit ?? 0, result.length)
    }

    return await Promise.resolve(result)
  }

  async findOne<T extends Doc> (clazz: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
    const result = await Promise.resolve(this.model.find(clazz, query, { limit: 1 }))
    return result.length === 0 ? undefined : result[0]
  }

  async tx (ctx: TxContext, tx: Tx): Promise<any> {
    switch (tx._class) {
      case domains.class.CreateTx: {
        const createTx = tx as CreateTx
        return this.model.add(this.model.createDocument(createTx._objectClass, createTx.object, createTx._objectId))
      }
      case domains.class.UpdateTx: {
        const updateTx = tx as UpdateTx
        return updateDocument(this.model, this.model.get(updateTx._objectId), updateTx.operations)
      }
      case domains.class.DeleteTx: {
        const deleteTx = tx as DeleteTx
        return this.model.del(deleteTx._objectId)
      }

      default:
        console.log('not implemented model tx', tx)
    }
  }
}
