//
// Copyright © 2020 Andrey Platov <andrey.v.platov@gmail.com>
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

import { Doc } from '@anticrm/platform-core'
import { Platform } from '@anticrm/platform-core/src/platform'
import { MemSession } from '@anticrm/platform-core/src/session'
import { MemDb } from '@anticrm/platform-core/src/memdb'

class UIPlatform extends Platform {

  readonly session: MemSession
  private memdb: MemDb

  constructor() {
    super()
    this.memdb = new MemDb()
    this.session = new MemSession(this.memdb)
  }

  loadModel(docs: Doc[]) {
    this.memdb.load
  }
}

export default new UIPlatform()
