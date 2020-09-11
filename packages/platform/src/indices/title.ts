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

import { Index, Storage } from '../utils'
import { MemDb, mixinKey } from '../memdb'
import { generateId } from '../objectid'
import { core, CreateTx, VDoc, Ref, Class, Obj, Classifier, Title, UpdateTx } from '../core'

const NULL = '<null>'
const primaryKey = mixinKey(core.mixin.Indices, 'primary')

export class TitleIndex implements Index {
  private modelDb: MemDb
  private storage: Storage
  private primaries = new Map<Ref<Classifier<VDoc>>, string>()

  constructor(modelDb: MemDb, storage: Storage) {
    this.modelDb = modelDb
    this.storage = storage
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

  async onCreate (create: CreateTx): Promise<any> {
    const primary = this.getPrimary(create._objectClass)
    if (!primary) { return }

    const title = create._attributes[primary] as string

    const doc: Title = {
      _class: core.class.Title,
      _id: generateId() as Ref<Title>,
      _objectClass: create._objectClass,
      _objectId: create._objectId,
      title
    }

    return this.storage.store(doc)
  }

  async onPush (): Promise<any> {
    // return this.storage.push(tx._objectClass, tx._objectId, tx._attribute, tx._attributes)
  }

  async onUpdate (update: UpdateTx): Promise<any> {
    const primary = this.getPrimary(update._objectClass)
    if (!primary) { return }

    let updated = false
    for (const key in update._attributes) {
      if (key === primary) {
        updated = true
        break
      }
    }
    if (updated) {
      this.storage.update(core.class.Title, { _objectId: update._objectId }, { title: update._attributes[primary] })
    }
  }
}
