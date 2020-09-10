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
import { MemDb } from '../memdb'
import { CreateTx, PushTx } from '../core'

export class TxIndex implements Index {
  private modelDb: MemDb
  private storage: Storage

  constructor (modelDb: MemDb, storage: Storage) {
    this.modelDb = modelDb
    this.storage = storage
  }

  onCreate (create: CreateTx): Promise<any> {
    return this.storage.store(create)
  }

  onPush (tx: PushTx): Promise<any> {
    return this.storage.store(tx)
  }
}
