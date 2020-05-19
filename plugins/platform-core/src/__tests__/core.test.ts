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

import { Platform } from '@anticrm/platform'
import startPlugin from '../plugin'
import model from '../__model__/model'
import core from '../__model__'

describe('core', () => {

  const platform = new Platform()

  it('should ...', async () => {
    const tx = await startPlugin(platform)
    const loaded = model(tx)
    expect(true).toBe(true)
    console.log(JSON.stringify(loaded, null, 2))
    console.log(JSON.stringify(loaded))
  })

  it('should create prototype', async () => {
    const tx = await startPlugin(platform)
    const loaded = model(tx)

    const typeProto = tx.getPrototype(core.class.Type)
    console.log(typeProto)

    const rtProto = tx.getPrototype(core.class.ResourceType)
    console.log(rtProto)

    const rtProtoProto = Object.getPrototypeOf(rtProto)
    expect(typeProto).toBe(rtProtoProto)

    const classRefTo = tx.get(core.class.InstanceOf)
    const to = classRefTo._attributes.of

    const inst = tx.instantiate(to)
    const refToProto = Object.getPrototypeOf(inst)
    expect(refToProto).toBe(tx.getPrototype(core.class.RefTo))
  })

  it('should instantiate class', async () => {
    const tx = await startPlugin(platform)
    const loaded = model(tx)

    const classRefTo = tx.get(core.class.RefTo)

    const inst = tx.instantiate(classRefTo)
    console.log(inst)
    console.log(inst._attributes)
    console.log(inst._attributes.to)
    expect(inst._attributes.to._class).toBe(core.class.RefTo)
  })

})

