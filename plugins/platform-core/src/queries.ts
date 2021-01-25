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

import { Doc, Ref, Class, AnyLayout, Storage, Model, TxContext, StringProperty } from '@anticrm/model'
import { QueryResult, Subscriber, Unsubscriber } from '.'

export interface Domain extends Storage {
  query<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): QueryResult<T>
}

interface Query<T extends Doc> {
  _class: Ref<Class<T>>
  query: AnyLayout
  subscriber: Subscriber<T>
  unsubscriber?: Unsubscriber

  // A ordered results with some additional flags.
  results: T[]
}

export class QueriableStorage implements Domain {
  private proxy: Storage
  private queries: Query<Doc>[] = []
  private model: Model

  constructor (model: Model, store: Storage) {
    this.model = model
    this.proxy = store
  }

  private refresh<T extends Doc> (query: Query<T>) {
    this.find(query._class, query.query).then(result => {
      query.results = result
      query.subscriber(result)
    })
  }

  async store (ctx: TxContext, doc: Doc): Promise<void> {
    await this.proxy.store(ctx, doc).then(() => {
      this.queries.forEach(q => {
        if (this.model.matchQuery(q._class, doc, q.query)) {
          // If document is matched, assume we add it to end of list. But it's order could be changed after transaction will be complete.
          q.results.push(doc)
          q.subscriber(q.results)
        }
      })
    })
  }

  updateMatchQuery (_id: Ref<Doc>, q: Query<Doc>): boolean {
    let pos = 0
    for (const r of q.results) {
      if (r._id === _id) {
        if (!this.model.matchQuery(q._class, r, q.query)) {
          // Document is not matched anymore, we need to remove it.
          q.results.splice(pos, 1)
        }
        q.subscriber(q.results)
        return true
      }
      pos++
    }
    return false
  }

  push (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, _query: AnyLayout | null, attribute: StringProperty, attributes: AnyLayout): Promise<void> {
    return this.proxy.push(ctx, _class, _id, _query, attribute, attributes).then(() => {
      this.queries.forEach(q => {
        // Find doc, apply attribute and check if it is still matches, if not we need to perform request to server after transaction will be complete.
        // Check if attribute are in query, so it could modify results.
        if (this.updateMatchQuery(_id, q)) {
          return
        }
        // so we potentially need to fetch new matched objects from server, so do so.
        ctx.network.then(() => this.refresh(q))
      })
    })
  }

  update (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, _query: AnyLayout | null, attributes: AnyLayout): Promise<void> {
    return this.proxy.update(ctx, _class, _id, _query, attributes).then(() => {
      this.queries.forEach(q => {
        // Find doc, apply update of attributes and check if it is still matches, if not we need to perform request to server after transaction will be complete.
        if (this.updateMatchQuery(_id, q)) {
          return
        }
        // so we potentially need to fetch new matched objects from server, so do so.
        ctx.network.then(() => this.refresh(q))
      })
    })
  }

  remove (ctx: TxContext, _class: Ref<Class<Doc>>, _id: Ref<Doc>, _query: AnyLayout | null): Promise<void> {
    return this.proxy.remove(ctx, _class, _id, _query).then(() => {
      this.queries.forEach(q => {
        if (this.updateMatchQuery(_id, q)) {
          return
        }
        // so we potentially need to fetch new matched objects from server, so do so.
        ctx.network.then(() => this.refresh(q))
      })
    })
  }

  find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
    return this.proxy.find(_class, query)
  }

  findOne<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T | undefined> {
    return this.proxy.findOne(_class, query)
  }

  // TODO: move to platform core
  query<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): QueryResult<T> {
    return {
      subscribe: (subscriber: Subscriber<T>) => {
        const q: Query<Doc> = {
          _class,
          query,
          subscriber: subscriber as Subscriber<Doc>,
          results: []
        }
        q.unsubscriber = () => {
          this.queries.splice(this.queries.indexOf(q), 1)
        }
        this.queries.push(q)
        this.refresh(q)
        return q.unsubscriber
      }
    }
  }
}
