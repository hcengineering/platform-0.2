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

import { Model, MODEL_DOMAIN } from './model'
import { Doc, StringProperty, Ref, Class, AnyLayout, DateProperty } from './classes'
import core from '.'

/**
 * Transaction operation being processed.
 */
export interface Tx extends Doc {
  _date: DateProperty
  _user: StringProperty
}

/**
 * Operation direction, is it came from server or it is own operation.
 */
export enum TxContextSource {
  Client, Server
}

/**
 * Define a transaction processing context.
 */
export interface TxContext {
  // Define a network operations if required.
  network: Promise<void>
  // Define transaction source
  source: TxContextSource
}

/**
 * Return a complete TxContext
 */
export function txContext (source: TxContextSource = TxContextSource.Client, network: Promise<void> = Promise.resolve()): TxContext {
  return { network, source } as TxContext
}

export interface DomainIndex {
  tx (ctx: TxContext, tx: Tx): Promise<any>
}

export interface Storage {
  store (ctx: TxContext, doc: Doc): Promise<void>
  push (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, query: AnyLayout | null, attribute: StringProperty, attributes: AnyLayout): Promise<void>
  update (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, query: AnyLayout | null, attributes: AnyLayout): Promise<void>
  remove (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, query: AnyLayout | null): Promise<void>

  find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]>
  findOne<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T | undefined>
}

export const TX_DOMAIN = 'tx'

export interface ObjectTx extends Tx {
  _objectId: Ref<Doc>
  _objectClass: Ref<Class<Doc>>
}
export interface CreateTx extends ObjectTx {
  object: AnyLayout
}

export interface PushTx extends ObjectTx {
  _attribute: StringProperty
  _attributes: AnyLayout
  _query?: AnyLayout
}

export interface UpdateTx extends ObjectTx {
  _attributes: AnyLayout
  _query?: AnyLayout
}

export interface DeleteTx extends ObjectTx {
  _query?: unknown
}

export class TxIndex implements DomainIndex {
  private storage: Storage

  constructor (storage: Storage) {
    this.storage = storage
  }

  tx (ctx: TxContext, tx: Tx): Promise<any> {
    return this.storage.store(ctx, tx)
  }
}

/**
 * Perform model update and forward updates into chained storage if required.
 */
export class ModelIndex implements DomainIndex {
  private storages: Storage[]
  private model: Model

  constructor (model: Model, storages: Storage[]) {
    this.model = model
    this.storages = storages
  }

  async tx (ctx: TxContext, tx: Tx): Promise<any> {
    switch (tx._class) {
      case core.class.CreateTx: {
        const createTx = tx as CreateTx
        if (this.model.getDomain(createTx._objectClass) !== MODEL_DOMAIN) {
          return
        }
        const newDoc = this.model.newDoc(createTx._objectClass, createTx._objectId, createTx.object)
        return Promise.all(this.storages.map((s) => s.store(ctx, newDoc)))
      }
      case core.class.UpdateTx: {
        const updateTx = tx as UpdateTx
        if (this.model.getDomain(updateTx._objectClass) !== MODEL_DOMAIN) {
          return
        }
        return Promise.all(this.storages.map((s) => s.update(ctx, updateTx._objectClass, updateTx._objectId, updateTx._query || null, updateTx._attributes)))
      }
      case core.class.PushTx: {
        const pushTx = tx as PushTx
        if (this.model.getDomain(pushTx._objectClass) !== MODEL_DOMAIN) {
          return
        }
        return Promise.all(this.storages.map((s) => s.push(ctx, pushTx._objectClass, pushTx._objectId, pushTx._query || null, pushTx._attribute, pushTx._attributes)))
      }
      case core.class.DeleteTx: {
        const deleteTx = tx as DeleteTx
        if (this.model.getDomain(deleteTx._objectClass) !== MODEL_DOMAIN) {
          return
        }
        return Promise.all(this.storages.map((s) => s.remove(ctx, deleteTx._objectClass, deleteTx._objectId, (deleteTx._query || null) as AnyLayout)))
      }

      default:
        console.log('not implemented model tx', tx)
    }
  }
}
