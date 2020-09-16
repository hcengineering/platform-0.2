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
import { Model } from '../model'
import { Doc, Ref, Mixin, Class, Obj, ClassifierKind } from '../core'
import { CreateTx, VDoc, PushTx, UpdateTx } from '../tx'

export class VDocIndex implements Index {
  private modelDb: Model
  private storage: Storage

  constructor(modelDb: Model, storage: Storage) {
    this.modelDb = modelDb
    this.storage = storage
  }

  onCreate (create: CreateTx): Promise<any> {
    const doc: VDoc = {
      _space: create._space,
      _class: create._objectClass,
      _id: create._objectId,
      _createdBy: create._user,
      _createdOn: create._date,
      ...create._attributes
    }
    let _class = create._objectClass
    while (true) {
      const clazz = this.modelDb.get(_class) as Class<Obj>
      if (clazz._kind === ClassifierKind.MIXIN) {
        if (doc._mixins) {
          doc._mixins.push(_class as Ref<Mixin<Doc>>)
        } else {
          doc._mixins = [_class as Ref<Mixin<Doc>>]
        }
        _class = clazz._extends as Ref<Class<VDoc>>
      } else {
        doc._class = _class
        break
      }
    }
    return this.storage.store(doc)
  }

  onPush (tx: PushTx): Promise<any> {
    return this.storage.push(tx._objectClass, tx._objectId, tx._attribute, tx._attributes)
  }

  onUpdate (tx: UpdateTx): Promise<any> {
    return this.storage.update(tx._objectClass, { _id: tx._objectId }, tx._attributes)
  }
}
