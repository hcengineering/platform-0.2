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

import { Class, Doc, Model, Ref, StringProperty, Tx } from '@anticrm/core'
import { OperationProtocol } from '.'
import { newCreateTx, newDeleteTx, newUpdateTx } from './tx'
import { txBuilder, TxBuilder, TxOperation, TxOperationKind } from '@anticrm/domains'

export function createOperations (model: Model, processTx: (tx: Tx) => Promise<any>, getUserId: () => StringProperty): OperationProtocol {
  async function create<T extends Doc> (_class: Ref<Class<T>>, values: Partial<T>): Promise<T> {
    const clazz = model.get(_class)
    if (clazz === undefined) {
      return Promise.reject(new Error('Class ' + _class + ' not found'))
    }

    const doc = model.createDocument<T>(_class, values)
    await processTx(newCreateTx(doc, getUserId()))
    return doc
  }

  function updateWith<T extends Doc> (doc: T, builder: (s: TxBuilder<T>) => TxOperation | TxOperation[]): Promise<T> {
    const b = txBuilder<T>(doc._class as Ref<Class<T>>)
    const op = builder(b)
    return processTx(
      newUpdateTx(doc._class, doc._id, (op instanceof Array) ? op : [op], getUserId())
    ).then(() => doc as T)
  }

  function update<T extends Doc> (doc: T, value: Partial<Omit<T, keyof Doc>>): Promise<T> {
    return processTx(
      newUpdateTx(doc._class, doc._id, [{ kind: TxOperationKind.Set, _attributes: value } as TxOperation], getUserId())
    ).then(() => doc as T)
  }

  function remove<T extends Doc> (doc: T): Promise<T> {
    return processTx(
      newDeleteTx(doc._class, doc._id, getUserId())
    ).then(() => doc as T)
  }

  return {
    create,
    update,
    updateWith,
    remove
  }
}
