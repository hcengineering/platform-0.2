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

import { MemDb, Plugin, Service, Ref, Class, Resource, identify } from '..'
import { Doc, Property, core, Obj, ClassifierKind } from '../core'

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
    _domain: 'domain1',
    _kind: ClassifierKind.CLASS,
    _attributes: { attribute1: '', attribute2: '' }
  }

  const extendDomainDoc = {
    _class: test.class.Class,
    _id: test.class.Doc2,
    _extends: domainDoc._id,
    _attributes: { extendAttribute1: '', extendAttribute2: '' }
  }

  const noDomainDoc = {
    _class: test.class.Class,
    _id: test.class.Doc3
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
    memdb.add(noDomainDoc)
    expect(() => memdb.getDomain(noDomainDoc._id)).toThrowError('no domain found for class: ' + noDomainDoc._id)
  })

  it('should get extending class', () => {
    expect(memdb.getClass(extendDomainDoc._id)).toBe(domainDoc._id)
  })

  it('should fail to get class', () => {
    expect(() => memdb.getClass(noDomainDoc._id)).toThrowError('class not found in hierarchy: ' + noDomainDoc._id)
  })

  it('should assign', () => {
    const layout = { key1: 'value1' as Resource<string> }
    const assignValues = {
      _underscore: 'underscoreValue' as Resource<string>,
      attribute1: 'attributeValue1' as Resource<string>,
      attribute2: 'attributeValue2' as Resource<string>,
      extendAttribute1: 'extendAttributeValue1' as Resource<string>
    }
    memdb.assign(layout, extendDomainDoc._id, assignValues)
    expect(layout.key1).toBe('value1')
    expect(layout._underscore).toBe('underscoreValue')
    expect(layout.attribute1).toBe('attributeValue1')
    expect(layout.attribute2).toBe('attributeValue2')
    expect(layout.extendAttribute1).toBe('extendAttributeValue1')
  })

  it('should fail to find attribute on assign', () => {
    const layout = { key1: 'value1' as Resource<string> }
    const assignValue = { badAttribute: 'badValue' as Resource<string> }
    expect(() => memdb.assign(layout, extendDomainDoc._id, assignValue)).toThrowError('attribute not found: badAttribute')
  })
})
