//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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

import { Collection, Obj } from './classes'

type TxCollectionOf<A> = A extends Collection<any> ? string : never

export type CollectionBuilder<T> = {
  [P in keyof T]-?: TxCollectionOf<T[P]>
}
export type TxCollectionId<T> = CollectionBuilder<T>

export type CollectionId<T> = (s: TxCollectionId<T>) => string

/**
 * Construct TxOperation builder to create TxOperation to perform object update.
 * @param clazz - an object class to build operation for.
 */
export function collectionId<T extends Obj> (): TxCollectionId<T> {
  const ph: ProxyHandler<any> = {
    get (target, property) { // Trap for getting property values
      return property
    }
  }
  const np = new Proxy({}, ph) as TxCollectionId<T>
  return np
}
