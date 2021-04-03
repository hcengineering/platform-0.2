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

import { Model, Storage, TxContext, DomainIndex, Tx } from '@anticrm/core'
import {
  CORE_CLASS_CREATE_TX, CORE_CLASS_DELETE_TX, CORE_CLASS_PUSH_TX, CORE_CLASS_UPDATE_TX, CORE_CLASS_VDOC, CreateTx,
  DeleteTx, PushTx, UpdateTx
} from '..'

export class VDocIndex implements DomainIndex {
  private readonly transient: Storage | undefined
  private readonly modelDb: Model
  private readonly storage: Storage

  constructor (modelDb: Model, storage: Storage, transient: Storage | undefined = undefined) {
    this.modelDb = modelDb
    this.storage = storage
    this.transient = transient
  }

  async tx (ctx: TxContext, tx: Tx): Promise<any> {
    switch (tx._class) {
      case CORE_CLASS_CREATE_TX:
        return this.onCreate(ctx, tx as CreateTx)
      case CORE_CLASS_UPDATE_TX:
        return this.onUpdate(ctx, tx as UpdateTx)
      case CORE_CLASS_PUSH_TX:
        return this.onPush(ctx, tx as PushTx)
      case CORE_CLASS_DELETE_TX:
        return this.onDelete(ctx, tx as PushTx)
      default:
        console.log('not implemented tx', tx)
    }
  }

  async onCreate (ctx: TxContext, tx: CreateTx): Promise<any> {
    if (!this.modelDb.is(tx._objectClass, CORE_CLASS_VDOC)) {
      return Promise.resolve()
    }
    // we need to update vdoc properties.
    if (this.transient) {
      const vdoc = tx.object
      vdoc._createdBy = tx._user
      vdoc._createdOn = tx._date
    }

    return Promise.all([
      this.storage.store(ctx, this.modelDb.newDoc(tx._objectClass, tx._objectId, tx.object)),
      this.transient && this.transient.update(ctx, tx._objectClass, tx._objectId, null, {
        _createdOn: tx._date,
        _createdBy: tx._user
      })
    ])
  }

  onPush (ctx: TxContext, tx: PushTx): Promise<any> {
    if (!this.modelDb.is(tx._objectClass, CORE_CLASS_VDOC)) {
      return Promise.resolve()
    }
    // We need to perform two operations, this may cause performance.
    return Promise.all([
      this.storage.push(ctx, tx._objectClass, tx._objectId, null, tx._attribute, tx._attributes),
      this.transient && this.transient.update(ctx, tx._objectClass, tx._objectId, null, {
        _modifiedOn: tx._date,
        _modifiedBy: tx._user
      })
    ])
  }

  onUpdate (ctx: TxContext, tx: UpdateTx): Promise<any> {
    if (!this.modelDb.is(tx._objectClass, CORE_CLASS_VDOC)) {
      return Promise.resolve()
    }
    // Be sure we update modification fields.
    if (this.transient) {
      const vdoc = tx._attributes
      vdoc._modifiedBy = tx._user
      vdoc._modifiedOn = tx._date
    }

    return Promise.all([
      this.storage.update(ctx, tx._objectClass, tx._objectId, null, tx._attributes),
      this.transient && this.transient.update(ctx, tx._objectClass, tx._objectId, null, {
        _modifiedOn: tx._date,
        _modifiedBy: tx._user
      })
    ])
  }

  onDelete (ctx: TxContext, tx: DeleteTx): Promise<any> {
    if (!this.modelDb.is(tx._objectClass, CORE_CLASS_VDOC)) {
      return Promise.resolve()
    }
    return this.storage.remove(ctx, tx._objectClass, tx._objectId, tx._query || null)
  }
}
