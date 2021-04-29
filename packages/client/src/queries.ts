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

export interface Domain extends Storage {
  query: <T extends Doc>(_class: Ref<Class<T>>, query: DocumentQuery<T>) => QueryResult<T>
}

export type Subscriber<T> = (value: T[]) => void
export type Unsubscribe = () => void

export interface QueryResult<T extends Doc> {
  subscribe: (run: Subscriber<T>) => Unsubscribe
}

export type QueryUpdater<T extends Doc> = (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>) => void

/**
 * Define operations with live queries.
 */
export interface QueryProtocol {
  /**
   * Perform query construction, it will be possible to subscribe to query results.
   * @param _class - object class
   * @param query - query
   */
  query: <T extends Doc>(_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>) => QueryResult<T>
}

interface Query<T extends Doc> {
  _id: Ref<Doc>
  _class: Ref<Class<T>>
  query: DocumentQuery<T>
  subscriber: Subscriber<T>
  unsubscriber?: Unsubscribe

  // A ordered results with some additional flags.
  results: T[]

  options?: FindOptions<T>
}

export class QueriableStorage implements Domain {
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
    const result = await this.find(query._class, query.query, query.options)

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

  async update (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, operations: TxOperation[]): Promise<void> {
    await this.proxy.update(ctx, _class, _id, operations)

    for (const q of this.queries.values()) {
      // Find doc, apply update of attributes and check if it is still matches, if not we need to perform request to server after transaction will be complete.

      let needRefresh = true

      // go over documents and check if modification will move object to not matched state.
      let pos = 0
      for (const r of q.results) {
        if (r._id === _id) {
          if (this.updateResults) {
            this.model.updateDocument(r, operations)
          }
          if (!this.model.matchQuery(q._class, r, q.query)) {
          // Document is not matched anymore, we need to remove it.
            q.results.splice(pos, 1)
          }
          q.subscriber(q.results)
          needRefresh = false
          break
        }
        pos++
      }
      if (needRefresh && this.model.is(_class, q._class)) {
        // so we potentially need to fetch new matched objects from server, so do so if class are matching ours.
        for (const op of operations) {
          if (op.kind === TxOperationKind.Set) {
            if (!this.model.isPartialMatched(_class, op._attributes, q.query)) {
              // We do not match with values updated, so no update is required.
              needRefresh = false
            }
          }
        }

        if (needRefresh) {
          await ctx.network
          await this.refresh(q)
        }
      }
    }
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
          options
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
