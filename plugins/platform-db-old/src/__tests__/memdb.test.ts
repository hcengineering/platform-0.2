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

import { MemDb } from '../memdb'
import core from '../__resources__/'
import { metaModel } from '../__resources__/model'

describe('memdb', () => {

  it('should load classes into memdb', () => {
    console.log(metaModel)
    const memdb = new MemDb()
    memdb.load(metaModel)
    const object = memdb.get(core.class.Emb)
    expect(object._id).toBe(core.class.Emb)
    expect(object._class).toBe(core.class.Class)
  })
})
