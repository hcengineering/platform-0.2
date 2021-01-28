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

import { Model } from '../model'
import {
  CreateTx,
  PushTx,
  UpdateTx,
  Storage,
  DomainIndex,
  Tx,
  TxContext,
  CORE_CLASS_CREATE_TX,
  CORE_CLASS_UPDATE_TX, CORE_CLASS_PUSH_TX
} from '../tx'
import { CORE_CLASS_VDOC } from '../domains'

export class VDocIndex implements DomainIndex {
  private modelDb: Model
  private storage: Storage

  constructor (modelDb: Model, storage: Storage) {
    this.modelDb = modelDb
    this.storage = storage
  }

  async tx (ctx: TxContext, tx: Tx): Promise<any> {
    switch (tx._class) {
      case CORE_CLASS_CREATE_TX:
        return this.onCreate(ctx, tx as CreateTx)
      case CORE_CLASS_UPDATE_TX:
        return this.onUpdate(ctx, tx as UpdateTx)
      case CORE_CLASS_PUSH_TX:
        return this.onPush(ctx, tx as PushTx)
      default:
        console.log('not implemented title tx', tx)
    }
  }

  async onCreate (ctx: TxContext, create: CreateTx): Promise<any> {
    if (!this.modelDb.is(create._objectClass, CORE_CLASS_VDOC)) {
      return Promise.resolve()
    }
    return this.storage.store(ctx, this.modelDb.newDoc(create._objectClass, create._objectId, create.object))
  }

  onPush (ctx: TxContext, tx: PushTx): Promise<any> {
    if (!this.modelDb.is(tx._objectClass, CORE_CLASS_VDOC)) {
      return Promise.resolve()
    }
    return this.storage.push(ctx, tx._objectClass, tx._objectId, null, tx._attribute, tx._attributes)
  }

  onUpdate (ctx: TxContext, tx: UpdateTx): Promise<any> {
    if (!this.modelDb.is(tx._objectClass, CORE_CLASS_VDOC)) {
      return Promise.resolve()
    }
    return this.storage.update(ctx, tx._objectClass, tx._objectId, null, tx._attributes)
  }
}
