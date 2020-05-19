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

import { Tx } from '../plugin'
import model from '../__model__/model'
import core from '../__model__'

describe('core', () => {

  it('should ...', () => {
    const tx = new Tx()
    const loaded = model(tx)
    expect(true).toBe(true)
  })

  it('should instantiate class', () => {
    const tx = new Tx()
    const loaded = model(tx)

    const objClass = tx.get(core.class.Obj)
    const instance = tx.instantiate(objClass)
    console.log(instance)
    console.log(instance._id)
  })

})
