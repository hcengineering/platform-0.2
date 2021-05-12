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

import { Class, Doc, DomainIndex, generateId, Model, Ref, Storage, Tx, TxContext } from '@anticrm/core'
import domains from '..'
import { getPrimaryKey } from '../primary_utils'
import { Title, TitleSource } from '../title'
import { create, CreateTx, DeleteTx, newDeleteTx, newUpdateTx, TxOperationKind, updateDocument, UpdateTx } from '../tx'
import { VDoc } from '../vdoc'

const NULL = '<null>'

export class TitleIndex implements DomainIndex {
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
      default:
        console.log('not implemented title tx', tx)
    }
  }

  async onCreate (ctx: TxContext, tx: CreateTx): Promise<any> {
    await this.updateShortIdRef(ctx, this.modelDb.createDocument(tx._objectClass, tx.object, tx._objectId))

    const primary = this.getPrimary(tx._objectClass)
    if (primary === undefined) {
      return
    }

    const title = (tx.object as any)[primary] as string

    const doc: Title = {
      _class: domains.class.Title,
      _id: this.getPrimaryID(tx._objectId), // Use same object Id, so we will be able to update it in case of title change.
      _objectClass: tx._objectClass,
      _objectId: tx._objectId,
      source: TitleSource.Title,
      title
    }

    return await this.storage.tx(ctx, create<Title>(this.modelDb, '', domains.class.Title, doc))
  }

  private getPrimaryID (_id: Ref<Doc>): Ref<Doc> {
    return ('primary:' + _id) as Ref<Doc>
  }

  private async updateShortIdRef (ctx: TxContext, obj: Doc): Promise<void> {
    if (!this.modelDb.isMixedIn(obj, domains.mixin.ShortID)) {
      return await Promise.resolve()
    }
    const object = this.modelDb.as(obj, domains.mixin.ShortID)
    const shortId = object.shortId
    if (shortId !== undefined) {
      // Find short Ids, and if we already had one do not create duplicate
      const docs = await this.storage.find<Title>(domains.class.Title, { _objectId: obj._id, _objectClass: obj._class })
      for (const d of docs) {
        if (d.title === shortId) {
          // Duplicate found, do not create a new one.
          return
        }
      }
      const doc: Title = {
        _class: domains.class.Title,
        _id: generateId() as Ref<Title>,
        _objectClass: obj._class,
        _objectId: obj._id,
        title: shortId,
        source: TitleSource.ShortId
      }
      await this.storage.tx(ctx, create<Title>(this.modelDb, (obj as VDoc)._createdBy ?? '', domains.class.Title, doc))
    }
  }

  async onUpdate (ctx: TxContext, tx: UpdateTx): Promise<any> {
    const primary = this.getPrimary(tx._objectClass)
    if (primary === undefined) {
      return
    }

    const obj = await this.storage.findOne(tx._objectClass, { _id: tx._objectId }) as Doc

    const previousPrimary = (obj as any)[primary]
    updateDocument(this.modelDb, this.modelDb.as(obj, tx._objectClass), tx.operations)
    await this.updateShortIdRef(ctx, obj)
    const newPrimary = (obj as any)[primary]

    if (previousPrimary !== primary) {
      // Update a current primary title Title object, since it is address by _objectId
      await this.storage.tx(ctx, newUpdateTx(domains.class.Title, this.getPrimaryID(tx._objectId), [{
        _class: domains.class.TxOperation,
        kind: TxOperationKind.Set,
        _attributes: { title: newPrimary }
      }], tx._user))
    }
  }

  private async onDelete (ctx: TxContext, deleteTx: DeleteTx): Promise<any> {
    // We need to delete all created Titles based on objectId.
    const docs = await this.storage.find(domains.class.Title, {
      _objectId: deleteTx._objectId,
      _objectClass: deleteTx._objectClass
    })
    await Promise.all(docs.map(async d => {
      await this.storage.tx(ctx, newDeleteTx(domains.class.Title, d._id, deleteTx._user))
    }))
  }
}