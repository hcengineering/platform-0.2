//
// Copyright © 2020 Anticrm Platform Contributors.
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

import { AnyLayout, Class, Doc, DocumentQuery, Emb, FindOptions, generateId, Model, Obj, Ref, Storage, Tx, TxContext } from '@anticrm/core'
import { AddItemTx, CollectionId, CreateTx, DeleteTx, processTransactions, RemoveItemTx, UpdateItemTx, UpdateTx } from '@anticrm/domains'
import { QueryProtocol, QueryResult, Subscriber, Unsubscribe } from '@anticrm/platform-core'

type FindOp<T extends Obj> = (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>) => Promise<T[]>
type InQueryCheck = (_class: Ref<Class<Doc>>, _id: Ref<Doc>) => boolean
/**
 * Define a live query.
 */
class Query<T extends Doc> {
  readonly model: Model
  private readonly find: FindOp<T>
  readonly _id: Ref<Doc>
  readonly _class: Ref<Class<T>>
  readonly query: DocumentQuery<T>
  readonly subscriber: Subscriber<T>
  unsubscriber?: Unsubscribe

  readonly updateResults: boolean // Should we try to modify results, or always do refresh from server.
  readonly inQuery?: InQueryCheck // If defined, check for query is for a right parent.

  // A ordered results with some additional flags.
  results: T[] = []
  total: number = 0

  readonly options?: FindOptions<T>

  constructor (
    model: Model,
    find: FindOp<T>,
    _id: Ref<Doc>, _class: Ref<Class<T>>, query: DocumentQuery<T>,
    subscriber: Subscriber<T>,
    updateResults: boolean,
    inQuery?: InQueryCheck,
    options?: FindOptions<T>) {
    this.model = model
    this.find = find
    this._id = _id
    this._class = _class
    this.query = query
    this.subscriber = subscriber
    this.options = options
    this.updateResults = updateResults
    this.inQuery = inQuery
  }

  public async refresh (): Promise<void> {
    const findOptions: FindOptions<T> = {
      ...(this.options ?? {}),
      countCallback: (skip, limit, total) => {
        this.total = total
        if (this.options?.countCallback !== undefined) {
          this.options?.countCallback(skip, limit, total)
        }
      }
    }
    const result = await this.find(this._class, this.query, findOptions)
    this.results = result
    this.subscriber(result)
  }

  async onCreate (ctx: TxContext, doc: Doc): Promise<void> {
    if (this.model.matchQuery(this._class, doc, this.query)) {
      // If document is matched, assume we add it to end of list. But it's order could be changed after transaction will be complete.

      let shouldAdd = true
      if (this.options !== undefined) {
        const limit = this.options?.limit ?? 0
        if (limit > 0 && this.results.length >= limit) {
          shouldAdd = false // We had limit no need to add object to list
        }
      }
      if (shouldAdd) {
        this.results.push(this.model.as(doc, this._class))
      }
      if (this.options?.sort !== undefined && Object.keys(this.options.sort).length > 0) {
        // We had sorting defined, we need to refresh query on server.
        await ctx.network
        await this.refresh()
      } else {
        this.subscriber(this.results)
      }
    }
  }

  findQueryDocument (_class: Ref<Class<Doc>>, _id: Ref<Doc>): { doc?: Doc, pos: number } {
    let pos = 0
    for (const r of this.results) {
      if (r._id === _id) {
        return { doc: r, pos: pos }
      }
      pos++
    }
    return { pos: -1 }
  }

  /**
 * Check if query in current state have a potential more results on server not show because of limit.
 * @param q - query
 * @returns - true if we need to refresh
 */
  checkLimitCapacity (): boolean {
    if (this.options !== undefined) {
      const limit = this.options?.limit ?? 0
      if (limit > 0 && this.results.length < this.total) {
        // we have more items so try refresh.
        return true
      }
    }
    return false
  }

  private checkSortingHasEffect (attributes: AnyLayout): boolean {
    // Check if object is modified and modification field have influence on sort
    if (this.options?.sort !== undefined && Object.keys(this.options.sort).length > 0 &&
        this.model.isSortHasEffect(attributes, this.options.sort)) {
      // We had sorting defined, we need to refresh query on server.
      // We do not match with values updated, so no update is required.
      return true
    }
    return false
  }

  private checkOperationHasEffect (_class: Ref<Class<Doc>>, attributes: AnyLayout): boolean {
    if (this.model.is(_class, this._class) && this.model.isPartialMatched(_class, attributes, this.query)) {
      // so we potentially need to fetch new matched objects from server, so do so if class are matching ours.
      // We do not match with values updated, so no update is required.
      return true
    }
    return false
  }

  async onUpdate (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, attributes: AnyLayout): Promise<void> {
    const { doc, pos } = this.findQueryDocument(_class, _id)

    let needServerRefresh = false
    // Perform document update.
    if (doc != null && this.updateResults) {
      this.model.update(doc, _class, attributes)

      // If Document is not matched anymore, we need to remove it.
      if (!this.model.matchQuery(this._class, doc, this.query)) {
        this.results.splice(pos, 1)
      }
      // Update subscriber, since we have operation applied, and do not wait for server to perform it's activities.
      this.subscriber(this.results)

      // If we have limit and total is not our size, we should update from server.
      if (this.checkLimitCapacity()) {
        needServerRefresh = true
      }
      if (this.checkSortingHasEffect(attributes)) {
        needServerRefresh = true
      }
    } else {
      // Check for potential operations if we doesn't have object in query results.
      if (this.checkOperationHasEffect(_class, attributes) || this.checkSortingHasEffect(attributes)) {
        needServerRefresh = true
      }
    }

    if (needServerRefresh) {
      await ctx.network
      await this.refresh()
    }
  }

