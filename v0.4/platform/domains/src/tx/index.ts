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

import { AnyLayout, Class, Doc, Emb, Ref, Tx } from '@anticrm/core'
import { Space } from '../space'

// TXes
export const TX_DOMAIN = 'tx'

export interface ObjectTx extends Tx {
  _objectId: Ref<Doc>
  _objectClass: Ref<Class<Doc>>
  _objectSpace?: Ref<Space> // For some system wide operations, space may be missing
}

/**
 * Mixin with some extra object transaction details.
 */
export interface ObjectTxDetails extends ObjectTx {
  name?: string
  id?: string
  description?: string
}

/**
 * Perform an object creation.
 * In case _class is mixin, object of first parent Class will be stored into storage.
 */
export interface CreateTx extends ObjectTx {
  attributes: AnyLayout
}

/**
 * Perform an object update operation.
 * In case _class is mixin, object of first parent Class will be stored into storage.
 */
export interface UpdateTx extends ObjectTx {
  attributes: AnyLayout
}

export interface ItemTx extends ObjectTx {
  _itemId: Ref<Emb>
  _itemClass: Ref<Class<Doc>> // It is required, since we could perform operation over collection item as mixin.

  _collection: string
}

/**
 * Add particular item into collection.
 */
export interface AddItemTx extends ItemTx {
  attributes: AnyLayout
}

/**
 * Update item based on query.
 */
export interface UpdateItemTx extends ItemTx {
  attributes: AnyLayout
}

/**
 * Remove item
 */
export interface RemoveItemTx extends ItemTx {
}

/**
 * Delete removed object fully from storage.
 */
export interface DeleteTx extends ObjectTx {
}

export * from '@anticrm/core/src/colletionid'
export * from './clienttx'
export * from './operations'
