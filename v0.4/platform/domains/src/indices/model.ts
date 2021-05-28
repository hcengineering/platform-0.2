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

import { TransactionProtocol, Model, MODEL_DOMAIN, Storage, Tx, TxContext } from '@anticrm/core'
import domains, { ObjectTx } from '..'
import { ItemTx } from '../tx'

/**
 * Perform model update and forward updates into chained storage if required.
 */
export class ModelIndex implements TransactionProtocol {
  private readonly storage: Storage
  private readonly model: Model

  constructor (model: Model, storage: Storage) {
    this.model = model
    this.storage = storage
  }

  async tx (ctx: TxContext, tx: Tx): Promise<any> {
    switch (tx._class) {
      case domains.class.CreateTx:
      case domains.class.UpdateTx:
      case domains.class.DeleteTx:
        if (this.model.getDomain((tx as ObjectTx)._objectClass) !== MODEL_DOMAIN) {
          return
        }
        return await this.storage.tx(ctx, tx)
      case domains.class.AddItemTx:
      case domains.class.UpdateItemTx:
      case domains.class.RemoveItemTx:
        if (this.model.getDomain((tx as ItemTx)._objectClass) !== MODEL_DOMAIN) {
          return
        }
        return await this.storage.tx(ctx, tx)
      default:
        console.log('not implemented model tx', tx)
    }
  }
}