  async onDelete (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<void> {
    let pos = 0
    for (const r of this.results) {
      if (r._id === _id) {
        this.results.splice(pos, 1)
        this.subscriber(this.results)

        if (this.options !== undefined) {
          const limit = this.options?.limit ?? 0
          if (limit > 0 && this.results.length < this.total) {
            // We have more elements available, so we need to do refresh.
            await ctx.network
            await this.refresh()
          }
        }
        break
      }
      pos++
    }
  }
}

export class QueriableStorage implements QueryProtocol, Storage {
  private readonly proxy: Storage
  private readonly queries: Map<string, Query<any>> = new Map()
  private readonly model: Model
  private readonly updateResults: boolean

  constructor (model: Model, store: Storage, updateResults = false) {
    this.model = model
    this.proxy = store
    this.updateResults = updateResults
  }

  async tx (ctx: TxContext, tx: Tx): Promise<void> {
    await this.proxy.tx(ctx, tx)
    await processTransactions(ctx, tx, this)
  }

  filterQueries (): Array<Query<any>> {
    const values = Array.from(this.queries.values())
    return values.filter(q => q.inQuery === undefined)
  }

  filterInQueries (_class: Ref<Class<Emb>>, _id: Ref<Emb>): Array<Query<any>> {
    const values = Array.from(this.queries.values())
    return values.filter(q => q.inQuery?.(_class, _id))
  }

  async onCreateTx (ctx: TxContext, tx: CreateTx): Promise<void> {
    const doc = this.model.createDocument(tx._objectClass, tx.attributes, tx._objectId)

    await Promise.all(
      this.filterQueries().map(
        async q => await q.onCreate(ctx, doc)
      )
    )
  }

  async onUpdateTx (ctx: TxContext, tx: UpdateTx): Promise<void> {
    await Promise.all(
      this.filterQueries().map(
        async q => await q.onUpdate(ctx, tx._objectClass, tx._objectId, tx.attributes)
      )
    )
  }

  async onDeleteTx (ctx: TxContext, tx: DeleteTx): Promise<void> {
    await Promise.all(
      this.filterQueries().map(
        async q => await q.onDelete(ctx, tx._objectClass, tx._objectId)
      )
    )
  }

  async onAddItemTx (ctx: TxContext, tx: AddItemTx): Promise<any> {
    const doc = this.model.createDocument(tx._itemClass, tx.attributes, tx._itemId)
    await Promise.all(
      this.filterInQueries(tx._objectClass, tx._objectId).map(
        async q => await q.onCreate(ctx, doc)
      )
    )
  }

  async onUpdateItemTx (ctx: TxContext, tx: UpdateItemTx): Promise<any> {
    await Promise.all(
      this.filterInQueries(tx._objectClass, tx._objectId).map(
        async q => await q.onUpdate(ctx, tx._itemClass, tx._itemId, tx.attributes)
      )
    )
  }

  async onRemoveItemTx (ctx: TxContext, tx: RemoveItemTx): Promise<any> {
    await Promise.all(
      this.filterInQueries(tx._objectClass, tx._objectId).map(
        async q => await q.onDelete(ctx, tx._itemClass, tx._itemId)
      )
    )
  }

  async find<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): Promise<T[]> {
    return await this.proxy.find<T>(_class, query, options)
  }

  async findIn <T extends Doc, C extends Emb>(
    _class: Ref<Class<T>>, _id: Ref<Doc>, _collection: CollectionId<T>,
    _itemClass: Ref<Class<C>>, query: DocumentQuery<C>,
    options?: FindOptions<C>): Promise<C[]> {
    return await this.proxy.findIn<T, C>(_class, _id, _collection, _itemClass, query, options)
  }

  async findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
    return await this.proxy.findOne<T>(_class, query)
  }

  query<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): QueryResult<T> {
    return {
      subscribe: (subscriber: Subscriber<T>) => {
        const q = new Query<T>(
          this.model,
          async (_class, query, options) => await this.proxy.find<T>(_class, query, options),
          generateId(),
          _class, query,
          subscriber,
          this.updateResults,
          undefined,
          options
        )
        const unsubscriber = (): void => { this.queries.delete(q._id) }
        this.queries.set(q._id, q)
        q.unsubscriber = unsubscriber

        q.refresh() // eslint-disable-line
        return unsubscriber
      }
    }
  }

  queryIn <T extends Doc, C extends Emb>(_class: Ref<Class<T>>, _id: Ref<Class<T>>, _collection: CollectionId<T>, _itemClass: Ref<Class<C>>, query: DocumentQuery<C>, options?: FindOptions<C>): QueryResult<C> {
    return {
      subscribe: (subscriber: Subscriber<C>) => {
        const q = new Query<C>(this.model,
          async (_class, query, options) => await this.proxy.findIn<T, C>(_class, _id, _collection, _itemClass, query, options),
          generateId(),
          _class, query,
          subscriber,
          this.updateResults,
          (_classQ, _idQ) => (_classQ === _class && _idQ === _id), // In query
          options
        )
        this.queries.set(q._id, q)
        const unsubscriber = (): void => { this.queries.delete(q._id) }
        q.unsubscriber = unsubscriber

        q.refresh() // eslint-disable-line
        return unsubscriber
      }
    }
  }
}
