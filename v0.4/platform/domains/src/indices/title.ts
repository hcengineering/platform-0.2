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

import { Class, Doc, DocumentValue, TransactionProtocol, Model, Ref, Storage, Tx, TxContext } from '@anticrm/core'
import domains from '..'
import { getPrimaryKey } from '../primary_utils'
import { Title, TitleSource } from '../title'
import { create, CreateTx, DeleteTx, remove, update, UpdateTx } from '../tx'

const NULL = '<null>'

export class TitleIndex implements TransactionProtocol {
  private readonly modelDb: Model
  private readonly storage: Storage
  private readonly primaries = new Map<Ref<Class<Doc>>, string>()

  constructor (modelDb: Model, storage: Storage) {
    this.modelDb = modelDb
    this.storage = storage
  }

  private getPrimary (_class: Ref<Class<Doc>>): string | undefined {
    const cached = this.primaries.get(_class)
    if (cached !== undefined) return cached === NULL ? undefined : cached

    const primary = getPrimaryKey(this.modelDb, _class)
    if (primary !== undefined) {
      this.primaries.set(_class, primary)
      return primary
    }
    this.primaries.set(_class, NULL)
    return undefined
  }

  async tx (ctx: TxContext, tx: Tx): Promise<any> {
    switch (tx._class) {
      case domains.class.CreateTx:
        return await this.onCreate(ctx, tx as CreateTx)
      case domains.class.UpdateTx:
        return await this.onUpdate(ctx, tx as UpdateTx)
      case domains.class.DeleteTx:
        return await this.onDelete(ctx, tx as DeleteTx)
      case domains.class.AddItemTx:
        break // No support required
      case domains.class.UpdateItemTx:
        break // No support required
      case domains.class.RemoveItemTx:
        break // No support required
      default:
        console.log('not implemented title tx', tx)
    }
  }

  async onCreate (ctx: TxContext, tx: CreateTx): Promise<any> {
    await this.updateShortIdRef(ctx, tx)

    const primary = this.getPrimary(tx._objectClass)
    if (primary === undefined) {
      return
    }

    const rawValue = this.modelDb.assign({}, tx._objectClass, tx.attributes)
    const attr = this.modelDb.classAttribute(tx._objectClass, primary)
    const title = (rawValue as any)[attr.key] as string

    const _id = this.getPrimaryID(tx._objectId)
    // Use same object Id, so we will be able to update it in case of title change.
    const doc: DocumentValue<Title> = {
      _class: domains.class.Title,
      _objectClass: tx._objectClass,
      _objectId: tx._objectId,
      source: TitleSource.Title,
      title
    }

    return await this.storage.tx(ctx, create<Title>(domains.class.Title, doc, _id))
  }

  private getPrimaryID (_id: Ref<Doc>): Ref<Doc> {
    return ('primary:' + _id) as Ref<Doc>
  }

  private async updateShortIdRef (ctx: TxContext, tx: CreateTx | UpdateTx): Promise<void> {
    const rawValue = this.modelDb.assign({}, tx._objectClass, tx.attributes)
    const attr = this.modelDb.classAttribute(domains.mixin.ShortID, 'shortId')

    const newShortId = (rawValue as any)[attr.key] as string

    if (newShortId !== undefined) {
      const _id = ('sid-' + tx._objectId) as Ref<Doc>
      const existingTitle = await this.storage.findOne<Title>(domains.class.Title, { _id, source: TitleSource.ShortId, _objectClass: tx._objectClass, _objectId: tx._objectId })
      if (existingTitle !== undefined) {
        // If short id already exists, just update it.
        await this.storage.tx(ctx, update<Title>(domains.class.Title, _id, { title: newShortId }))
      } else {
        const doc: DocumentValue<Title> = {
          _objectClass: tx._objectClass,
          _objectId: tx._objectId,
          title: newShortId,
          source: TitleSource.ShortId
        }
        await this.storage.tx(ctx, create<Title>(domains.class.Title, doc, _id))
      }
    }
  }

  async onUpdate (ctx: TxContext, tx: UpdateTx): Promise<any> {
    const primary = this.getPrimary(tx._objectClass)
    if (primary === undefined) {
      return
    }

    await this.updateShortIdRef(ctx, tx)

    const rawValue = this.modelDb.assign({}, tx._objectClass, tx.attributes)
    const attr = this.modelDb.classAttribute(tx._objectClass, primary)
    const newPrimary = (rawValue as any)[attr.key] as string

    if (newPrimary !== undefined) {
      const titleTx = update<Title>(domains.class.Title, this.getPrimaryID(tx._objectId), { title: newPrimary })
      titleTx._user = tx._user
      // Update a current primary title Title object, since it is address by _objectId
      await this.storage.tx(ctx, titleTx)
    }
  }

  private async onDelete (ctx: TxContext, deleteTx: DeleteTx): Promise<any> {
    // We need to delete all created Titles based on objectId.
    const docs = await this.storage.find(domains.class.Title, {
      _objectId: deleteTx._objectId,
      _objectClass: deleteTx._objectClass
    })
    await Promise.all(docs.map(async d => {
      await this.storage.tx(ctx, remove(domains.class.Title, d._id, deleteTx._objectSpace))
    }))
  }
}
