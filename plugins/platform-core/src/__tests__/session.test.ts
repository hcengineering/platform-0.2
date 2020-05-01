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

import core from '../types'

import { getClassMetadata, Model } from '../reflect'
import { MemDb, MemSession } from '../memdb'
import corePlugin, { TObject, TDoc, TClass } from '..'

corePlugin.start()

describe('session', () => {

  const memdb = new MemDb()

  it('should load classes', () => {
    const classes = getClassMetadata([TObject, TDoc, TClass])
    memdb.load(classes)
    const object = memdb.get(core.class.Object)
    expect(object._id).toBe(core.class.Object)
    expect(object._class).toBe(core.class.Class)
  })

  it('should get prototype', () => {
    const session = new MemSession(memdb)
    const objectProto = session.getPrototype(core.class.Object)
    expect(objectProto).toBeDefined()
    expect(objectProto.hasOwnProperty('getSession')).toBe(true)

    const classProto = session.getPrototype(core.class.Class)
    expect(classProto.hasOwnProperty('getSession')).toBe(false)
    expect(classProto.hasOwnProperty('toIntlString')).toBe(true)

    const docProto = Object.getPrototypeOf(classProto)
    const objProto = Object.getPrototypeOf(docProto)
    expect(objProto).toBe(objectProto)
  })

  it('should get instance', () => {
    const session = new MemSession(memdb)
    const objectClass = session.getInstance(core.class.Object)
    expect(objectClass._id).toBe(core.class.Object)
    expect(typeof objectClass.toIntlString).toBe('function')
    expect(typeof objectClass.getSession).toBe('function')

    expect(objectClass.getSession()).toBe(session)
    expect(objectClass.getClass()._id).toBe(core.class.Class)
  })

})