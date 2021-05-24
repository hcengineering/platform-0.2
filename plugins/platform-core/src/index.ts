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

import { Class, CoreProtocol, Doc, DocumentProtocol, DocumentQuery, FindOptions, Model, Ref } from '@anticrm/core'
import { OperationProtocol } from '@anticrm/domains'
import { Metadata, Plugin, plugin } from '@anticrm/platform'

import { ClientService } from './rpc'

// Queries
export type Subscriber<T> = (value: T[]) => void
export type Unsubscribe = () => void

export interface QueryResult<T extends Doc> {
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
}

export type QueryUpdater<T extends Doc> = (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>) => void

export interface CoreService extends CoreProtocol, DocumentProtocol, QueryProtocol, OperationProtocol {
  getModel: () => Model

  generateId: () => Ref<Doc>

  getUserId: () => string

  rpc: ClientService
}

export default plugin(
  'core' as Plugin<CoreService>,
  {},
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
