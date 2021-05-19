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

import { AnyLayout, Class, Doc, DocumentValue, PartialDocumentValue, Emb, generateId, Obj, Ref, Tx } from '@anticrm/core'
import { CollectionId } from '@anticrm/core/src/colletionid'
import { AddItemTx, collectionId, CreateTx, DeleteTx, RemoveItemTx, UpdateItemTx, UpdateTx } from '.'
import core from '..'
import { Space } from '../space'

const EMPTY_USER = '#no_user'

/**
 * Construct object create transaction.
 */
export function create<T extends Doc> (_class: Ref<Class<T>>, attributes: DocumentValue<T>, _id?: Ref<Obj>, _objectSpace?: Ref<Space>): CreateTx {
  // Make a copy.
  const { ...objValue } = attributes

  // remove _space field if defined
  delete (objValue as any)._class
  delete (objValue as any)._space
  delete (objValue as any)._id

  const tx: CreateTx = {
    _class: core.class.CreateTx,
    _id: generateId(),
    _objectSpace,
    _date: Date.now(),
    _user: EMPTY_USER,
    _objectId: _id ?? generateId(),
    _objectClass: _class,
    attributes: objValue as unknown as AnyLayout
  }
  return tx
}

/**
 * Construct update transaction
 */
export function update<T extends Doc> (_class: Ref<Class<Doc>>, _id: Ref<Doc>, attributes: PartialDocumentValue<T>, _objectSpace?: Ref<Space>): Tx {
  const tx: UpdateTx = {
    _class: core.class.UpdateTx,
    _id: generateId(),
    _objectId: _id,
    _objectClass: _class,
    _objectSpace,
    _date: Date.now(),
    _user: EMPTY_USER,
    attributes: attributes as unknown as AnyLayout
  }
  return tx
}

/**
 * Construct delete transaction
 */
export function remove (_class: Ref<Class<Doc>>, _id: Ref<Doc>, _objectSpace?: Ref<Space>): Tx {
  const tx: DeleteTx = {
    _class: core.class.DeleteTx,
    _id: generateId(),
    _objectId: _id,
    _objectClass: _class,
    _objectSpace,
    _date: Date.now(),
    _user: EMPTY_USER
  }
  return tx
}

// ******************************************************************************************************
// C O L L E C T I O N S
// ******************************************************************************************************

/**
 * Create a new item in collection.
 */
export function addItem<T extends Doc, C extends Emb> (
  _objectClass: Ref<Class<T>>,
  _objectId: Ref<Doc>,
  _objectSpace: Ref<Space>,
  _itemClass: Ref<Class<C>>,
  selector: CollectionId<T>, // <- collection selector builder
  value: DocumentValue<C>,
  _itemId?: Ref<C>
): AddItemTx {
  const fieldId = selector(collectionId<T>())

  const tx: AddItemTx = {
    _class: core.class.AddItemTx,
    _id: generateId(), // Transaction ID
    _objectId,
    _objectClass,
    _objectSpace,
    _user: EMPTY_USER,
    _date: Date.now(),

    _itemClass,
    _itemId: _itemId ?? generateId(),
    _collection: fieldId,
    attributes: value as unknown as AnyLayout
  }
  return tx
}

/**
 * Update item in collection.
*/
export function updateItem<T extends Doc, C extends Emb> (
  _objectClass: Ref<Class<T>>,
  _objectId: Ref<Doc>,
  _objectSpace: Ref<Space>,
  _itemClass: Ref<Class<C>>,
  selector: CollectionId<T>, // <- collection selector builder

  _itemId: Ref<C>,
  value: PartialDocumentValue<C>
): UpdateItemTx {
  const fieldId = selector(collectionId<T>())

  const tx: UpdateItemTx = {
    _class: core.class.UpdateItemTx,
    _id: generateId(), // Transaction Id
    _objectId,
    _objectClass,
    _objectSpace,
    _user: EMPTY_USER,
    _date: Date.now(),

    _itemClass,
    _itemId,
    _collection: fieldId,
    attributes: value as unknown as AnyLayout
  }
  return tx
}

/**
 * Remove item from collection.
 */
export function removeItem<T extends Doc, C extends Emb> (
  _objectClass: Ref<Class<T>>,
  _objectId: Ref<Doc>,
  _objectSpace: Ref<Space>,
  _itemClass: Ref<Class<C>>,
  selector: CollectionId<T>, // <- collection selector builder
  _itemId: Ref<C>
): RemoveItemTx {
  const fieldId = selector(collectionId<T>())

  const tx: RemoveItemTx = {
    _class: core.class.RemoveItemTx,
    _id: generateId(),
    _objectId,
    _objectClass,
    _objectSpace,
    _user: EMPTY_USER,
    _date: Date.now(),

    _itemClass,
    _itemId,
    _collection: fieldId
  }
  return tx
}
