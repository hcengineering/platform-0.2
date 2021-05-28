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

import { Class, Collection, CollectionOf, Doc, Emb, Ref } from '@anticrm/core/src/classes'
import { Model } from '@anticrm/core/src/model'
import { DocumentQuery, FindOptions, Storage, Tx, TxContext } from '@anticrm/core/src/storage'
import { processTransactions, TxOperations } from '.'
import { AddItemTx, collectionId, CollectionId, CreateTx, DeleteTx, RemoveItemTx, UpdateItemTx, UpdateTx } from './tx'

export class ModelStorage implements Storage, TxOperations {
  model: Model
  constructor (model: Model) {
    this.model = model
  }

  async find<T extends Doc> (clazz: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): Promise<T[]> {
    const result = this.model.find(clazz, query, options)

    if (options?.countCallback !== undefined) {
      options.countCallback(options?.skip ?? 0, options?.limit ?? 0, result.length)
    }

    return await Promise.resolve(result)
  }

  async findIn<T extends Doc, C extends Emb> (_class: Ref<Class<T>>, _id: Ref<Doc>, _collectionB: CollectionId<T>, _itemClass: Ref<Class<C>>, query: DocumentQuery<C>, options?: FindOptions<C>): Promise<C[]> {
    const object = this.model.getLayout(this.model.get(_id))

    const result: C[] = []
    // Convert results and match them agains a sub query
    const _collection = _collectionB(collectionId<T>())

    const attr = this.model.classAttribute(_class, _collection)
    const attrClass = (attr.attr.type as CollectionOf<Emb>).of

    if (attrClass === undefined) {
      throw new Error('attribute class is not defined')
    }
    if (!this.model.is(_itemClass, attrClass)) {
      throw new Error(`incompatible item class specified ${_itemClass} ${attrClass}`)
    }
    const collection = (object as any)[attr.key] as Collection<C>
    for (const o of collection?.items ?? []) {
      if (this.model.matchQuery(_itemClass, o, query)) {
        result.push(o)
      }
    }

    if (options?.countCallback !== undefined) {
      options.countCallback(options?.skip ?? 0, options?.limit ?? 0, result.length)
    }

    return await Promise.resolve(result)
  }

  async findOne<T extends Doc> (clazz: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
    const result = await Promise.resolve(this.model.find(clazz, query, { limit: 1 }))
    return result.length === 0 ? undefined : result[0]
  }

  async onCreateTx (ctx: TxContext, tx: CreateTx): Promise<any> {
    this.model.add(this.model.createDocument(tx._objectClass, tx.attributes, tx._objectId))
  }

  async onUpdateTx (ctx: TxContext, tx: UpdateTx): Promise<any> {
    const obj = this.model.get(tx._objectId)
    this.model.update<any>(obj, tx._objectClass, tx.attributes)
  }

  async onDeleteTx (ctx: TxContext, tx: DeleteTx): Promise<any> {
    this.model.del(tx._objectId)
  }

  async onAddItemTx (ctx: TxContext, tx: AddItemTx): Promise<any> {
    const obj = this.model.get(tx._objectId)
    const attr = this.model.classAttribute(tx._objectClass, tx._collection)
    const value = this.model.createDocument(tx._itemClass, tx.attributes, tx._itemId)
    let cl: Collection<Emb> = (obj as any)[attr.key]
    if (cl === undefined) {
      const newCl = { items: [] as Emb[] }
      cl = newCl as Collection<Emb>
      (obj as any)[attr.key] = cl
    }
    if (cl.items === undefined) {
      cl.items = []
    }
    cl.items.push(value)
  }

  async onUpdateItemTx (ctx: TxContext, tx: UpdateItemTx): Promise<any> {
    const obj = this.model.get(tx._objectId)
    const attr = this.model.classAttribute(tx._objectClass, tx._collection)

    const cl = (obj as any)[attr.key] as Collection<Emb>
    const item = cl.items?.find(i => i._id === tx._itemId)

    this.model.update<any>(item as Emb, tx._itemClass, tx.attributes)
  }

  async onRemoveItemTx (ctx: TxContext, tx: RemoveItemTx): Promise<any> {
    const obj = this.model.get(tx._objectId)
    const attr = this.model.classAttribute(tx._objectClass, tx._collection)
    const cl = (obj as any)[attr.key] as Collection<Emb>
    cl.items = cl.items?.filter(i => i._id !== tx._itemId)
  }

  async tx (ctx: TxContext, tx: Tx): Promise<any> {
    return await processTransactions(ctx, tx, this)
  }
}
