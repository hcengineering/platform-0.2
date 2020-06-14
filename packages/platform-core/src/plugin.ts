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

import { Platform, Resource, Metadata, ResourceKind, plugin } from '@anticrm/platform'
import core, {
  CoreService, Obj, Ref, Class, Doc, BagOf, InstanceOf, PropertyType,
  Instance, Type, Emb, StaticResource, Exert, Adapter, Property
} from '.'
import { MemDb } from './memdb'
import { createClient, createNullClient } from './client'
import model from './__model__/model'

type Konstructor<T extends Obj> = new (obj: Omit<T, '__property' | '_class'>) => Instance<T>

// TODO: Platform.getResourceInfo
export function attributeKey (_class: Ref<Class<Obj>>, key: string): string {
  const index = _class.indexOf(':')
  const dot = _class.indexOf('.')
  const plugin = _class.substring(index + 1, dot)
  const cls = _class.substring(dot + 1)
  return plugin + '|' + cls + '|' + key
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

  // C L I E N T

  const host = platform.getMetadata(core.metadata.WSHost)
  const port = platform.getMetadata(core.metadata.WSPort)

  const client = host ? await createClient(host, port) : createNullClient()

  // M E T A M O D E L

  const modelDb = new MemDb()
  const metaModel = platform.getMetadata(core.metadata.MetaModel) ?? await client.load('model')
  console.log(metaModel)
  modelDb.loadModel(metaModel)

  // C L A S S E S

  // function getOwnAttribute (clazz: Class<Obj>, key: string): Type<any> | undefined {
  //   return (clazz._attributes as any)[key]
  // }

  // function getAttribute (clazz: Class<Obj>, key: string): Type<any> | undefined {
  //   return getOwnAttribute(clazz, key) ??
  //     (clazz._extends ? getAttribute(get(clazz._extends), key) : undefined)
  // }

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
      const adapted = (await instance.adapt)(resource)
      console.log('adapted')
      console.log(adapted)
      return adapted
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

  // platform.setResource(core.method.Adapter_adapt, async () => { throw new Error('Abstract `adapt` function.') })

  // C O R E  S E R V I C E

  const coreService: CoreService = {
    adapt,

    newSession () { return modelDb },
    getClassHierarchy,
    find,

    getPrototype,

    newInstance,
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
        set (this: Instance<Obj>, value: any) {
          Reflect.set(this.__layout, fullKey, value)
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

  function newInstance<M extends Doc> (_class: Ref<Class<M>>, values: Omit<M, keyof Doc>, _id?: Ref<M>): Promise<Instance<M>> {
    const doc = modelDb.createDocument(_class, values, _id)
    return getInstance(doc._id)
  }

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

  async function find<T extends Doc> (_class: Ref<Class<T>>, query: Partial<T>): Promise<Instance<T>[]> {
    const layout = await modelDb.find(_class, query)
    const result = layout.map(doc => instantiateDoc(doc))
    return Promise.all(result)
  }

  // C O L L E C T I O N : B A G

  class BagProxyHandler implements ProxyHandler<any> {
    private exert: Exert

    constructor(exert: Exert | undefined) {
      if (!exert) {
        throw new Error('bagof: no exert')
      }
      this.exert = exert
    }

    get (target: any, key: PropertyKey): any {
      const value = Reflect.get(target, key)
      const result = this.exert(value)
      return result
    }
  }

  // C O L L E C T I O N : A R R A Y

  class ArrayProxyHandler implements ProxyHandler<any> {
    private exert: Exert

    constructor(exert: Exert | undefined) {
      if (!exert) {
        throw new Error('bagof: no exert')
      }
      this.exert = exert
    }

    get (target: any, key: PropertyKey): any {
      const value = Reflect.get(target, key)
      const result = this.exert(value)
      return result
    }
  }

  const Type_exert = async function (this: Instance<Type<any>>): Promise<Exert> {
    return value => value
  }

  const Metadata_exert = async function (this: Instance<Type<any>>): Promise<Exert> {
    return ((value: Metadata<any> & Property<any>) => value ? platform.getMetadata(value) : undefined) as Exert
  }

  const Resource_exert = async function (this: Instance<Type<any>>): Promise<Exert> {
    return (async (value: Property<any>) => value ? platform.getResource(value as unknown as Resource<any>) : undefined) as Exert
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
    return ((value: Emb) => {
      const result = value ? instantiateEmb(value) : undefined
      return result
    }) as Exert
  }

  const TStaticResource = {
    exert: async function (this: Instance<StaticResource<any>>): Promise<Exert> {
      const resource = (this.__layout._default) as unknown as Resource<(this: Instance<Type<any>>) => Exert>
      if (resource) {
        const resolved = await platform.getResource(resource)
        return () => resolved
      }
      return () => undefined
    }
  }

  platform.setResource(core.native.StaticResource, TStaticResource)
  platform.setResource(core.method.Type_exert, Type_exert)
  platform.setResource(core.method.BagOf_exert, BagOf_exert)
  platform.setResource(core.method.InstanceOf_exert, InstanceOf_exert)
  platform.setResource(core.method.Metadata_exert, Metadata_exert)
  platform.setResource(core.method.Resource_exert, Resource_exert)

  return coreService
}

