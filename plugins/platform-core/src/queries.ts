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

import { Doc, Ref, Class, AnyLayout, Storage, Tx, Model } from '@anticrm/core'
import { QueryResult, Subscriber, Unsubscriber } from '.'

export interface Domain extends Storage {
  query<T extends Doc>(_class: Ref<Class<T>>, query: AnyLayout): QueryResult<T>
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

  constructor(model: Model, store: Storage) {
    this.model = model
    this.proxy = store
  }

  private refreshAll() {
    this.queries.forEach(q => this.refresh(q))
  }

  private refresh<T extends Doc>(query: Query<T>) {
    this.find(query._class, query.query).then(result => {
      query.results = result
      query.subscriber(result)
    })
  }

  async store(doc: Doc): Promise<void> {
    await this.proxy.store(doc).then(() => {
      this.queries.forEach(q => {
        if (this.model.matchQuery(q._class, doc, q.query)) {
          // If docuemnt is matched, assume we add it to end of list. But it's order could be changed after transaction will be complete.
          q.results.push(doc)
          q.subscriber(q.results)
        }
      })
    })
  }

  push(_class: Ref<Class<Doc>>, _id: Ref<Doc>, attribute: string, attributes: any): Promise<void> {
    return this.proxy.push(_class, _id, attribute, attributes).then(() => {
      this.queries.forEach(q => {
        // Find doc, apply attribute and check if it is still matches, if not we need to perform request to server after transaction will be complete.
        for (const r of q.results) {
          if (r._id === _id) {
            // let recDoc = Object.keys(r)

            this.refresh(q)
            break
          }
        }
      })
    })
  }

  update(_class: Ref<Class<Doc>>, _id: Ref<Doc>, attributes: any): Promise<void> {
    return this.proxy.update(_class, _id, attributes).then(() => {
      this.queries.forEach(q => {
        // Find doc, apply update of attributes and check if it is still matches, if not we need to perform request to server after transaction will be complete.
        for (const r of q.results) {
          if (r._id === _id) {
            // TODO: Handle update and do not refresh
            this.refresh(q)

            // On transaction done, we need to refresh again, since values will be different.
            break
          }
        }
      })
    })
  }

  remove(_class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<void> {
    return this.proxy.remove(_class, _id).then(() => {
      this.queries.forEach(q => {
        const newResults = q.results.filter(e => e._id === _id)
        if (newResults.length !== q.results.length) {
          // We had this item
          q.results = newResults
          q.subscriber(q.results)
        }
      })
    })
  }

  find<T extends Doc>(_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
    return this.proxy.find(_class, query)
  }

  // TODO: move to platform core
  query<T extends Doc>(_class: Ref<Class<T>>, query: AnyLayout): QueryResult<T> {
    return {
      subscribe: (subscriber: Subscriber<T>) => {
        const q: Query<Doc> = { _class, query, subscriber: subscriber as Subscriber<Doc>, results: [] }
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
