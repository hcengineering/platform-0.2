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

import { Class, Doc, DocumentQuery, FindOptions, generateId, Model, Ref, Storage, TxContext } from '@anticrm/core'
import { TxOperation, TxOperationKind } from '@anticrm/domains'
import { QueryProtocol, QueryResult, Subscriber, Unsubscribe } from '.'

interface Query<T extends Doc> {
  _id: Ref<Doc>
  _class: Ref<Class<T>>
  query: DocumentQuery<T>
  subscriber: Subscriber<T>
  unsubscriber?: Unsubscribe

  // A ordered results with some additional flags.
  results: T[]
  total: number

  options?: FindOptions<T>
}

export class QueriableStorage implements QueryProtocol, Storage {
  private readonly proxy: Storage
  private readonly queries: Map<string, Query<Doc>> = new Map()
  private readonly model: Model
  private readonly updateResults: boolean

  constructor (model: Model, store: Storage, updateResults = false) {
    this.model = model
    this.proxy = store
    this.updateResults = updateResults
  }

  private async refresh<T extends Doc> (query: Query<T>): Promise<void> {
    const findOptions: FindOptions<T> = {
      ...(query.options ?? {}),
      countCallback: (skip, limit, total) => {
        query.total = total
        if (query.options?.countCallback !== undefined) {
          query.options?.countCallback(skip, limit, total)
        }
      }
    }
    const result = await this.find(query._class, query.query, findOptions)
    query.results = result
    query.subscriber(result)
  }

  async store (ctx: TxContext, doc: Doc): Promise<void> {
    await this.proxy.store(ctx, doc)

    for (const q of this.queries.values()) {
      if (this.model.matchQuery(q._class, doc, q.query)) {
        // If document is matched, assume we add it to end of list. But it's order could be changed after transaction will be complete.

        let shouldAdd = true
        if (q.options !== undefined) {
          const limit = q.options?.limit ?? 0
          if (limit > 0 && q.results.length >= limit) {
            shouldAdd = false // We had limit no need to add object to list
          }
        }
        if (shouldAdd) {
          q.results.push(this.model.as(doc, q._class))
        }
        if (q.options?.sort !== undefined && Object.keys(q.options.sort).length > 0) {
          // We had sorting defined, we need to refresh query on server.
          await ctx.network
          await this.refresh(q)
        } else {
          q.subscriber(q.results)
        }
      }
    }
  }

  findQueryDocument (q: Query<Doc>, _class: Ref<Class<Doc>>, _id: Ref<Doc>): { doc?: Doc, pos: number } {
    let pos = 0
    for (const r of q.results) {
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
  checkLimitCapacity (q: Query<Doc>): boolean {
    if (q.options !== undefined) {
      const limit = q.options?.limit ?? 0
      if (limit > 0 && q.results.length < q.total) {
        // we have more items so try refresh.
        return true
      }
    }
    return false
  }

  async update (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, operations: TxOperation[]): Promise<void> {
    await this.proxy.update(ctx, _class, _id, operations)

    for (const q of this.queries.values()) {
      // Find doc, apply update of attributes and check if it is still matches, if not we need to perform request to server after transaction will be complete.

      const { doc, pos } = this.findQueryDocument(q, _class, _id)

      let needServerRefresh = false
      // Perform document update.
      if (doc != null && this.updateResults) {
        // We have mixin update operations, let's apply as mixin
        if (this.model.isMixedIn(doc, _class)) {
          this.model.updateDocument(this.model.as(doc, _class), operations)
        } else {
          this.model.updateDocument(doc, operations)
        }

        // If Document is not matched anymore, we need to remove it.
        if (!this.model.matchQuery(q._class, doc, q.query)) {
          q.results.splice(pos, 1)
        }
        // Update subscriber, since we have operation applied, and do not wait for server to perform it's activities.
        q.subscriber(q.results)

        // If we have limit and total is not our size, we should update from server.
        if (this.checkLimitCapacity(q)) {
          needServerRefresh = true
        }
        if (this.checkSortingHasEffect(q, operations)) {
          needServerRefresh = true
        }
      } else {
        // Check for potential operations if we doesn't have object in query results.
        if (this.checkOperationHasEffect(q, _class, operations) || this.checkSortingHasEffect(q, operations)) {
          needServerRefresh = true
        }
      }

      if (needServerRefresh) {
        await ctx.network
        await this.refresh(q)
      }
    }
  }

  private checkSortingHasEffect (q: Query<Doc>, operations: TxOperation[]): boolean {
    // Check if object is modified and modification field have influence on sort
    if (q.options?.sort !== undefined && Object.keys(q.options.sort).length > 0) {
      // We had sorting defined, we need to refresh query on server.

      for (const op of operations) {
        if (op.selector !== undefined) {
          // For embedded objects let's assume we need to refresh
          return true
        }
        if (op.kind === TxOperationKind.Set) {
          if (this.model.isSortHasEffect(op._attributes, q.options.sort)) {
            // We do not match with values updated, so no update is required.
            return true
          }
        }
      }
    }
    return false
  }

  private checkOperationHasEffect (q: Query<Doc>, _class: Ref<Class<Doc>>, operations: TxOperation[]): boolean {
    if (this.model.is(_class, q._class)) {
      // so we potentially need to fetch new matched objects from server, so do so if class are matching ours.
      for (const op of operations) {
        if (op.kind === TxOperationKind.Set) {
          if (this.model.isPartialMatched(_class, op._attributes, q.query)) {
            // We do not match with values updated, so no update is required.
            return true
          }
        }
      }
    }
    return false
  }

  async remove (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<void> {
    await this.proxy.remove(ctx, _class, _id)

    for (const q of this.queries.values()) {
      // Check if we had object, remove it.
      let pos = 0
      for (const r of q.results) {
        if (r._id === _id) {
          q.results.splice(pos, 1)
          q.subscriber(q.results)

          if (q.options !== undefined) {
            const limit = q.options?.limit ?? 0
            if (limit > 0 && q.results.length < q.total) {
              // We have more elements available, so we need to do refresh.
              await ctx.network
              await this.refresh(q)
            }
          }

          break
        }
        pos++
      }
    }
  }

  async find<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): Promise<T[]> {
    return await this.proxy.find<T>(_class, query, options)
  }

  async findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
    return await this.proxy.findOne<T>(_class, query)
  }

  // TODO: move to platform core
  query<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): QueryResult<T> {
    return {
      subscribe: (subscriber: Subscriber<T>) => {
        const q: Query<Doc> = {
          _id: generateId(),
          _class,
          query,
          subscriber: subscriber as Subscriber<Doc>,
          results: [],
          options,
          total: 0
        }
        q.unsubscriber = () => {
          this.queries.delete(q._id)
        }
        this.queries.set(q._id, q)

        this.refresh(q) // eslint-disable-line
        return q.unsubscriber
      }
    }
  }
}
