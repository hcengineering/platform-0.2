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

import { Doc, Session, Instance, Obj, Type, PropertyType } from '@anticrm/platform-core'
import { Platform } from '@anticrm/platform-core/src/platform'
import { MemSession } from '@anticrm/platform-core/src/session'
import { MemDb } from '@anticrm/platform-core/src/memdb'
import { attributeLabelId } from '@anticrm/platform-core/src/utils'

class UIPlatform extends Platform {

  private memSession: MemSession
  private memdb: MemDb

  constructor() {
    super()
    this.memdb = new MemDb()
    this.memSession = new MemSession(this.memdb)
  }

  get session(): Session { return this.memSession }

  loadModel(docs: Doc[]) {
    this.memdb.load
  }

  ///

  getAttrModel(object: Instance<Obj>, props: string[]) {
    const attributes = object.getClass().attributes
    return props.map(key => ({
      key,
      type: attributes[key],
      label: this.translate(attributeLabelId(object._class, key)),
      placeholder: 'Placeholder',
    }))
  }
}

export default new UIPlatform()
