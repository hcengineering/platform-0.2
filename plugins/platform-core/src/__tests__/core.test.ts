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

/* eslint-env jest */

import { Platform } from '@anticrm/platform'
import model from '../__model__/model'
import Builder from '../__model__/builder'
import core from '../__model__'
import rpcStub from '@anticrm/platform-rpc-stub'
import { AdapterType } from '..'

const DOC = 1 // see `plugin.ts`

describe('core', () => {
  const platform = new Platform()

  it('should build model', async () => {
    const builder = new Builder()
    builder.load(model)
    const coreModel = builder.dump()
    platform.setMetadata(rpcStub.metadata.Metamodel, coreModel)
    platform.addLocation(rpcStub, () => import('@anticrm/platform-rpc-stub/src/plugin'))
    platform.addLocation(core, () => import('@anticrm/platform-core/src/plugin'))
    expect(coreModel.length).toBeGreaterThan(0)
  })

  // it('should create prototype', async () => {
  //   const plugin = await platform.getPlugin(core.id)
  //   const tx = plugin.newSession()

  //   const typeProto = await tx.getPrototype(core.class.Type, DOC)
  //   expect((typeProto as Object).hasOwnProperty('exert')).toBe(true)

  //   const rtProto = await tx.getPrototype(core.class.StaticResource, DOC)
  //   expect((rtProto as Object).hasOwnProperty('constructor')).toBe(true)

  //   const rtProtoProto = Object.getPrototypeOf(rtProto)
  //   expect(typeProto).toBe(rtProtoProto)

  //   const bagProto = await tx.getPrototype(core.class.BagOf, DOC)
  //   expect((bagProto as Object).hasOwnProperty('of')).toBe(true)

  //   tx.close()
  // })

  // it('should instantiate class', async () => {
  //   const plugin = await platform.getPlugin(core.id)
  //   const tx = plugin.newSession()

  //   const inst = await tx.getInstance(core.class.RefTo)
  //   const x = inst._attributes
  //   const to = await x.to
  //   // TODO: understand problem
  //   expect((to as any)._class).toBe(core.class.RefTo)
  //   //    expect((inst._attributes.to as Instance<Emb>)._class).toBe(core.class.RefTo)
  //   tx.close()
  // })

  // it('should find classes', async () => {
  //   const plugin = await platform.getPlugin(core.id)
  //   const tx = plugin.newSession()

  //   const result = await tx.find(core.class.Class, {})
  //   const model = await result.all()
  //   expect(model.length).toBeGreaterThan(0)
  //   tx.close()
  // })

  it('should perform live query', async (done) => {
    expect.assertions(2)
    const plugin = await platform.getPlugin(core.id)
    const session = plugin.newSession()
    let n = 0
    session.query(core.class.Adapter, {}, adapters => {
      switch (n) {
        case 0:
          expect(adapters.length).toBe(0)
          ++n
          return
        case 1:
          expect(adapters.length).toBe(1)
          done()
          return
        default:
          console.log('default')
      }
    })
    const x = await session.newInstance(core.class.Adapter, {
      from: core.class.Adapter,
      to: core.class.Adapter,
      adapt: '' as unknown as Promise<AdapterType>
    })
    await session.commit()
  })
})
