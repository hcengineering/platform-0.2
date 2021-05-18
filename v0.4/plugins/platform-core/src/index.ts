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

import { Class, CoreProtocol, Doc, DocumentProtocol, DocumentQuery, DomainProtocol, Emb, FindOptions, Model, Obj, Ref } from '@anticrm/core'
import { CollectionId } from '@anticrm/domains'
import { Metadata, Plugin, plugin } from '@anticrm/platform'
import client from '@anticrm/client'

// Queries
export type Subscriber<T> = (value: T[]) => void
export type Unsubscribe = () => void

export interface QueryResult<T extends Obj> {
  subscribe: (run: Subscriber<T>) => Unsubscribe
}
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

  /**
   * Perform query in collection construction, it will be possible to subscribe to query results.
   * @param _class - object class
   * @param query - query
   */
  queryIn: <T extends Doc, C extends Emb>(_class: Ref<Class<T>>, _id: Ref<Class<T>>, _collection: CollectionId<T>, _itemClass: Ref<Class<C>>, query: DocumentQuery<C>, options?: FindOptions<C>) => QueryResult<C>
}

export type QueryUpdater<T extends Doc> = (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>) => void

export interface CoreService extends CoreProtocol, DocumentProtocol, QueryProtocol, DomainProtocol {
  getModel: () => Model

  generateId: () => Ref<Obj>

  getUserId: () => string
}
export default plugin(
  'core' as Plugin<CoreService>,
  { client: client.id },
  {
    metadata: {
      Model: '' as Metadata<{ [key: string]: Doc[] }>,
      Offline: '' as Metadata<boolean>,
      WSHost: '' as Metadata<string>,
      WSPort: '' as Metadata<string>,

      WhoAmI: '' as Metadata<string>,
      Token: '' as Metadata<string>
    }
  }
)
