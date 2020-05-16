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

import { Platform, identify, Plugin, PluginId } from '@anticrm/platform'
import db from '@anticrm/platform-db'
import { Ref, Class, Doc, Emb, Type } from '@anticrm/platform-core'

import core from '../__resources__'
import { metaModel, createClass, newContainer, array, str } from '../__resources__/model'
import { TSession } from '../session'

interface SimpleClass extends Doc {
  s: string
}

const simpleClassId = 'test.simpleClass' as Ref<Class<SimpleClass>>
const simpleClass = createClass(simpleClassId, core.class.Doc, {
  s: str(),
})

interface MyClass extends Doc {
  arrayOfStrings: string[]
}

const myClassId = 'test.myClass' as Ref<Class<MyClass>>
const myClass = createClass(myClassId, core.class.Doc, {
  arrayOfStrings: array(str()),
})

const myClassInstanceId = 'test.myClass.instance' as Ref<MyClass>
const myClassInstance = newContainer(myClassId, {
  _id: myClassInstanceId,
  arrayOfStrings: ['hey', 'there'],
})

const myModel = [simpleClass, myClass, myClassInstance]

describe('session', () => {

  const platform = new Platform()
  platform.addLocation(db, () => import('@anticrm/platform-db/src/memdb'))
  platform.addLocation(core, () => import('../plugin'))
  platform.setResolver('native', core.id)
  const corePlugin = platform.getPlugin(core.id)
  const session = corePlugin.then(plugin => plugin.getSession() as TSession)

  it('should load model', () => {
    return session.then(session => {
      session.loadModel(metaModel)
    })
  })

  it('should get prototype', () => {
    return session.then(session => {
      const objectProto = session.getPrototype(core.class.Doc)
      return objectProto.then(objectProto => {
        expect(objectProto).toBeDefined()

        const baseProto = Object.getPrototypeOf(objectProto)
        expect(baseProto.hasOwnProperty('getSession')).toBe(true)
        expect(baseProto.getSession() === session).toBe(true)

        // expect(objectProto.hasOwnProperty('_class')).toBe(true)
        expect(objectProto.hasOwnProperty('getSession')).toBe(false)
        expect(objectProto.hasOwnProperty('toIntlString')).toBe(true)
        expect(objectProto.hasOwnProperty('getClass')).toBe(true)
        expect(typeof (objectProto as any)['toIntlString']).toBe('function')
      })
    })
  })

  it('should get instances', () => {
    return session.then(session => {
      return Promise.all([
        session.getInstance(core.class.Emb).then(objectClass => {
          expect(typeof objectClass.getSession).toBe('function')
          expect(objectClass.getSession() === session).toBe(true)

          expect(objectClass._id).toBe(core.class.Emb)
          expect(objectClass._native).toBe(core.native.Emb)
          expect(objectClass.getClass()._id).toBe(core.class.Class)
          expect(objectClass.toIntlString()).toBe('doc: class:core.Emb')
        }),
        session.getInstance(core.class.StructuralFeature).then(classClass => {
          expect(classClass._extends).toBe(core.class.Doc)
          expect(classClass.toIntlString()).toBe('doc: class:core.StructuralFeature')

          expect(classClass._attributes._extends._class).toBe(core.class.RefTo)
          const refTo = classClass._attributes._extends.getClass()
          expect(refTo._class).toBe(core.class.Struct)
        }),
      ])
    })
  })

  // it('should narrow class', () => {
  //   expect(session.extends(core.class.Class, core.class.StructuralFeature)).toBe(true)
  //   expect(session.extends(core.class.StructuralFeature, core.class.Class)).toBe(false)
  //   expect(session.narrow(core.class.StructuralFeature, [core.class.Class])).toBe(core.class.Class)
  //   expect(session.narrow(core.class.Doc, [core.class.Class])).toBe(core.class.Class)
  // })

  it('should create instance', async () => {
    const sess = await session
    sess.loadModel(myModel)
    const simpleClass = await sess.getClass(simpleClassId)
    const s = await simpleClass.newInstance({
      _id: 'xxx' as Ref<SimpleClass>,
      s: 'hey there'
    })
    expect(s._id).toBe('xxx')
    expect(s._class).toBe(simpleClassId)
    expect(s.s).toBe('hey there')
  })

  it('should create struct', async () => {
    interface X extends Emb {
      x: string
    }
    const s = await session
    const xClass = await s.createStruct('x.class' as Ref<Class<X>>, core.class.Emb, {
      x: str()
    })
    expect(xClass._id).toBe('x.class')
    const x = await xClass.newInstance({ x: 'hallo' })
    expect(x.x).toBe('hallo')
  })

  it('should create class', async () => {
    const S = await session

    interface Contact extends Doc {
      email?: string
      phone?: string
      phoneWork?: string
      twitter?: string
      address?: string
      addressDelivery?: string
    }

    const contact = identify('contact-test' as PluginId<Plugin>, {
      class: {
        Contact: '' as Ref<Class<Contact>>,
        Email: '' as Ref<Class<Type<string>>>,
        Phone: '' as Ref<Class<Type<string>>>,
        Twitter: '' as Ref<Class<Type<string>>>,
        Address: '' as Ref<Class<Type<string>>>,
      }
    })

    const email = await S.createStruct(contact.class.Email, core.class.Type, {})
    const phone = await S.createStruct(contact.class.Phone, core.class.Type, {})
    const twitter = await S.createStruct(contact.class.Twitter, core.class.Type, {})
    const address = await S.createStruct(contact.class.Address, core.class.Type, {})

    await S.createClass(contact.class.Contact, core.class.Doc, {
      email: await email.newInstance({}),
      phone: await phone.newInstance({}),
      phoneWork: await phone.newInstance({}),
      twitter: await twitter.newInstance({}),
      address: await address.newInstance({}),
      addressDelivery: await address.newInstance({}),
    })

    const contact1Id = 'test.contact.1' as Ref<Contact>
    const contactClass = await S.getClass(contact.class.Contact)
    contactClass.newInstance({
      _id: contact1Id,
      phone: '+7 913 333 5555'
    })

    const contact1 = await S.getInstance(contact1Id)
    expect(contact1.phone).toBe('+7 913 333 5555')
    contact1.phone = '+1 646 667 88 77'
    expect(contact1.phone).toBe('+1 646 667 88 77')
    expect(contact1.email).toBeUndefined()
    contact1.email = 'hey@hey.com'
    expect(contact1.email).toBe('hey@hey.com')
  })

  // it('should work with arrays', () => {
  //   session.loadModel(myModel)
  //   const myInstance = session.getInstance(myClassInstanceId)
  //   expect(myInstance._id).toBe(myClassInstanceId)
  //   expect(myInstance.arrayOfStrings[0]).toBe('hey')
  //   expect(myInstance.arrayOfStrings[1]).toBe('there')
  // })

  // it('should work with mixins', () => {
  //   const myInstance = session.getInstance(myClassInstanceId)
  //   console.log(myInstance.mixins[0])
  // })

})