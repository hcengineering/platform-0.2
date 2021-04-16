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
import {
  CORE_CLASS_CREATE_TX, CORE_CLASS_DELETE_TX, CORE_CLASS_TITLE, CORE_CLASS_UPDATE_TX, CORE_MIXIN_SHORTID, CreateTx,
  DeleteTx, Title, TitleSource, TxOperation, TxOperationKind, UpdateTx
} from '..'

const NULL = '<null>'

export class TitleIndex implements DomainIndex {
  private readonly modelDb: Model
  private readonly storage: Storage
  private readonly primaries = new Map<Ref<Class<Doc>>, string>()

  constructor (modelDb: Model, storage: Storage) {
    this.modelDb = modelDb
    this.storage = storage
  }

  private getPrimary (_class: Ref<Class<Doc>>): string | null {
    const cached = this.primaries.get(_class)
    if (cached) return cached === NULL ? null : cached

    const primary = this.modelDb.getPrimaryKey(_class)
    if (primary) {
      console.log(`primary code for class ${_class}: ${primary}`)
      this.primaries.set(_class, primary)
      return primary
    }
    this.primaries.set(_class, NULL)
    return null
  }

  async tx (ctx: TxContext, tx: Tx): Promise<any> {
    switch (tx._class) {
      case CORE_CLASS_CREATE_TX:
        return this.onCreate(ctx, tx as CreateTx)
      case CORE_CLASS_UPDATE_TX:
        return this.onUpdate(ctx, tx as UpdateTx)
      case CORE_CLASS_DELETE_TX:
        return this.onDelete(ctx, tx as DeleteTx)
      default:
        console.log('not implemented title tx', tx)
    }
  }

  async onCreate (ctx: TxContext, create: CreateTx): Promise<any> {
    const obj = this.modelDb.createDocument(create._objectClass, create.object)
    obj._id = create._objectId
    await this.updateShortIdRef(ctx, obj)

    const primary = this.getPrimary(create._objectClass)
    if (!primary) {
      return
    }

    const title = (obj as any)[primary] as string

    const doc: Title = {
      _class: CORE_CLASS_TITLE,
      _id: this.getPrimaryID(create._objectId), // Use same object Id, so we will be able to update it in case of title change.
      _objectClass: create._objectClass,
      _objectId: create._objectId,
      source: TitleSource.Title,
      title
    }

    return this.storage.store(ctx, doc)
  }

  private getPrimaryID (_id: Ref<Doc>): Ref<Doc> {
    return ('primary:' + _id) as Ref<Doc>
  }

  private async updateShortIdRef (ctx: TxContext, obj: Doc): Promise<void> {
    if (!this.modelDb.isMixedIn(obj, CORE_MIXIN_SHORTID)) {
      return Promise.resolve()
    }
    const object = this.modelDb.as(obj, CORE_MIXIN_SHORTID)
    const shortId = object.shortId
    if (shortId) {
      // Find short Ids, and if we already had one do not create duplicate
      const docs = await this.storage.find(CORE_CLASS_TITLE, { _objectId: obj._id, _objectClass: obj._class })
      for (const d of docs) {
        if (d.title === shortId) {
          // Duplicate found, do not create a new one.
          return
        }
      }
      const doc: Title = {
        _class: CORE_CLASS_TITLE,
        _id: generateId() as Ref<Title>,
        _objectClass: obj._class,
        _objectId: obj._id,
        title: shortId,
        source: TitleSource.ShortId
      }
      await this.storage.store(ctx, doc)
    }
  }

  async onUpdate (ctx: TxContext, update: UpdateTx): Promise<any> {
    const primary = this.getPrimary(update._objectClass)
    if (!primary) {
      return
    }

    const obj = await this.storage.findOne(update._objectClass, { _id: update._objectId }) as Doc

    const previousPrimary = (obj as any)[primary]
    this.modelDb.updateDocument(this.modelDb.as(obj, update._objectClass), update.operations)
    await this.updateShortIdRef(ctx, obj)
    const newPrimary = (obj as any)[primary]

    if (previousPrimary !== primary) {
      // Update a current primary title Title object, since it is address by _objectId
      return this.storage.update(ctx, CORE_CLASS_TITLE, this.getPrimaryID(update._objectId), [{
        kind: TxOperationKind.Set,
        _attributes: { title: newPrimary }
      } as TxOperation])
    }
  }

  private async onDelete (ctx: TxContext, deleteTx: DeleteTx): Promise<any> {
    // We need to delete all created Titles based on objectId.
    const docs = await this.storage.find(CORE_CLASS_TITLE, {
      _objectId: deleteTx._objectId,
      _objectClass: deleteTx._objectClass
    })
    return Promise.all(docs.map(d => this.storage.remove(ctx, CORE_CLASS_TITLE, d._id)))
  }
}
