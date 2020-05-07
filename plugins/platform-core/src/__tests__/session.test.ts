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

import { Platform } from '@anticrm/platform'
import { Ref, Class, Doc, ArrayOf } from '@anticrm/platform-core'
import { modelFromEvents } from '../__model__/utils'

import core from '../__model__/id'
import coreModel, { createClass, typeString, newInstance, typeMixins } from '../__model__'
import corePlugin from '../plugin'

interface MyClass extends Doc {
  arrayOfStrings: string[]
  mixins: string[]
}

const myClassId = 'test.myClass' as Ref<Class<MyClass>>
const myClass = createClass(myClassId, core.class.Doc, {
  arrayOfStrings: new ArrayOf(typeString()),
  mixins: typeMixins()
})

const myClassInstanceId = 'test.myClass.instance' as Ref<MyClass>
const myClassInstance = newInstance(myClassId, {
  _id: myClassInstanceId,
  arrayOfStrings: ['hey', 'there'],
  mixins: ['mix1', 'mix2']
})

const myModel = [myClass, myClassInstance]

describe('session', () => {

  const platform = new Platform()
  const session = corePlugin(platform)
  corePlugin(platform)

  const model = modelFromEvents(coreModel.events)
  // console.log(JSON.stringify(model, undefined, 2))
  session.loadModel(model)

  it('should get prototype', () => {
    const objectProto = (session as any).getPrototype(core.class.Object)
    expect(objectProto).toBeDefined()

    const baseProto = Object.getPrototypeOf(objectProto)
    expect(baseProto.hasOwnProperty('getSession')).toBe(true)
    expect(baseProto.getSession() === session).toBe(true)

    expect(objectProto.hasOwnProperty('_class')).toBe(true)
    expect(objectProto.hasOwnProperty('getSession')).toBe(false)
    expect(objectProto.hasOwnProperty('toIntlString')).toBe(true)
    expect(objectProto.hasOwnProperty('getClass')).toBe(true)
    expect(typeof objectProto.toIntlString).toBe('function')
  })

  it('should get instances', () => {
    const objectClass = session.getInstance(core.class.Object)
    expect(typeof objectClass.getSession).toBe('function')
    expect(objectClass.getSession() === session).toBe(true)
    expect(objectClass._id).toBe(core.class.Object)
    expect(objectClass.native).toBe(core.native.Object)

    expect(objectClass.attributes._class._class).toBe(core.class.RefTo)

    const classClass = session.getInstance(core.class.Class)
    expect(classClass.extends).toBe(core.class.Doc)
    expect(objectClass.getClass()._id).toBe(core.class.Class)
  })

  it('should work with arrays', () => {
    session.loadModel(myModel)
    const myInstance = session.getInstance(myClassInstanceId)
    expect(myInstance._id).toBe(myClassInstanceId)
    expect(myInstance.arrayOfStrings[0]).toBe('hey')
    expect(myInstance.arrayOfStrings[1]).toBe('there')
  })

  it('should work with mixins', () => {
    const myInstance = session.getInstance(myClassInstanceId)
    console.log(myInstance.mixins[0])
  })

})