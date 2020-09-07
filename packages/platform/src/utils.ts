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

import { core, AnyLayout, Doc, Ref, Class, Tx, CreateTx, VDoc, ClassifierKind, Obj, Mixin, UpdateTx, PushTx } from './core'
import { MemDb } from './memdb'
import { Node } from './graph'

export interface CoreProtocol {
  find (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc[]>
  findOne (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc | undefined>
  tx (tx: Tx): Promise<void>
  loadDomain (domain: string, index?: string, direction?: string): Promise<Doc[]>

  loadGraph (): Promise<Node[]>
}

// U T I L S

export abstract class TxProcessor {

  protected modelDb: MemDb

  constructor(modelDb: MemDb) {
    this.modelDb = modelDb
  }

  private createTx2VDoc (create: CreateTx): VDoc {
    const doc: VDoc = {
      _space: create._space,
      _class: create._objectClass,
      _id: create._objectId,
      _createdBy: create._user,
      _createdOn: create._date,
      ...create._attributes
    }
    let _class = create._objectClass
    while (true) {
      const clazz = this.modelDb.get(_class) as Class<Obj>
      if (clazz._kind === ClassifierKind.MIXIN) {
        if (doc._mixins) {
          doc._mixins.push(_class as Ref<Mixin<Doc>>)
        } else {
          doc._mixins = [_class as Ref<Mixin<Doc>>]
        }
        _class = clazz._extends as Ref<Class<VDoc>>
      } else {
        doc._class = _class
        break
      }
    }
    return doc
  }

  protected abstract store (doc: Doc): Promise<void>
  protected abstract push (_class: Ref<Class<Doc>>, _id: Ref<Doc>, attribute: string, attributes: any): Promise<void>
  protected abstract update (_class: Ref<Class<Doc>>, _id: Ref<Doc>, attributes: any): Promise<void>
  protected abstract remove (_class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<void>

  private apply (tx: Tx): Promise<void> {
    const _class = tx._class
    switch (_class) {
      case core.class.CreateTx: {
        const doc = this.createTx2VDoc(tx as CreateTx)
        return this.store(doc)
      }
      case core.class.PushTx: {
        return this.push(tx._objectClass, tx._objectId, (tx as PushTx)._attribute, (tx as PushTx)._attributes)
      }
      case core.class.UpdateTx: {
        return this.update(tx._objectClass, tx._objectId, (tx as UpdateTx)._attributes)
      }
      case core.class.DeleteTx: {
        return this.remove(tx._objectClass, tx._objectId)
      }
      default:
        throw new Error('not implemented (apply tx)')
    }
  }

  process (tx: Tx): Promise<void> {
    return Promise.all([this.store(tx), this.apply(tx)]) as unknown as Promise<void>
  }

}
