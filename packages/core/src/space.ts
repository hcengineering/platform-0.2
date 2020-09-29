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

import { Class, Doc, Index, Storage, Ref, Tx } from './core'
import { Model } from './model'
import { CORE_CLASS_CREATETX, CORE_CLASS_PUSHTX, CORE_CLASS_UPDATETX, CreateTx, PushTx, UpdateTx } from './tx'
import { List } from './vdoc'

export interface Space extends Doc {
  name: string
  lists: List[]
  users: string[] // user accounts (emails) that have access to the space
}

export const SPACE_DOMAIN = 'space'
export const CORE_CLASS_SPACE = 'class:core.Space' as Ref<Class<Space>>

export class SpaceIndex implements Index {
  private modelDb: Model
  private storage: Storage

  constructor (modelDb: Model, storage: Storage) {
    this.modelDb = modelDb
    this.storage = storage
  }

  async tx (tx: Tx): Promise<any> {
    switch (tx._class) {
      case CORE_CLASS_CREATETX:
        return this.onCreate(tx as CreateTx)
      case CORE_CLASS_UPDATETX:
        return this.onUpdate(tx as UpdateTx)
      case CORE_CLASS_PUSHTX:
        return this.onPush(tx as PushTx)
      default:
        console.log('not implemented space tx', tx)
    }
  }

  async onCreate (create: CreateTx): Promise<any> {
    if (this.modelDb.is(create.object._class, CORE_CLASS_SPACE)) {
      return this.storage.store(create.object)
    }
  }

  async onPush (tx: PushTx): Promise<any> {
    if (this.modelDb.is(tx._objectClass, CORE_CLASS_SPACE)) {
      return this.storage.push(tx._objectClass, tx._objectId, tx._attribute, tx._attributes)
    }
  }

  async onUpdate (tx: UpdateTx): Promise<any> {
    if (this.modelDb.is(tx._objectClass, CORE_CLASS_SPACE)) {
      return this.storage.update(tx._objectClass, { _id: tx._objectId }, tx._attributes)
    }
  }
}
