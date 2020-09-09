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
import { Doc, Property, core, Obj } from '../core'

describe('memdb', () => {
  const memdb = new MemDb('testdomain')

  const test = identify('test' as Plugin<Service>, {
    class: {
      Class: '' as Ref<Class<Class<Doc>>>,
      Doc1: '' as Ref<Class<Doc>>,
      Doc2: '' as Ref<Class<Doc>>,
      Doc3: '' as Ref<Class<Doc>>,
    }
  })

  const metaClass = {
    _class: test.class.Class,
    _id: test.class.Class,
    _domain: 'testdomain'
  }

  const domainDoc = {
    _class: test.class.Class,
    _id: test.class.Doc1,
    _domain: 'domain1'
  }

  const noDomainDoc = {
    _class: test.class.Class,
    _id: test.class.Doc2
  }

  const extendDomainDoc = {
    _class: test.class.Class,
    _id: test.class.Doc3,
    _extends: domainDoc._id
  }

  it('should add and get object', () => {
    memdb.add(metaClass)
    expect(memdb.get(metaClass._id)).toBe(metaClass)
  })

  it('should fail to add object twice', () => {
    expect(() => memdb.add(metaClass)).toThrowError('document added already ' + metaClass._id)
  })

  it('should fail to get non existing object', () => {
    const badId = 'class:test.BadDoc' as Ref<Doc>
    expect(() => memdb.get(badId)).toThrowError('document not found ' + badId)
  })

  it('should index all and find object', () => {
    memdb.add(domainDoc)
    const found: Doc[] = memdb.findSync(domainDoc._class, {})
    expect(found.length).toBe(2)
    expect(found[0]).toBe(metaClass)
    expect(found[1]).toBe(domainDoc)
  })

  it('should get domain', () => {
    expect(memdb.getDomain(domainDoc._id)).toBe(domainDoc._domain)
  })

  it('should get domain from extending class', () => {
    memdb.add(extendDomainDoc)
    expect(memdb.getDomain(extendDomainDoc._id)).toBe(domainDoc._domain)
  })

  it('should fail to get domain', () => {
    const badId = 'class:test.BadDoc' as Ref<Class<Doc>>
    expect(() => memdb.getDomain(badId)).toThrowError('no domain found for class: ' + badId)
  })
})
