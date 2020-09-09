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

import { MemDb, Plugin, Service, Ref, Class, identify } from '..'
import { Doc, Property, core } from '../core'

describe('memdb', () => {
  const memdb = new MemDb('testdomain')

  const test = identify('test' as Plugin<Service>, {
    class: {
      Class: '' as Ref<Class<Class<Doc>>>,
      TestDoc: '' as Ref<Class<Doc>>
    }
  })

  const classDoc: Doc = {
    _class: test.class.Class,
    _id: test.class.Class
  }

  it('should add and get object', () => {
    memdb.add(classDoc)
    expect(memdb.get(classDoc._id)).toBe(classDoc)
  })

  it('should fail to add object twice', () => {
    expect(() => memdb.add(classDoc)).toThrowError('document added already ' + classDoc._id)
  })

  it('should fail to get non existing object', () => {
    const badId = 'class:test.BadDoc' as Ref<Doc>
    expect(() => memdb.get(badId)).toThrowError('document not found ' + badId)
  })

  it('should index all and find object', () => {
    const testDoc: Doc = {
      _class: test.class.Class,
      _id: test.class.TestDoc
    }
    memdb.add(testDoc)
    const found: Doc[] = memdb.findSync(testDoc._class, {})
    expect(found.length).toBe(2)
    expect(found[0]).toBe(classDoc)
    expect(found[1]).toBe(testDoc)
  })
})
