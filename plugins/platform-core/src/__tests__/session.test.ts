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

import core, { Ref, Class, Obj } from '../types'
// import { getClassMetadata, model, loadConstructors } from '../reflect'
import { MemDb } from '../memdb'
import { MemSession } from '../session'
import coreModel from '../__model__'
import corePlugin from '..'
import platform from '../platform'

corePlugin.start()

describe('session', () => {

  const memdb = new MemDb()
  console.log(JSON.stringify(coreModel.model))//, undefined, 2))
  memdb.load(coreModel.model)

  it('should load classes', () => {
    const object = memdb.get(core.class.Object)
    expect(object._id).toBe(core.class.Object)
    expect(object._class).toBe(core.class.Class)
  })

  it('should get prototype', () => {
    const session = new MemSession(memdb)
    const objectProto = session.getPrototype(core.class.Object)
    expect(objectProto).toBeDefined()
    expect(objectProto.hasOwnProperty('getSession')).toBe(true)
    expect(objectProto.hasOwnProperty('toIntlString')).toBe(true)
    expect(objectProto.toIntlString).toBe(core.method.Obj_toIntlString)

    const classProto = session.getPrototype(core.class.Class)
    expect(classProto.hasOwnProperty('getSession')).toBe(false)
    expect(classProto.hasOwnProperty('toIntlString')).toBe(true)
    expect(classProto.toIntlString).toBe(core.method.Class_toIntlString)

    const docProto = Object.getPrototypeOf(classProto)
    const objProto = Object.getPrototypeOf(docProto)
    expect(objProto).toBe(objectProto)
  })

  it('should get instances', () => {
    const session = new MemSession(memdb)
    const objectClass = session.getInstance(core.class.Object)
    expect(objectClass._id).toBe(core.class.Object)
    expect(typeof objectClass.getSession).toBe('function')
    expect(objectClass.getSession() === session).toBe(true)
    expect(typeof objectClass.getClass).toBe('function')
    expect(objectClass.getClass()._id).toBe(core.class.Class)

    const method = objectClass.toIntlString // temp
    if (method) {
      expect(platform.invoke(objectClass, method)).toBe(core.class.Object)
    } else {
      expect(true).toBe(false)
    }

  })

  // const test = platform.identify('test', {
  //   class: {
  //     ToBeMixed: '' as Ref<Class<ToBeMixed>>
  //   }
  // })

  // @model.Mixin(test.class.ToBeMixed, core.class.Class)
  // class ToBeMixed extends TClass<Obj> {
  //   dummy!: number
  // }

  // memdb.load(getClassMetadata([ToBeMixed]))
  // loadConstructors(test.class, {
  //   ToBeMixed
  // })

  // it('should mix object in', () => {
  //   const session = new MemSession(memdb)
  //   const mixin = session.mixin(core.class.Object, test.class.ToBeMixed)
  //   // console.log(mixin)
  //   expect(mixin._id).toBe(core.class.Object)
  //   expect(mixin._class).toBe(test.class.ToBeMixed)
  //   // expect(mixin.getClass()._id).toBe(test.class.ToBeMixed)
  //   // expect(mixin.toIntlString()).toBe(test.class.ToBeMixed)
  // })

})