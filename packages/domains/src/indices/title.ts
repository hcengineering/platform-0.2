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

import { Doc, Ref, Classifier, Model, Tx, DomainIndex, Storage, TxContext, generateId } from '@anticrm/core'
import { CreateTx, UpdateTx, CORE_CLASS_CREATE_TX, CORE_CLASS_UPDATE_TX, CORE_CLASS_PUSH_TX, CORE_CLASS_TITLE, Title } from '..'

const NULL = '<null>'

export class TitleIndex implements DomainIndex {
  private modelDb: Model
  private storage: Storage
  private primaries = new Map<Ref<Classifier<Doc>>, string>()

  constructor (modelDb: Model, storage: Storage) {
    this.modelDb = modelDb
    this.storage = storage
  }

  private getPrimary (_class: Ref<Classifier<Doc>>): string | null {
    const cached = this.primaries.get(_class)
    if (cached) return cached === NULL ? null : cached

    const primary = this.modelDb.getPrimaryKey(_class)
    if (primary) {
      console.log(`primary code for class ${_class}: ${primary}`)
      this.primaries.set(_class, primary)
      return primary
    }
    this.primaries.set(_class, NULL)
    return null
  }

  async tx (ctx: TxContext, tx: Tx): Promise<any> {
    switch (tx._class) {
      case CORE_CLASS_CREATE_TX:
        return this.onCreate(ctx, tx as CreateTx)
      case CORE_CLASS_UPDATE_TX:
        return this.onUpdate(ctx, tx as UpdateTx)
      case CORE_CLASS_PUSH_TX:
      default:
        console.log('not implemented title tx', tx)
    }
  }

  async onCreate (ctx: TxContext, create: CreateTx): Promise<any> {
    const primary = this.getPrimary(create._objectClass)
    if (!primary) {
      return
    }

    const title = (create.object as any)[primary] as string

    const doc: Title = {
      _class: CORE_CLASS_TITLE,
      _id: generateId() as Ref<Title>,
      _objectClass: create._objectClass,
      _objectId: create._objectId,
      title
    }

    return this.storage.store(ctx, doc)
  }

  async onUpdate (ctx: TxContext, update: UpdateTx): Promise<any> {
    const primary = this.getPrimary(update._objectClass)
    if (!primary) {
      return
    }

    let updated = false
    for (const key in update._attributes) {
      if (key === primary) {
        updated = true
        break
      }
    }
    if (updated) {
      this.storage.update(ctx, CORE_CLASS_TITLE, update._objectId, null, { title: update._attributes[primary] })
    }
  }
}
