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

import { MemDb, Plugin, Service, Ref, Class, Mixin, Resource, identify } from '..'
import { Doc, ClassifierKind } from '../core'

describe('memdb', () => {
  const domainName = 'testdomain'
  const memdb = new MemDb(domainName)

  const test = identify('test' as Plugin<Service>, {
    class: {
      Class: '' as Ref<Class<Class<Doc>>>,
      Mixin: '' as Ref<Class<Mixin<Doc>>>,
      DomainDoc: '' as Ref<Class<Doc>>,
      ExtendDomainDoc: '' as Ref<Class<Doc>>,
      NoDomainDoc: '' as Ref<Class<Doc>>,
      MixableDoc: '' as Ref<Class<Doc>>,
      MixinDoc: '' as Ref<Mixin<Doc>>,
      MixinDoc2: '' as Ref<Mixin<Doc>>
    }
  })

  const metaClass = {
    _class: test.class.Class,
    _id: test.class.Class,
    _kind: ClassifierKind.CLASS,
    _attributes: {}
  }

  const metaMixin = {
    _class: test.class.Class,
    _id: test.class.Mixin,
    _kind: ClassifierKind.MIXIN,
    _attributes: {}
  }

  const domainDoc = {
    _class: test.class.Class,
    _id: test.class.DomainDoc,
    _extends: test.class.Class,
    _domain: domainName,
    _attributes: { attribute1: '', attribute2: '' }
  }

  const extendDomainDoc = {
    _class: test.class.Class,
    _id: test.class.ExtendDomainDoc,
    _extends: test.class.DomainDoc,
    _attributes: { extendAttribute1: '', extendAttribute2: '' }
  }

  const noDomainDoc = {
    _class: test.class.Class,
    _id: test.class.NoDomainDoc,
    _extends: test.class.Class
  }

  const mixinDoc = {
    _class: test.class.Class,
    _id: test.class.MixinDoc,
    _extends: test.class.Mixin,
    _domain: domainName,
    _kind: ClassifierKind.MIXIN,
    _attributes: { mixinAttribute1: '' }
  }

  const mixinDoc2 = {
    _class: test.class.Class,
    _id: test.class.MixinDoc2,
    _extends: test.class.Mixin,
    _domain: domainName,
    _kind: ClassifierKind.MIXIN,
    _attributes: { mixinAttribute1: '' } // the same attribute as in mixinDoc!
  }

  const mixableDoc = {
    _class: test.class.Class,
    _id: test.class.MixableDoc,
    _extends: test.class.Class,
    _attributes: {}
  }

  const expectedMemdbContents = [metaClass, metaMixin, domainDoc, extendDomainDoc, noDomainDoc, mixinDoc, mixableDoc, mixinDoc2]

  it('should add and get object', () => {
    memdb.add(metaClass)
    expect(memdb.get(metaClass._id)).toBe(metaClass)
  })

  it('should fail to add object twice', () => {
    expect(() => memdb.add(metaClass)).toThrowError('document added already ' + metaClass._id)
  })

  it('should fail to get non existing object', () => {
    expect(() => memdb.get(domainDoc._id)).toThrowError('document not found ' + domainDoc._id)
  })

  it('should index all and find object', () => {
    memdb.add(metaMixin)
    const found: Doc[] = memdb.findSync(test.class.Class, {})
    expect(found.length).toBe(2)
    expect(found[0]).toBe(metaClass)
    expect(found[1]).toBe(metaMixin)
  })

  it('should get domain', () => {
    memdb.add(domainDoc)
    expect(memdb.getDomain(test.class.DomainDoc)).toBe(domainDoc._domain)
  })

  it('should get domain from extending class', () => {
    memdb.add(extendDomainDoc)
    expect(memdb.getDomain(test.class.ExtendDomainDoc)).toBe(domainDoc._domain)
  })

  it('should fail to get domain', () => {
    memdb.add(noDomainDoc)
    expect(() => memdb.getDomain(test.class.NoDomainDoc)).toThrowError('no domain found for class: ' + test.class.NoDomainDoc)
  })

  it('should get extending class', () => {
    expect(memdb.getClass(test.class.ExtendDomainDoc)).toBe(test.class.Class)
  })

  it('should fail to get class', () => {
    expect(() => memdb.getClass(test.class.Mixin)).toThrowError('class not found in hierarchy: ' + test.class.Mixin)
  })

  it('should assign', () => {
    const layout = { key1: 'value1' as Resource<string> }
    const assignValues = {
      _underscore: 'underscoreValue' as Resource<string>,
      attribute1: 'attributeValue1' as Resource<string>,
      attribute2: 'attributeValue2' as Resource<string>,
      extendAttribute1: 'extendAttributeValue1' as Resource<string>
    }
    memdb.assign(layout, test.class.ExtendDomainDoc, assignValues)
    expect(layout.key1).toBe('value1')
    expect(layout._underscore).toBe('underscoreValue')
    expect(layout.attribute1).toBe('attributeValue1')
    expect(layout.attribute2).toBe('attributeValue2')
    expect(layout.extendAttribute1).toBe('extendAttributeValue1')
  })

  it('should fail to find attribute on assign', () => {
    const layout = { key1: 'value1' as Resource<string> }
    const assignValue = { badAttribute: 'badValue' as Resource<string> }
    expect(() => memdb.assign(layout, test.class.ExtendDomainDoc, assignValue)).toThrowError('attribute not found: badAttribute')
  })

  it('should create document', () => {
    const doc: Doc = memdb.createDocument(test.class.DomainDoc, { attribute1: 'value1', _underscore: 'underscoreValue' })
    expect(doc._class).toBe(test.class.DomainDoc)
    expect(doc._id).toBeDefined()
    expect(doc._id.length).toBeGreaterThan(0)
    expect(doc._mixins).toBeUndefined()
    expect(doc._underscore).toBe('underscoreValue')
    expect(doc.attribute1).toBe('value1')
  })

  it('should make mixin instance', () => {
    memdb.add(mixinDoc)
    const doc: Doc = memdb.createDocument(test.class.DomainDoc, { attribute1: 'value1', attribute2: 'value2', _underscore: 'underscoreValue' })
    memdb.mixinDocument(doc, test.class.MixinDoc, { mixinAttribute1: 'mixinValue1', _mixinUnderscore: 'mixinUnderscoreValue' })

    expect(doc._class).toBe(test.class.DomainDoc)
    expect(doc._id).toBeDefined()
    expect(doc._id.length).toBeGreaterThan(0)
    expect(doc._mixins?.length).toBe(1)
    expect(doc._mixins[0]).toBe(test.class.MixinDoc)
    expect(doc._underscore).toBe('underscoreValue')
    expect(doc.attribute1).toBe('value1')
    expect(doc.attribute2).toBe('value2')
    expect(doc._mixinUnderscore).toBe('mixinUnderscoreValue')
    expect(doc['mixinAttribute1|class:test~MixinDoc']).toBe('mixinValue1')
  })

  it('should make mixin class', () => {
    memdb.add(mixableDoc)
    memdb.mixin(mixableDoc._id, test.class.MixinDoc as Ref<Mixin<Class<Doc>>>, { mixinAttribute1: 'mixinValue1', _mixinUnderscore: 'mixinUnderscoreValue' })

    expect(mixableDoc._mixins).toBeDefined()
    expect(mixableDoc._mixins.length).toBe(1)
    expect(mixableDoc._mixins[0]).toBe(test.class.MixinDoc)
    expect(mixableDoc._mixinUnderscore).toBe('mixinUnderscoreValue')
    expect(mixableDoc['mixinAttribute1|class:test~MixinDoc']).toBe('mixinValue1')
  })

  it('should make double mixin', () => {
    memdb.add(mixinDoc2)

    const doc: Doc = memdb.createDocument(test.class.DomainDoc, {})
    memdb.mixinDocument(doc, test.class.MixinDoc, { mixinAttribute1: 'mixinValue1', _mixinUnderscore: 'mixinUnderscoreValue' })
    memdb.mixinDocument(doc, test.class.MixinDoc2, { mixinAttribute1: 'mixinValue2' })

    expect(doc._mixins?.length).toBe(2)
    expect(doc._mixins[0]).toBe(test.class.MixinDoc)
    expect(doc._mixins[1]).toBe(test.class.MixinDoc2)
    expect(doc._mixinUnderscore).toBe('mixinUnderscoreValue')
    expect(doc['mixinAttribute1|class:test~MixinDoc']).toBe('mixinValue1')
    expect(doc['mixinAttribute1|class:test~MixinDoc2']).toBe('mixinValue2')
  })

  it("should check 'is' method", () => {
    expect(memdb.is(test.class.ExtendDomainDoc, test.class.Mixin)).toBeFalsy()
    expect(memdb.is(test.class.ExtendDomainDoc, test.class.Class)).toBeTruthy()
  })

  it('should dump all contents', () => {
    expect(memdb.dump()).toEqual(expectedMemdbContents)
  })

  it('should fail to load domain', () => {
    const loadDomain = memdb.loadDomain('WrongDomain')
    expect(loadDomain).toBeInstanceOf(Promise)

    return loadDomain.then(docs => { // eslint-disable-line
      fail('not expected successul loadDomain() call')
    }).catch(err => {
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toBe('domain does not match')
    })
  })

  it('should load domain', () => {
    return memdb.loadDomain(domainName).then(docs => {
      expect(docs).toEqual(expectedMemdbContents)
    })
  })

  it('should load model', () => {
    const doc1 = memdb.createDocument(test.class.DomainDoc, {})
    const doc2 = memdb.createDocument(test.class.DomainDoc, {})
    const doc3 = memdb.createDocument(test.class.DomainDoc, {})

    memdb.loadModel([doc1, doc2, doc3])
    expect(memdb.get(doc1._id)).toBe(doc1)
    expect(memdb.get(doc2._id)).toBe(doc2)
    expect(memdb.get(doc3._id)).toBe(doc3)
  })

  it('should fail to create transaction', () => {
    expect(() => memdb.tx()).toThrowError('memdb is read only')
  })
})
