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

import { Index } from '../utils'
import { MemDb, mixinKey } from '../memdb'
import { generateId } from '../objectid'
import { core, Doc, CreateTx, VDoc, Ref, Class, Obj, Classifier, Title } from '../core'

const NULL = '<null>'
const primaryKey = mixinKey(core.mixin.Indices, 'primary')

export class TitleIndex implements Index {
  private modelDb: MemDb
  private primaries = new Map<Ref<Classifier<VDoc>>, string>()

  constructor (modelDb: MemDb) {
    this.modelDb = modelDb
  }

  private getPrimary (_class: Ref<Classifier<VDoc>>): string | null {
    const cached = this.primaries.get(_class)
    if (cached) return cached === NULL ? null : cached

    let cls = _class as Ref<Class<Obj>> | undefined
    while (cls) {
      const clazz = this.modelDb.get(cls) as Classifier<VDoc>
      const primary = (clazz as any)[primaryKey]
      if (primary) {
        console.log(`primary code for class ${_class}: ${primary}`)
        this.primaries.set(_class, primary)
        return primary
      }
      cls = clazz._extends
    }
    this.primaries.set(_class, NULL)
    return null
  }

  onCreate (create: CreateTx): Doc | null {
    const primary = this.getPrimary(create._objectClass)
    if (!primary) { return null }

    const title = create._attributes[primary] as string

    const doc: Title = {
      _class: core.class.Title,
      _id: generateId() as Ref<Title>,
      _objectClass: create._objectClass,
      _objectId: create._objectId,
      title
    }

    return doc
  }
}
