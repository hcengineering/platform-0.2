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

import { DateProperty, Doc, StringProperty, Ref, Class, Emb, PropertyType, Tx } from './core'
import { Index, Storage } from './core'
import { Model, MODEL_DOMAIN } from './model'

export const TX_DOMAIN = 'tx'

export interface CreateTx extends Tx {
  object: Doc
}

export interface PushTx extends Tx {
  _objectId: Ref<Doc>
  _objectClass: Ref<Class<Doc>>
  _attribute: StringProperty
  _attributes: { [key: string]: PropertyType } | PropertyType
}

export interface UpdateTx extends Tx {
  _objectId: Ref<Doc>
  _objectClass: Ref<Class<Doc>>
  _attributes: { [key: string]: any }
}

export interface DeleteTx extends Tx {
  _objectId: Ref<Doc>
  _objectClass: Ref<Class<Doc>>
}

export const CORE_CLASS_CREATETX = 'class:core.CreateTx' as Ref<Class<CreateTx>>
export const CORE_CLASS_PUSHTX = 'class:core.PushTx' as Ref<Class<PushTx>>
export const CORE_CLASS_UPDATETX = 'class:core.UpdateTx' as Ref<Class<UpdateTx>>
export const CORE_CLASS_DELETETX = 'class:core.DeleteTx' as Ref<Class<DeleteTx>>

export class TxIndex implements Index {
  private storage: Storage

  constructor (storage: Storage) {
    this.storage = storage
  }

  tx (tx: Tx): Promise<any> {
    return this.storage.store(tx)
  }
}

export class ModelIndex implements Index {
  private storage: Storage
  private model: Model

  constructor (model: Model, storage: Storage) {
    this.model = model
    this.storage = storage
  }

  async tx (tx: Tx): Promise<any> {
    switch (tx._class) {
      case CORE_CLASS_CREATETX:
        const createTx = tx as CreateTx
        if (this.model.getDomain(createTx.object._class) !== MODEL_DOMAIN)
          return
        else
          return this.storage.store(createTx.object)
      case CORE_CLASS_UPDATETX:
        const updateTx = tx as UpdateTx
        if (this.model.getDomain(updateTx._objectClass) !== MODEL_DOMAIN)
          return
        else
          return this.storage.update(updateTx._objectClass, { _id: updateTx._objectId }, updateTx._attributes)
      default:
        console.log('not implemented model tx', tx)
    }
  }
}
