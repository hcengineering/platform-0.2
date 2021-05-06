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

import { DomainIndex, Model, Ref, Storage, Tx, TxContext } from '@anticrm/core'
import {
  CORE_CLASS_CREATE_TX, CORE_CLASS_DELETE_TX, CORE_CLASS_TX_OPERATION, CORE_CLASS_UPDATE_TX, CORE_CLASS_VDOC, CreateTx, DeleteTx, Space,
  TxOperationKind, UpdateTx
} from '..'
import { newUpdateTx } from '../tx/tx'

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
        return await this.onCreate(ctx, tx as CreateTx)
      case CORE_CLASS_UPDATE_TX:
        return await this.onUpdate(ctx, tx as UpdateTx)
      case CORE_CLASS_DELETE_TX:
        return await this.onDelete(ctx, tx as DeleteTx)
      default:
        console.log('not implemented tx', tx)
    }
  }

  async onCreate (ctx: TxContext, tx: CreateTx): Promise<any> {
    if (!this.modelDb.is(tx._objectClass, CORE_CLASS_VDOC)) {
      return await Promise.resolve()
    }
    const createTx: CreateTx = { ...tx, object: { ...tx.object } } // Make a copy + modify modification

    // we need to update vdoc properties.
    if (this.transient !== undefined) {
      createTx.object._createdBy = tx._user
      createTx.object._createdOn = tx._date
    }
    if (this.modelDb.is(tx._objectClass, CORE_CLASS_VDOC)) {
      const _space = tx._objectSpace as Ref<Space>
      if (_space === undefined) {
        return await Promise.reject(new Error('VDoc instances should have _space attribute specified'))
      }
      createTx.object._space = _space
    }
    const updateOP = {
      _class: CORE_CLASS_TX_OPERATION,
      kind: TxOperationKind.Set,
      _attributes: {
        _createdOn: tx._date,
        _createdBy: tx._user
      }
    }

    await Promise.all([
      this.storage.tx(ctx, createTx),
      this.transient?.tx(ctx, newUpdateTx(tx._objectClass, tx._objectId, [updateOP], '')) ?? Promise.resolve()
    ])
  }

  async onUpdate (ctx: TxContext, tx: UpdateTx): Promise<any> {
    if (!this.modelDb.is(tx._objectClass, CORE_CLASS_VDOC)) {
      return await Promise.resolve()
    }
    const updateOp = {
      _class: CORE_CLASS_TX_OPERATION,
      kind: TxOperationKind.Set,
      _attributes: {
        _modifiedBy: tx._user,
        _modifiedOn: tx._date
      }
    }
    const newTx: UpdateTx = { ...tx, operations: [...tx.operations, updateOp] } // Make a copy + modify modification

    await Promise.all([
      this.storage.tx(ctx, newTx),
      this.transient?.tx(ctx, newUpdateTx(tx._objectClass, tx._objectId, [updateOp], tx._user)) ?? Promise.resolve()
    ])
  }

  async onDelete (ctx: TxContext, tx: DeleteTx): Promise<any> {
    if (!this.modelDb.is(tx._objectClass, CORE_CLASS_VDOC)) {
      return await Promise.resolve()
    }
    await this.storage.tx(ctx, tx)
  }
}
