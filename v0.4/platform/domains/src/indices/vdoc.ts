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

import { TransactionProtocol, Model, Ref, Storage, Tx, TxContext } from '@anticrm/core'
import { Space } from '../space'
import { AddItemTx, CreateTx, DeleteTx, ItemTx, RemoveItemTx, update, UpdateItemTx, UpdateTx } from '../tx'
import domains from '../'
import { processTransactions } from '../tx_utils'
import { VDoc } from '../vdoc'

export class VDocIndex implements TransactionProtocol {
  private readonly transient: Storage | undefined
  private readonly modelDb: Model
  private readonly storage: Storage

  constructor (modelDb: Model, storage: Storage, transient: Storage | undefined = undefined) {
    this.modelDb = modelDb
    this.storage = storage
    this.transient = transient
  }

  async tx (ctx: TxContext, tx: Tx): Promise<any> {
    await processTransactions(ctx, tx, this)
  }

  async onCreateTx (ctx: TxContext, tx: CreateTx): Promise<any> {
    if (!this.modelDb.is(tx._objectClass, domains.class.VDoc)) {
      return await Promise.resolve()
    }
    const createTx: CreateTx = { ...tx, attributes: { ...tx.attributes } } // Make a copy + modify modification

    // we need to update vdoc properties.
    createTx.attributes._createdBy = tx._user
    createTx.attributes._createdOn = tx._date
    if (this.modelDb.is(tx._objectClass, domains.class.VDoc)) {
      const _space = tx._objectSpace as Ref<Space>
      if (_space === undefined) {
        return await Promise.reject(new Error('VDoc instances should have _space attribute specified'))
      }
      createTx.attributes._space = _space
    }

    await Promise.all([
      this.storage.tx(ctx, createTx),
      this.transient?.tx(ctx, update<VDoc>(tx._objectClass, tx._objectId, {
        _createdOn: tx._date,
        _createdBy: tx._user
      })) ?? Promise.resolve()
    ])
  }

  async onUpdateTx (ctx: TxContext, tx: UpdateTx): Promise<any> {
    if (!this.modelDb.is(tx._objectClass, domains.class.VDoc)) {
      return await Promise.resolve()
    }

    const newTx: UpdateTx = { ...tx, attributes: { ...tx.attributes } } // Make a copy + modify modification
    newTx.attributes._createdBy = tx._user
    newTx.attributes._createdOn = tx._date

    await Promise.all([
      this.storage.tx(ctx, newTx),
      this.transient?.tx(ctx, update<VDoc>(tx._objectClass, tx._objectId, {
        _createdOn: tx._date,
        _createdBy: tx._user
      })) ?? Promise.resolve()
    ])
  }

  async onAddItemTx (ctx: TxContext, tx: AddItemTx): Promise<any> {
    await this.onItemTx(ctx, tx)
  }

  async onUpdateItemTx (ctx: TxContext, tx: UpdateItemTx): Promise<any> {
    await this.onItemTx(ctx, tx)
  }

  async onRemoveItemTx (ctx: TxContext, tx: RemoveItemTx): Promise<any> {
    await this.onItemTx(ctx, tx)
  }

  async onItemTx (ctx: TxContext, tx: ItemTx): Promise<any> {
    await this.storage.tx(ctx, tx)

    const utx = update<VDoc>(tx._objectClass, tx._objectId, {
      _createdOn: tx._date,
      _createdBy: tx._user
    })
    await Promise.all([
      this.storage.tx(ctx, utx),
      this.transient?.tx(ctx, utx) ?? Promise.resolve()
    ])
  }

  async onDeleteTx (ctx: TxContext, tx: DeleteTx): Promise<any> {
    if (!this.modelDb.is(tx._objectClass, domains.class.VDoc)) {
      return await Promise.resolve()
    }
    await this.storage.tx(ctx, tx)
  }
}
