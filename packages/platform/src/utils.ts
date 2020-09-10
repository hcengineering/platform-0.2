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

import { core, AnyLayout, Doc, Ref, Class, Tx, CreateTx, VDoc, ClassifierKind, Obj, Mixin, UpdateTx, PushTx, Classifier, Title } from './core'
import { MemDb } from './memdb'

export interface CoreProtocol {
  find (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc[]>
  findOne (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc | undefined>
  tx (tx: Tx): Promise<void>
  loadDomain (domain: string, index?: string, direction?: string): Promise<Doc[]>
}

export interface Index {
  onCreate (create: CreateTx): Promise<any>
  onPush (push: PushTx): Promise<any>
}

export interface Storage {
  store (doc: Doc): Promise<void>
  push (_class: Ref<Class<Doc>>, _id: Ref<Doc>, attribute: string, attributes: any): Promise<void>
  update (_class: Ref<Class<Doc>>, _id: Ref<Doc>, attributes: any): Promise<void>
  remove (_class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<void>
}

// U T I L S

export class TxProcessor {

  protected modelDb: MemDb
  private indices: Index[]

  constructor(modelDb: MemDb, indices: Index[]) {
    this.modelDb = modelDb
    this.indices = indices
  }

  process (tx: Tx): Promise<any> {
    const _class = tx._class
    switch (_class) {
      case core.class.CreateTx: {
        return Promise.all(
          this.indices.map(index => index.onCreate(tx as CreateTx))
        )
      }
      case core.class.PushTx: {
        return Promise.all(
          this.indices.map(index => index.onPush(tx as PushTx))
        )
        // return this.push(tx._objectClass, tx._objectId, (tx as PushTx)._attribute, (tx as PushTx)._attributes)
      }
      case core.class.UpdateTx: {
        throw new Error('not implemented (apply tx)')
        // return this.update(tx._objectClass, tx._objectId, (tx as UpdateTx)._attributes)
      }
      case core.class.DeleteTx: {
        throw new Error('not implemented (apply tx)')
        // return this.remove(tx._objectClass, tx._objectId)
      }
      default:
        throw new Error('not implemented (apply tx)')
    }
  }

}
