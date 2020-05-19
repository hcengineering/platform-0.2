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
import { NumberProperty } from '..'

describe('core', () => {

  it('should ...', () => {
    const tx = new Tx()
    const loaded = model(tx)
    expect(true).toBe(true)
    // console.log(JSON.stringify(loaded, null, 2))
  })

  it('should create prototype', () => {
    const tx = new Tx()
    const loaded = model(tx)

    const proto = tx.getPrototype(core.class.Type)
    console.log(proto)

  })

  it('should get RefTo prototype', () => {
    const tx = new Tx()
    const loaded = model(tx)

    const classRefTo = tx.get(core.class.InstanceOf)
    const to = classRefTo._attributes.of

    const inst = tx.instantiate(to)
    console.log(inst)

    // const proto = tx.getPrototype(core.class.InstanceOf)
    // console.log(proto)

    //    console.log(Object.getPrototypeOf(proto))

  })

  // it('should create konstructor', () => {
  //   const tx = new Tx()
  //   const loaded = model(tx)

  //   const ctor = tx.getKonstructor(core.class.Type)

  //   const type = new ctor({ _default: 55 as NumberProperty<number> })
  //   console.log(type)
  //   console.log(type._default)

  // })

})
