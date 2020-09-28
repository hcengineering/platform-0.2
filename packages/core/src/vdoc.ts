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

import { Index, Storage, Tx } from './core'
import { Model } from './model'
import { Doc, Ref, Mixin, Class, Obj, Emb, DateProperty, StringProperty } from './core'
import { CreateTx, PushTx, UpdateTx, CORE_CLASS_CREATETX, CORE_CLASS_UPDATETX, CORE_CLASS_PUSHTX } from './tx'

export interface Application extends Doc {
}

export interface List extends Emb {
  id: string
  name: string
  application: Ref<Application>
}

export const SPACE_DOMAIN = 'space'

export interface Space extends VDoc {
  name: string
  lists: List[]
  users: string[] // user accounts (emails) that have access to the space
}

export interface VDoc extends Doc {
  _space?: Ref<Space>
  _createdOn: DateProperty
  _createdBy: StringProperty
  _modifiedOn?: DateProperty
  _modifiedBy?: StringProperty
}

export const CORE_CLASS_VDOC = 'class:core.VDoc' as Ref<Class<VDoc>>
export const CORE_CLASS_SPACE = 'class:core.Space' as Ref<Class<Space>>

export class VDocIndex implements Index {
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
        console.log('not implemented title tx', tx)
    }
  }

  async onCreate (create: CreateTx): Promise<any> {
    if (!this.modelDb.is(create.object._class, CORE_CLASS_VDOC))
      return

    // const doc: VDoc = {
    //   _space: create._space,
    //   _class: create._objectClass,
    //   _id: create._objectId,
    //   _createdBy: create._user,
    //   _createdOn: create._date,
    //   ...create._attributes
    // }
    // let _class = create._objectClass
    // while (true) {
    //   const clazz = this.modelDb.get(_class) as Class<Obj>
    //   if (clazz._kind === ClassifierKind.MIXIN) {
    //     if (doc._mixins) {
    //       doc._mixins.push(_class as Ref<Mixin<Doc>>)
    //     } else {
    //       doc._mixins = [_class as Ref<Mixin<Doc>>]
    //     }
    //     _class = clazz._extends as Ref<Class<VDoc>>
    //   } else {
    //     doc._class = _class
    //     break
    //   }
    // }
    return this.storage.store(create.object)
  }

  onPush (tx: PushTx): Promise<any> {
    return this.storage.push(tx._objectClass, tx._objectId, tx._attribute, tx._attributes)
  }

  onUpdate (tx: UpdateTx): Promise<any> {
    return this.storage.update(tx._objectClass, { _id: tx._objectId }, tx._attributes)
  }
}
