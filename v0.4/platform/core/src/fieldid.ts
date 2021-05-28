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

import { Obj } from './classes'

export type FieldBuilder<T> = {
  [P in keyof T]-?: string
}
export type FieldId<T> = (s: FieldBuilder<T>) => string

/**
 * Construct helper object to specify a field name with respect to type fields.
 * @param clazz - an object class to build operation for.
 */
export function fieldId<T extends Obj> (): FieldBuilder<T> {
  const ph: ProxyHandler<any> = {
    get (target, property) { // Trap for getting property values
      return property
    }
  }
  return new Proxy({}, ph) as FieldBuilder<T>
}
