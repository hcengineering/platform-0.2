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
import { AnyLayout, Class, Doc, Ref, StringProperty } from '@anticrm/model'
import { CoreProtocol } from '@anticrm/core'
import { ModelDb } from './modeldb'

export type Subscriber<T> = (value: T[]) => void
export type Unsubscriber = () => void

export interface QueryResult<T extends Doc> {
  subscribe (run: Subscriber<T>): Unsubscriber
}

export type RefFinalizer = (op: () => void) => void

/**
 * Define operations with live queries.
 */
export interface QueryProtocol {
  /**
   * Perform query construction, it will be possible to subscribe to query results.
   * @param _class - object class
   * @param query - query
   */
  query<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): QueryResult<T>

  /**
   * Perform subscribe to query with some helper finalizer to use
   * @param _class
   * @param query
   */
  subscribe<T extends Doc> (_class: Ref<Class<T>>,
    query: AnyLayout,
    action: (docs: T[]) => void,
    regFinalizer: RefFinalizer): void
}

/**
 * Define operations with object modifications.
 *
 * In case of query is not null, operation is performed over one of embedded objects, query should start with first array/instance
 * accessor and define a query to match embedded object, values will be applied to it as is.
 *
 * Only one embedded object or main object is possible to modify with one operation.
 */
export interface OperationProtocol {
  /**
   * Perform creation of new document.
   */
  create<T extends Doc> (_class: Ref<Class<T>>, values: AnyLayout): Promise<T>

  /**
   * Push new embedded element and return a link to it.
   * If query is specified, will find attribute of embedded object.
   */
  push<T extends Doc> (doc: T, query: AnyLayout | null, attribute: StringProperty, element: AnyLayout): Promise<T>

  /**
   * Perform update of document/embedded document inside document.
   *
   * If query is specified, will find and update embedded object instead.
   *
   */
  update<T extends Doc> (doc: T, query: AnyLayout | null, values: AnyLayout): Promise<T>

  /**
   * Perform remove of object or any embedded object value.
   *
   * If query is specified, will find and update embedded object instead.
   */
  remove<T extends Doc> (doc: T, query: AnyLayout | null): Promise<T>
}

export interface CoreService extends Service, CoreProtocol, QueryProtocol, OperationProtocol {
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
      Token: '' as Metadata<string>
    }
  }
)
