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

import { Class, Doc, DomainIndex, Model, Ref, Storage, Tx, TxContext } from '@anticrm/core'
import domains from '..'
import { ObjectTx } from '../tx'
/**
 * Index to pass through a specified class to storage.
 */
export class PassthroughsIndex implements DomainIndex {
  protected readonly modelDb: Model
  protected readonly storage: Storage
  private readonly matchClass: Ref<Class<Doc>>

  constructor (modelDb: Model, storage: Storage, matchClass: Ref<Class<Doc>>) {
    this.modelDb = modelDb
    this.storage = storage
    this.matchClass = matchClass
  }

  async tx (ctx: TxContext, tx: Tx): Promise<any> {
    switch (tx._class) {
      case domains.class.CreateTx:
      case domains.class.UpdateTx:
      case domains.class.DeleteTx:
        if (!this.modelDb.is((tx as ObjectTx)._objectClass, this.matchClass)) {
          return await Promise.resolve()
        }
        return await this.storage.tx(ctx, tx)
      default:
        console.log('not implemented tx', tx)
    }
  }
}
