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

import { Class, Doc, DocumentValue, Model, Ref, Tx } from '@anticrm/core'
import {
  CORE_CLASS_OBJECTTX_DETAILS, CORE_CLASS_SPACE, CORE_CLASS_TX_OPERATION, CORE_CLASS_VDOC, CORE_MIXIN_SHORTID, ObjectTx, ObjectTxDetails, OperationProtocol, Space,
  txBuilder, TxBuilder, TxOperation, TxOperationKind, UpdateTx
} from '@anticrm/domains'
import { newCreateTx, newDeleteTx, newUpdateTx } from './tx'

function getSpace (model: Model, doc: Doc): { _objectSpace: Ref<Space> | undefined, spaceIsRequired: boolean } {
  if (model.is(doc._class, CORE_CLASS_SPACE)) {
    return { _objectSpace: doc._id as Ref<Space>, spaceIsRequired: true }
  }
  const isVDoc = model.is(doc._class, CORE_CLASS_VDOC)
  return { _objectSpace: isVDoc ? (doc as any)._space as Ref<Space> : undefined, spaceIsRequired: isVDoc }
}

export function createOperations (model: Model, processTx: (tx: Tx) => Promise<any>, userId: string): OperationProtocol {
  async function create<T extends Doc> (_class: Ref<Class<T>>, values: DocumentValue<T>): Promise<T> {
    const clazz = model.get(_class)
    if (clazz === undefined) {
      return await Promise.reject(new Error('Class ' + _class + ' not found'))
    }

    const doc = model.createDocument(_class, values)

    const { _objectSpace, spaceIsRequired } = getSpace(model, doc)
    if ((_objectSpace === undefined) && spaceIsRequired) {
      throw new Error('Every VDoc based object should contain _space property')
    }
    const tx = newCreateTx(doc, userId, _objectSpace)
    fillUpdateDetails(doc, tx)

    await processTx(tx)
    return doc
  }

  async function updateWith<T extends Doc> (doc: T, builder: (s: TxBuilder<T>) => TxOperation | TxOperation[]): Promise<T> {
    const b = txBuilder<T>(doc._class as Ref<Class<T>>)
    const op = builder(b)

    const { _objectSpace, spaceIsRequired } = getSpace(model, doc)
    if ((_objectSpace === undefined) && spaceIsRequired) {
      throw new Error('Every VDoc based object should contain _space property')
    }

    const tx: UpdateTx = newUpdateTx(doc._class, doc._id, (op instanceof Array) ? op : [op], userId, _objectSpace)

    fillUpdateDetails(doc, tx)
    await processTx(tx)
    return doc
  }

  function fillUpdateDetails<T extends Doc> (doc: T, tx: ObjectTx): void {
    // Extract some details
    const details: ObjectTxDetails = { _class: CORE_CLASS_OBJECTTX_DETAILS }

    // Fill primary field
    const primary = model.getPrimaryKey(doc._class)
    if (primary !== undefined) {
      const title = (doc as any)[primary]
      if (title !== undefined) {
        details.name = title
      }
    }
    // Fill short Id.
    model.asMixin(doc, CORE_MIXIN_SHORTID, (id) => {
      details.id = id.shortId
    })

    if (Object.keys(details).length > 0) {
      tx._txDetails = details
    }
  }

  async function update<T extends Doc> (doc: T, value: Partial<Omit<T, keyof Doc>>): Promise<T> {
    const { _objectSpace, spaceIsRequired } = getSpace(model, doc)
    if ((_objectSpace === undefined) && spaceIsRequired) {
      throw new Error('Every VDoc based object should contain _space property')
    }

    const txOp: TxOperation = {
      _class: CORE_CLASS_TX_OPERATION,
      kind: TxOperationKind.Set,
      _attributes: value
    }
    const tx = newUpdateTx(doc._class, doc._id, [txOp], userId, _objectSpace)

    fillUpdateDetails(doc, tx)

    await processTx(tx)
    return doc
  }

  async function remove<T extends Doc> (doc: T): Promise<T> {
    const { _objectSpace, spaceIsRequired } = getSpace(model, doc)
    if ((_objectSpace === null) && spaceIsRequired) {
      throw new Error('Every VDoc based object should contain _space property')
    }

    const tx = newDeleteTx(doc._class, doc._id, userId, _objectSpace)
    fillUpdateDetails(doc, tx)
    await processTx(tx)
    return doc
  }

  return {
    create,
    update,
    updateWith,
    remove
  }
}
