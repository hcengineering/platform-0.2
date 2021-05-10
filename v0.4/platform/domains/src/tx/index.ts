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

import { AnyLayout, Class, Doc, Emb, PrimitiveType, Ref, Tx } from '@anticrm/core'
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
  object: AnyLayout
}

/**
 * An update transaction, operation kind.
 */
export enum TxOperationKind {
  Set,
  Push,
  Pull
}

export interface ObjectSelector extends Emb {
  key: string // A field key
  pattern?: AnyLayout | PrimitiveType // A pattern to match inside array, may be missing for some operations.
}

/**
 * Update operation inside update transaction, could contain changes to some of individual embedded attributes.
 * And operations with arrays.
 */
export interface TxOperation extends Emb {
  kind: TxOperationKind
  /*
   Embedded object/Array selector, will determine type of object passed as individual operations.

   Selector is array of (Key, QueryObject) pairs, with last one could be omitted.
   Key - is array or embedded object name field.
   ObjectQuery - is object matching to ensure element in array.

   Using selector it is possible to identify attribute/embedded object to perform update, push, pull operations on.
   parentKey: {parentSelector}, arrayKey

   If selector is not specified, only update operation is allowed and will be performed against object itself.
   */
  selector?: ObjectSelector[]

  // will determine an object or individual value to be updated.
  _attributes?: AnyLayout
}

/**
 * Perform an object update operation.
 * In case _class is mixin, object of first parent Class will be stored into storage.
 */
export interface UpdateTx extends ObjectTx {
  operations: TxOperation[]
}

/**
 * Delete removed object fully from storage.
 */
export interface DeleteTx extends ObjectTx {
}

export * from './builder'
export * from './clienttx'
export * from './modeltx'
export * from './operations'
export * from './tx'
