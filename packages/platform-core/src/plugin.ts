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

import { Platform, Resource, Metadata, ResourceKind } from '@anticrm/platform'
import core, {
  CoreService, Obj, Ref, Class, Doc, BagOf, InstanceOf, PropertyType,
  Instance, Type, Emb, ResourceType, Exert, Adapter, Property
} from '.'
import { MemDb } from './memdb'

type Konstructor<T extends Obj> = new (obj: Omit<T, '__property' | '_class'>) => Instance<T>

export function attributeKey (_class: Ref<Class<Obj>>, key: string): string {
  const index = _class.indexOf(':')
  return _class.substring(index + 1) + '/' + key
}

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

  const metaModel = platform.getMetadata(core.metadata.MetaModel)
  if (metaModel) {
    modelDb.loadModel(metaModel)
  } else {
    console.log('Warning: no metamodel provided.')
  }

  function getClassHierarchy (cls: Ref<Class<Obj>>, top?: Ref<Class<Obj>>) {
    const hierarchy = modelDb.getClassHierarchy(cls)
    console.log('TOP: ' + top)
    const result = top ? hierarchy.slice(0, hierarchy.indexOf(top)) : hierarchy
    console.log(result)
    return result
  }

  // A D A P T E R S

  // const adapters = new Map<string, Ref<Adapter>[]>()

  // const allAdapters = modelDb.findAll(core.class.Adapter, {})
  // console.log('ALL ADAPTERS:')
  // console.log(allAdapters)
  // allAdapters.forEach((adapter) => {
  //   const key = adapter.from + ':' + adapter.to
  //   const all = adapters.get(key)
  //   if (all) { all.push(adapter._id) }
  //   else { adapters.set(key, [adapter._id]) }
  // })

  async function adapt (resource: Resource<any>, kind: string): Promise<Resource<any> | undefined> {
    console.log('adapting ' + resource + ' to ' + kind)
    const info = platform.getResourceInfo(resource)
    if (info.kind === kind) {
      return Promise.resolve(resource)
    }

    const adapter = await modelDb.findOne(core.class.Adapter, {
      from: info.kind as unknown as Property<ResourceKind>,
      to: kind as unknown as Property<ResourceKind>
    })

    if (adapter) {
      console.log('ADAPTER:')
      console.log(adapter)
      const instance = await coreService.getInstance(adapter._id)
      console.log(instance)
      return instance.adapt(resource)
    }

    // const list = adapters.get(key)
    // console.log('adapters for ' + key)
    // console.log(list)
    // if (list) {
    //   for (const adapter of list) {
    //     const instance = await coreService.getInstance(adapter)
    //     instance.adapt
    //     const adapted = adapter(resource)
    //     if (adapted) { return adapted }
    //   }
    // }
    return undefined
  }

  platform.setResource(core.method.Adapter_adapt, async () => { throw new Error('Abstract `adapt` function.') })

  // C O R E  S E R V I C E

  const coreService: CoreService = {
    adapt,

    getDb () { return modelDb },
    getClassHierarchy,

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

  async function getPrototype<T extends Obj> (_class: Ref<Class<T>>, stereotype: Stereotype): Promise<Object> {
    const prototype = prototypes.get(_class)
    if (prototype) { return prototype }

    const clazz = modelDb.get(_class) as Class<Obj>
    const parent = clazz._extends ? await getPrototype(clazz._extends, stereotype) : CoreRoot
    const proto = Object.create(parent)
    prototypes.set(_class, proto)

    if (clazz._native) {
      const native = await platform.getResource(clazz._native as unknown as Resource<Object>) // TODO: must `resolve`! we need to have getPrototype async for this.
      if (!native) { throw new Error(`something went wrong, can't load '${clazz._native}' resource`) }
      const descriptors = Object.getOwnPropertyDescriptors(native)
      Object.defineProperties(proto, descriptors)
    }

    const attributes = clazz._attributes as { [key: string]: Type<any> }
    for (const key in attributes) {
      if (key === '_default') { continue } // we do not define `_default`'s type, it's infinitevely recursive :)
      const attr = attributes[key]
      // console.log(attr)
      const attrInstance = await instantiateEmb(attr)
      // console.log(attrInstance)

      // if (typeof attrInstance.exert !== 'function') {
      //   throw new Error('exert is not a function')
      // }

      const exertFactory = attrInstance.exert

      if (typeof exertFactory !== 'function') {
        throw new Error('exertFactory is not a function')
      }

      const exert = await exertFactory.call(attrInstance)

      if (typeof exert !== 'function') {
        throw new Error('exert is not a function')
      }

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

  async function getKonstructor<T extends Obj> (_class: Ref<Class<T>>, stereotype: Stereotype): Promise<Konstructor<T>> {
    const konstructor = konstructors.get(_class)
    if (konstructor) { return konstructor as unknown as Konstructor<T> }
    else {
      const proto = await getPrototype(_class, stereotype)
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

  async function instantiateEmb<T extends Emb> (obj: T): Promise<Instance<T>> {
    const ctor = await getKonstructor(obj._class, Stereotype.EMB)
    return new ctor(obj)
  }

  async function instantiateDoc<T extends Doc> (obj: T): Promise<Instance<T>> {
    const ctor = await getKonstructor(obj._class, Stereotype.DOC)
    return new ctor(obj)
  }

  // A P I : R E A D

  async function getInstance<T extends Doc> (id: Ref<T>): Promise<Instance<T>> {
    const doc = modelDb.get(id)
    return instantiateDoc(doc)
  }

  async function as<T extends Doc, A extends Doc> (doc: Instance<T>, _class: Ref<Class<A>>): Promise<Instance<A>> {
    if (!is(doc, _class)) {
      console.log('Warning:' + _class + ' instance does not mixed into `' + doc._class + '`')
    }
    const ctor = await getKonstructor(_class, Stereotype.DOC)
    return new ctor(doc.__layout as unknown as A)
  }

  function is<T extends Doc, M extends Doc> (doc: Instance<T>, _class: Ref<Class<M>>): boolean {
    const mixins = doc._mixins as Ref<Class<Doc>>[]
    return mixins && mixins.includes(_class as Ref<Class<Doc>>)
  }

  // T Y P E S : B A G

  class BagProxyHandler implements ProxyHandler<any> {
    private exert: Exert

    constructor(exert: Exert | undefined) {
      if (!exert) {
        throw new Error('bagof: no exert')
      }
      // console.log('constructing bag, exert function: ')
      // console.log(exert.toString())
      this.exert = exert
    }

    get (target: any, key: string): any {
      // console.log('bagof GET ' + key)
      // console.log(target)
      const value = Reflect.get(target, key)
      // console.log(value)
      // console.log(this.exert.toString())
      const result = this.exert(value)
      // console.log(result)
      return result
    }
  }

  const Type_exert = async function (this: Instance<Type<any>>): Promise<Exert> {
    return value => value
  }

  const Metadata_exert = async function (this: Instance<Type<any>>): Promise<Exert> {
    return ((value: Metadata<any> & Property<any>) => value ? platform.getMetadata(value) : undefined) as Exert
  }

  const BagOf_exert = async function (this: Instance<BagOf<any>>): Promise<Exert> {
    const off = await this.of
    const exertFactory = off.exert
    if (typeof exertFactory !== 'function') { throw new Error('not a function') }
    const exert = await exertFactory.call(this)
    if (typeof exert !== 'function') { throw new Error('not a function') }
    return (value: PropertyType) => value ? new Proxy(value, new BagProxyHandler(exert)) : undefined
  }

  const InstanceOf_exert = async function (this: Instance<InstanceOf<Emb>>): Promise<Exert> {
    // console.log('instanceof exert')
    return ((value: Emb) => {
      // console.log('instanceof exerting')
      const result = value ? instantiateEmb(value) : undefined
      // console.log('instanceof')
      // if (result instanceof Promise) {
      //   result.then((x) => {
      //     console.log('instance resolved')
      //     console.log(x)
      //   })
      // }
      // console.log(result)
      return result
    }) as Exert
  }

  const TResourceType = {
    exert: async function (this: Instance<ResourceType<any>>): Promise<Exert> {
      const resource = (this.__layout._default) as unknown as Resource<(this: Instance<Type<any>>) => Exert>
      if (resource) {
        const resolved = await platform.getResource(resource)
        return () => resolved
      }
      return () => undefined
    }
  }

  platform.setResource(core.native.ResourceType, TResourceType)
  platform.setResource(core.method.Type_exert, Type_exert)
  platform.setResource(core.method.BagOf_exert, BagOf_exert)
  platform.setResource(core.method.InstanceOf_exert, InstanceOf_exert)
  platform.setResource(core.method.Metadata_exert, Metadata_exert)

  return coreService
}

