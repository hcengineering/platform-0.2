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

import { AnyLayout, Class, Doc, generateId, Model, Ref, StringProperty, Tx } from '@anticrm/core'
import { OperationProtocol } from '.'
import { newCreateTx, newDeleteTx, newPushTx, newUpdateTx } from './tx'

export function createOperations (model: Model, processTx: (tx: Tx) => Promise<any>, getUserId: () => StringProperty): OperationProtocol {
  function create<T extends Doc> (_class: Ref<Class<T>>, values: AnyLayout | Doc): Promise<T> {
    const clazz = model.get(_class)
    if (clazz === undefined) {
      return Promise.reject(new Error('Class ' + _class + ' not found'))
    }

    const doc = model.newDoc(_class, generateId(), (values as unknown) as AnyLayout)
    return processTx(newCreateTx(doc, getUserId())).then(() => doc)
  }

  function push<T extends Doc> (doc: Doc, query: AnyLayout | null, _attribute: StringProperty, element: AnyLayout | Doc): Promise<T> {
    return processTx(
      newPushTx(doc._class, doc._id, query || undefined, _attribute, (element as unknown) as AnyLayout, getUserId())
    ).then(() => doc as T)
  }

  function update<T extends Doc> (doc: T, query: AnyLayout | null, values: AnyLayout): Promise<T> {
    return processTx(
      newUpdateTx(doc._class, doc._id, query || undefined, values, getUserId())
    ).then(() => doc as T)
  }

  function remove<T extends Doc> (doc: T, query: AnyLayout | null): Promise<T> {
    return processTx(
      newDeleteTx(doc._class, doc._id, query || undefined, getUserId())
    ).then(() => doc as T)
  }

  return {
    create,
    push,
    update,
    remove
  }
}
