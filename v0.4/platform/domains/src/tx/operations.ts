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
import domains from '..'
import { getPrimaryKey } from '../primary_utils'
import { Space } from '../space'
import { CreateTx, ObjectTx, ObjectTxDetails, txBuilder, TxBuilder, TxOperation, TxOperationKind, UpdateTx } from './'
import { newCreateTx, newDeleteTx, newUpdateTx } from './tx'

function getSpace (model: Model, doc: Doc): { _objectSpace: Ref<Space> | undefined, spaceIsRequired: boolean } {
  if (model.is(doc._class, domains.class.Space)) {
    return { _objectSpace: doc._id as Ref<Space>, spaceIsRequired: true }
  }
  const isVDoc = model.is(doc._class, domains.class.VDoc)
  return { _objectSpace: isVDoc ? (doc as any)._space as Ref<Space> : undefined, spaceIsRequired: isVDoc }
}

/**
 * Construct object create transaction.
 */
export function create<T extends Doc> (model: Model, userId: string, _class: Ref<Class<T>>, values: DocumentValue<T>): CreateTx {
  const clazz = model.get(_class)
  if (clazz === undefined) {
    throw new Error('Class ' + _class + ' not found')
  }

  const doc = model.createDocument(_class, values, values._id)

  const { _objectSpace, spaceIsRequired } = getSpace(model, doc)
  if ((_objectSpace === undefined) && spaceIsRequired) {
    throw new Error('Every VDoc based object should contain _space property')
  }
  const tx = newCreateTx(doc, userId, _objectSpace)
  fillUpdateDetails(model, doc, tx)
  return tx
}

/**
 * Construct object update transaction.
 */
export function updateWith<T extends Doc> (model: Model, userId: string, doc: T, builder: (s: TxBuilder<T>) => TxOperation | TxOperation[]): Tx {
  const b = txBuilder<T>(doc._class as Ref<Class<T>>)
  const op = builder(b)

  const { _objectSpace, spaceIsRequired } = getSpace(model, doc)
  if ((_objectSpace === undefined) && spaceIsRequired) {
    throw new Error('Every VDoc based object should contain _space property')
  }

  const tx: UpdateTx = newUpdateTx(doc._class, doc._id, (op instanceof Array) ? op : [op], userId, _objectSpace)

  fillUpdateDetails(model, doc, tx)
  return tx
}

/**
 * Construct update transaction
 */
export function update<T extends Doc> (model: Model, userId: string, doc: T, value: DocumentValue<T>): Tx {
  const { _objectSpace, spaceIsRequired } = getSpace(model, doc)
  if ((_objectSpace === undefined) && spaceIsRequired) {
    throw new Error('Every VDoc based object should contain _space property')
  }

  const txOp: TxOperation = {
    _class: domains.class.TxOperation,
    kind: TxOperationKind.Set,
    _attributes: value
  }
  const tx = newUpdateTx(doc._class, doc._id, [txOp], userId, _objectSpace)

  fillUpdateDetails(model, doc, tx)
  return tx
}

/**
 * Construct delete transaction
 */
export function remove<T extends Doc> (model: Model, userId: string, doc: T): Tx {
  const { _objectSpace, spaceIsRequired } = getSpace(model, doc)
  if ((_objectSpace === null) && spaceIsRequired) {
    throw new Error('Every VDoc based object should contain _space property')
  }

  const tx = newDeleteTx(doc._class, doc._id, userId, _objectSpace)
  fillUpdateDetails(model, doc, tx)
  return tx
}

function fillUpdateDetails<T extends Doc> (model: Model, doc: T, tx: ObjectTx): void {
  // Fill primary field
  const primary = getPrimaryKey(model, doc._class)
  if (primary !== undefined) {
    const title = (doc as any)[primary]
    if (title !== undefined) {
      model.cast<ObjectTxDetails>(doc, domains.mixin.ObjectTxDetails).name = title
    }
  }
  // Fill short Id.
  model.asMixin(doc, domains.mixin.ShortID, (id) => {
    model.cast<ObjectTxDetails>(doc, domains.mixin.ObjectTxDetails).id = id.shortId
  })
}
