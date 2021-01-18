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

import { Doc, Ref, Classifier, Tx, Index, Storage, TxContext } from '@anticrm/model'
import { Model } from '@anticrm/model/src/model'
import { CreateTx, UpdateTx } from './tx'
import { generateId } from './objectid'
import core from '.'

export const TITLE_DOMAIN = 'title'

export interface Title extends Doc {
  _objectClass: Ref<Classifier<Doc>>
  _objectId: Ref<Doc>
  title: string | number
}

const NULL = '<null>'

export class TitleIndex implements Index {
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
      case core.class.CreateTx:
        return this.onCreate(ctx, tx as CreateTx)
      case core.class.UpdateTx:
        return this.onUpdate(ctx, tx as UpdateTx)
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
      _class: core.class.Title,
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
      this.storage.update(ctx, core.class.Title, update._objectId, null, { title: update._attributes[primary] })
    }
  }
}
