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

import { Platform } from '@anticrm/platform'
import core, {
  CoreService, Obj, Ref, Class, Doc, EClass, BagOf, InstanceOf, PropertyType,
  Instance, Type, Emb, ResourceType, Property, ResourceProperty, Factory
} from '.'

export default async (platform: Platform) => {

  type Konstructor<T extends Obj> = new (obj: Omit<T, '__property' | '_class'>) => Instance<T>

  interface InstanceProxy {
    __layout: any
  }

  const objects = new Map<Ref<Doc>, Doc>()
  const byClass = new Map<Ref<Class<Doc>>, Doc[]>()


  function get<T extends Doc> (_id: Ref<T>): T {
    const result = objects.get(_id)
    if (result) { return result as T }
    throw new Error('oops! object not found: ' + _id)
  }

  // C L A S S E S

  function getOwnAttribute (clazz: Class<Obj>, key: string): Type<any> | undefined {
    return (clazz._attributes as any)[key]
  }

  function getAttribute (clazz: Class<Obj>, key: string): Type<any> | undefined {
    return getOwnAttribute(clazz, key) ??
      (clazz._extends ? getAttribute(get(clazz._extends), key) : undefined)
  }

  // I N S T A N T I A T I O N

  const konstructors = new Map<Ref<Class<Obj>>, Konstructor<Obj>>()
  const prototypes = new Map<Ref<Class<Obj>>, Object>()

  const CoreRoot = {
    get _class (this: Instance<Obj>) { return this.__layout._class }
  }

  function getPrototype<T extends Obj> (_class: Ref<Class<T>>): Object {
    const prototype = prototypes.get(_class)
    if (prototype) {
      return prototype
    }

    const clazz = get(_class) as Class<Obj>
    const parent = clazz._extends ? getPrototype(clazz._extends) : CoreRoot
    const proto = Object.create(parent)
    prototypes.set(_class, proto)

    if (clazz._native) {
      const native = platform.getResource(clazz._native)
      const descriptors = Object.getOwnPropertyDescriptors(native)
      Object.defineProperties(proto, descriptors)
    }

    const attributes = clazz._attributes as { [key: string]: Type<any> }
    for (const key in attributes) {
      if (key === '_default') { continue } // we do not define `_default`'s type, it's infinitevely recursive :)
      const attr = attributes[key]
      const attrInstance = instantiate(attr)

      if (typeof attrInstance.exert !== 'function') {
        console.log('not a function')
        console.log(attrInstance)
        console.log(attrInstance.exert)
      }
      const factory = attrInstance.exert()
      // console.log('use factory')
      // console.log(factory.x.toString())

      Object.defineProperty(proto, key, {
        get (this: InstanceProxy) {
          return factory.x(this.__layout[key])
        },
        enumerable: true
      })
    }
    return proto
  }

  function getKonstructor<T extends Obj> (_class: Ref<Class<T>>): Konstructor<T> {
    const konstructor = konstructors.get(_class)
    if (konstructor) { return konstructor as unknown as Konstructor<T> }
    else {
      // build ctor for _class
      const proto = getPrototype(_class)
      const ctor = {
        [_class]: function (this: InstanceProxy, obj: Obj) {
          this.__layout = obj
        }
      }[_class]
      proto.constructor = ctor
      ctor.prototype = proto
      konstructors.set(_class, ctor as unknown as Konstructor<Obj>)
      return ctor as unknown as Konstructor<T>
    }
  }

  function instantiate<T extends Obj> (obj: T): Instance<T> {
    const ctor = getKonstructor(obj._class)
    return new ctor(obj)
  }

  // C O R E  A P I

  function mixin<D extends T, M extends T, T extends Doc> (doc: D, clazz: Ref<EClass<M, T>>, values: Pick<M, Exclude<keyof M, keyof T>>): M {
    throw new Error("Method not implemented.")
  }

  function newInstance<M extends Emb> (_class: Ref<Class<M>>, values: Omit<M, keyof Emb>): M {
    const obj = { _class, ...values } as M
    return obj
  }

  function createDocument<M extends Doc> (_class: Ref<Class<M>>, values: Omit<M, keyof Doc>): M {
    const obj = { _class, ...values } as M
    objects.set(obj._id, obj)

    return obj
  }

  function newDocument<M extends Doc> (_class: Ref<Class<M>>, values: Omit<M, keyof Doc>): Instance<M> {
    throw new Error("Method not implemented.")
    //return this.getKonstructor(_class)(this.loadDocument(_class, values))
  }

  // better API for `Class`

  function createClass<T extends E, E extends Obj> (values: Omit<EClass<T, E>, keyof Obj>): EClass<T, E> {
    return createDocument(core.class.Class as Ref<Class<EClass<T, E>>>, values)
  }

  function newClass<T extends E, E extends Obj> (values: Omit<EClass<T, E>, keyof Obj>): Instance<EClass<T, E>> {
    return newDocument(core.class.Class as Ref<Class<EClass<T, E>>>, values)
  }

  // T Y P E S : B A G

  class BagProxyHandler implements ProxyHandler<any> {
    private exert: (value: Property<any>) => any

    constructor(type: Instance<Type<any>>) {
      if (!type.exert) {
        throw new Error('bagof: no exert')
      }
      const factory = type.exert()
      this.exert = factory.x
    }

    get (target: any, key: string): any {
      return this.exert(Reflect.get(target, key))
    }
  }

  const Type_exert = function (this: Instance<Type<any>>): Factory {
    return {
      x: value => value
    }
  }

  const BagOf_exert = function (this: Instance<BagOf<any>>): Factory {
    return {
      x: (value: PropertyType) => new Proxy(value, new BagProxyHandler(this.of))
    }
  }

  const InstanceOf_exert = function (this: Instance<InstanceOf<Emb>>): Factory {
    return {
      x: ((value: Emb) => instantiate(value)) as (value: PropertyType) => any
    }
  }

  const TResourceType = {
    exert: function (this: Instance<ResourceType<any>>): Factory {
      const funcName = (this.__layout._default) as ResourceProperty<() => Factory>

      const f = platform.getResource(funcName)
      if (f) return {
        x: (value: PropertyType) => f
      }
      console.log(this)
      throw new Error('no resourcetype: ' + funcName)
    }
  }

  platform.setResource(core.proto.Native, { native: 'object' })
  platform.setResource(core.native.ResourceType, TResourceType)
  platform.setResource(core.method.Type_exert, Type_exert)
  platform.setResource(core.method.BagOf_exert, BagOf_exert)
  platform.setResource(core.method.InstanceOf_exert, InstanceOf_exert)

  return {
    mixin, newInstance, createDocument, newDocument, createClass, newClass,

    getPrototype, get, instantiate
  }
}

