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

import { Class, mixinKey, Model, Obj, Ref } from '@anticrm/core'
import domains from '.'

export function getPrimaryKey (model: Model, _class: Ref<Class<Obj>>): string | undefined {
  const primaryKey = mixinKey(domains.mixin.Indices, 'primary')
  let cls = _class as Ref<Class<Obj>> | undefined
  while (cls !== undefined) {
    const clazz = model.get(cls)
    const primary = (clazz as any)[primaryKey]
    if (primary !== undefined) {
      return primary
    }
    cls = clazz._extends
  }
  return undefined
}
