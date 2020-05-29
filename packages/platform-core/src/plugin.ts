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

import { Platform, Resource } from '@anticrm/platform'
import core, {
  CoreService, Obj, Ref, Class, Doc, BagOf, InstanceOf, PropertyType,
  Instance, Type, Emb, ResourceType, Exert
} from '.'
import { MemDb } from './memdb'

type Konstructor<T extends Obj> = new (obj: Omit<T, '__property' | '_class'>) => Instance<T>

export function attributeKey (_class: Ref<Class<Obj>>, key: string): string {
  const index = _class.indexOf(':')
  return _class.substring(index + 1) + '/' + key
}

console.log('PLUGIN: parsed core')
/*!
 * Anticrm Platform™ Core Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform): Promise<CoreService> => {
  console.log('PLUGIN: started core')

  enum Stereotype {
    EMB,
    DOC
  }

  // C L A S S E S

  // function getOwnAttribute (clazz: Class<Obj>, key: string): Type<any> | undefined {
  //   return (clazz._attributes as any)[key]
  // }

  // function getAttribute (clazz: Class<Obj>, key: string): Type<any> | undefined {
  //   return getOwnAttribute(clazz, key) ??
  //     (clazz._extends ? getAttribute(get(clazz._extends), key) : undefined)
  // }


  // D A T A

  const modelDb = new MemDb()

  // C O R E  S E R V I C E

  const coreService: CoreService = {
    getDb () { return modelDb },
    getClassHierarchy (cls: Ref<Class<Obj>>) { return modelDb.getClassHierarchy(cls) },

    getPrototype,
    getInstance,
    as,
    is,
  }

  // I N S T A N C E S

  const konstructors = new Map<Ref<Class<Obj>>, Konstructor<Obj>>()
  const prototypes = new Map<Ref<Class<Obj>>, Object>()

  const CoreRoot = {
    get _class (this: Instance<Obj>) { return this.__layout._class },
    getSession: (): CoreService => coreService
  }

  function getPrototype<T extends Obj> (_class: Ref<Class<T>>, stereotype: Stereotype): Object {
    const prototype = prototypes.get(_class)
    if (prototype) { return prototype }

    const clazz = modelDb.get(_class) as Class<Obj>
    const parent = clazz._extends ? getPrototype(clazz._extends, stereotype) : CoreRoot
    const proto = Object.create(parent)
    prototypes.set(_class, proto)

    if (clazz._native) {
      const native = platform.getResource(clazz._native) // TODO: must `resolve`! we need to have getPrototype async for this.
      if (!native) { throw new Error(`something went wrong, can't load '${clazz._native}' resource`) }
      const descriptors = Object.getOwnPropertyDescriptors(native)
      Object.defineProperties(proto, descriptors)
    }

    const attributes = clazz._attributes as { [key: string]: Type<any> }
    for (const key in attributes) {
      if (key === '_default') { continue } // we do not define `_default`'s type, it's infinitevely recursive :)
      const attr = attributes[key]
      // console.log(attr)
      const attrInstance = instantiateEmb(attr)
      // console.log(attrInstance)

      if (typeof attrInstance.exert !== 'function') {
        throw new Error('exert is not a function')
      }

      const exert = attrInstance.exert()
      const fullKey = stereotype === Stereotype.DOC ?
        key.startsWith('_') ? key : attributeKey(_class, key) :
        key

      Object.defineProperty(proto, key, {
        get (this: Instance<Obj>) {
          return exert(Reflect.get(this.__layout, fullKey), this.__layout, key)
        },
        enumerable: true
      })
    }
    return proto
  }

  function getKonstructor<T extends Obj> (_class: Ref<Class<T>>, stereotype: Stereotype): Konstructor<T> {
    const konstructor = konstructors.get(_class)
    if (konstructor) { return konstructor as unknown as Konstructor<T> }
    else {
      const proto = getPrototype(_class, stereotype)
      const ctor = {
        [_class]: function (this: Instance<Obj>, obj: Obj) {
          this.__layout = obj
        }
      }[_class] // A trick to `name` function as `_class` value
      proto.constructor = ctor
      ctor.prototype = proto
      konstructors.set(_class, ctor as unknown as Konstructor<Obj>)
      return ctor as unknown as Konstructor<T>
    }
  }

  function instantiateEmb<T extends Emb> (obj: T): Instance<T> {
    const ctor = getKonstructor(obj._class, Stereotype.EMB)
    return new ctor(obj)
  }

  function instantiateDoc<T extends Doc> (obj: T): Instance<T> {
    const ctor = getKonstructor(obj._class, Stereotype.DOC)
    return new ctor(obj)
  }

  // A P I : R E A D

  async function getInstance<T extends Doc> (id: Ref<T>): Promise<Instance<T>> {
    const doc = modelDb.get(id)
    return instantiateDoc(doc)
  }

  function as<T extends Doc, A extends Doc> (doc: Instance<T>, _class: Ref<Class<A>>): Instance<A> {
    console.log('as: ' + _class)
    console.log(doc)
    if (!is(doc, _class)) { throw new Error(_class + ' instance does not mixed in') }
    const ctor = getKonstructor(_class, Stereotype.DOC)
    return new ctor(doc.__layout as unknown as A)
  }

  function is<T extends Doc, M extends Doc> (doc: Instance<T>, _class: Ref<Class<M>>): boolean {
    const mixins = doc._mixins as Ref<Class<Doc>>[]
    return mixins && mixins.includes(_class as Ref<Class<Doc>>)
  }

  // T Y P E S : B A G

  class BagProxyHandler implements ProxyHandler<any> {
    private exert: Exert

    constructor(type: Instance<Type<any>>) {
      if (!type.exert) {
        throw new Error('bagof: no exert')
      }
      this.exert = type.exert()
    }

    get (target: any, key: string): any {
      return this.exert(Reflect.get(target, key))
    }
  }

  const Type_exert = function (this: Instance<Type<any>>): Exert {
    return value => value
  }

  const BagOf_exert = function (this: Instance<BagOf<any>>): Exert {
    return (value: PropertyType) => new Proxy(value, new BagProxyHandler(this.of))
  }

  const InstanceOf_exert = function (this: Instance<InstanceOf<Emb>>): Exert {
    return ((value: Emb) => instantiateEmb(value)) as Exert
  }

  const TResourceType = {
    exert: function (this: Instance<ResourceType<any>>): Exert {
      const resource = (this.__layout._default) as Resource<(this: Instance<Type<any>>) => Exert>
      let resolved: any
      if (resource) {
        resolved = platform.getResource(resource)
        if (!resolved) { throw new Error('something went wrong: we need to `resolve` resource here, so please work on async rework') }
      }
      return (value: PropertyType) => resolved
    }
  }

  platform.setResource(core.native.ResourceType, TResourceType)
  platform.setResource(core.method.Type_exert, Type_exert)
  platform.setResource(core.method.BagOf_exert, BagOf_exert)
  platform.setResource(core.method.InstanceOf_exert, InstanceOf_exert)

  return coreService
}

