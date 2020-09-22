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

import { Doc, Ref, Class, AnyLayout, Storage } from '@anticrm/core'
import { QueryResult, Subscriber, Unsubscriber } from '.'

export interface Domain extends Storage {
  query<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): QueryResult<T>
}

interface Query<T extends Doc> {
  _class: Ref<Class<T>>
  query: AnyLayout
  subscriber: Subscriber<T>
  unsubscriber?: Unsubscriber
}

export class QueriableStorage implements Domain {
  private proxy: Storage
  private queries: Query<Doc>[] = []

  constructor (store: Storage) {
    this.proxy = store
  }

  refreshAll () {
    this.queries.forEach(q => this.refresh(q))
  }

  private refresh<T extends Doc> (query: Query<T>) {
    this.find(query._class, query.query).then(result => { query.subscriber(result) })
  }

  store (doc: Doc): Promise<void> {
    return this.proxy.store(doc).then(() => this.refreshAll())
  }

  push (_class: Ref<Class<Doc>>, _id: Ref<Doc>, attribute: string, attributes: any): Promise<void> {
    return this.proxy.push(_class, _id, attribute, attributes).then(() => this.refreshAll())
  }

  update (_class: Ref<Class<Doc>>, selector: object, attributes: any): Promise<void> {
    return this.proxy.update(_class, selector, attributes).then(() => this.refreshAll())
  }

  remove (_class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<void> {
    return this.proxy.remove(_class, _id).then(() => this.refreshAll())
  }

  find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
    return this.proxy.find(_class, query)
  }

  // TODO: move to platform core
  query<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): QueryResult<T> {
    return {
      subscribe: (subscriber: Subscriber<T>) => {
        const q: Query<Doc> = { _class, query, subscriber: subscriber as Subscriber<Doc> }
        q.unsubscriber = () => { this.queries.splice(this.queries.indexOf(q), 1) }
        this.queries.push(q)
        this.refresh(q)
        return q.unsubscriber
      }
    }
  }

}