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

import { Metadata, Plugin, plugin, Service } from '@anticrm/platform'
import { Class, CoreProtocol, Doc, DocumentProtocol, DocumentQuery, Ref } from '@anticrm/core'
import { ModelDb } from './modeldb'
import { TxBuilder, TxOperation } from '@anticrm/domains'

export type Subscriber<T> = (value: T[]) => void
export type Unsubscribe = () => void

export interface QueryResult<T extends Doc> {
  subscribe (run: Subscriber<T>): Unsubscribe
}

export type QueryUpdater<T extends Doc> = (_class: Ref<Class<T>>, query: DocumentQuery<T>) => void

/**
 * Define operations with live queries.
 */
export interface QueryProtocol {
  /**
   * Perform query construction, it will be possible to subscribe to query results.
   * @param _class - object class
   * @param query - query
   */
  query<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): QueryResult<T>
}

/**
 * Define operations with object modifications.
 */
export interface OperationProtocol {
  /**
   * Perform creation of new document and store it into storage.
   * Object ID will be automatically generated and assigned to object.
   */
  create<T extends Doc> (_class: Ref<Class<T>>, values: Partial<T>): Promise<T>

  /**
   * Perform update of document properties.
   */
  update<T extends Doc> (doc: T, value: Partial<Omit<T, keyof Doc>>): Promise<T>

  /**
   * Perform update of document/embedded document properties using a builder pattern.
   *
   * It is possible to do a set, pull, push for different field values.
   *
   * push and pull are applicable only for array attributes.
   */
  updateWith<T extends Doc> (doc: T, builder: (s: TxBuilder<T>) => TxOperation | TxOperation[]): Promise<T>

  /**
   * Perform remove of object.
   */
  remove<T extends Doc> (doc: T): Promise<T>
}

export interface CoreService extends Service, CoreProtocol, QueryProtocol, DocumentProtocol, OperationProtocol {
  getModel (): ModelDb

  generateId (): Ref<Doc>

  getUserId (): string
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
