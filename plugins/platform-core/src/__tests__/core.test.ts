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
import corePlugin from '..'
import coreModel from '../__model__'

import { MemDb } from '../memdb'
import { MemSession } from '../session'
import platform from '../platform'

platform.loadStrings(coreModel.strings.ru)
corePlugin.start()

describe('core', () => {

  const memdb = new MemDb()

  it('should load classes', () => {
    memdb.load(coreModel.model)
    const object = memdb.get(core.class.Object)
    expect(object._id).toBe(core.class.Object)
    expect(object._class).toBe(core.class.Class)
  })

  it('verify object implementation', () => {
    const session = new MemSession(memdb)
    const objectClass = session.getInstance(core.class.Object)
    const classClass = session.getInstance(core.class.Class)
    expect(objectClass.getSession()).toBe(session)
    expect(objectClass.getClass()._id).toBe(classClass._id)
    expect(objectClass.toIntlString()).toBe('Объект')
  })

})