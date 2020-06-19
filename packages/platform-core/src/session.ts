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

import { RpcService } from '@anticrm/platform-rpc'
import core, { Doc, Ref, Class, Obj, Emb, Instance, Type, Property, Session, Values, Adapter, Cursor } from '.'
import { MemDb, Layout } from './memdb'
import { generateId } from './objectid'
import { Platform, Resource, ResourceKind } from '@anticrm/platform'
import { attributeKey } from './plugin'
import { result, Function } from 'lodash'

export function createSession (platform: Platform, modelDb: MemDb, rpc: RpcService): Session {

  type Konstructor<T extends Obj> = new (obj: Omit<T, '__property' | '_class'>) => Instance<T>

  enum Stereotype {
    EMB,
    DOC
  }

  // M O D E L

  const konstructors = new Map<Ref<Class<Obj>>, Konstructor<Obj>>()
  const prototypes = new Map<Ref<Class<Obj>>, Object>()

  const CoreRoot = {
    get _class (): Ref<Class<Obj>> { return (this as Instance<Obj>).__layout._class },
    getSession: (): Session => session
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
    return new ctor(obj) as Instance<T>
  }

  async function instantiateDoc<T extends Doc> (obj: T): Promise<Instance<T>> {
    const ctor = await getKonstructor(obj._class, Stereotype.DOC)
    return new ctor(obj) as Instance<T>
  }

  // I N S T A N C E S

  const newObjects = new Map<Ref<Doc>, Doc>()

  async function newInstance<M extends Doc> (_class: Ref<Class<M>>, values: Values<Omit<M, keyof Doc>>, id?: Ref<M>): Promise<Instance<M>> {
    const _id = id ?? generateId() as Ref<Doc>
    const layout = { _class, _id } as Doc
    newObjects.set(_id, layout)

    const instance = await instantiateDoc(layout)
    for (const key in values) {
      (instance as any)[key] = (values as any)[key]
    }

    return instance as Instance<M>
  }

  async function commit () {
    const commit = {
      create: [] as Doc[]
    }
    for (const o of newObjects) {
      commit.create.push(o[1])
    }
    const resp = rpc.request('commit', commit)
  }

  async function getInstance<T extends Doc> (id: Ref<T>): Promise<Instance<T>> {
    //const doc = modelDb.get(id)
    let doc = newObjects.get(id)
    if (!doc) {
      doc = modelDb.get(id)
      if (!doc) { throw new Error('no document ,id: ' + id) }
    }
    return instantiateDoc(doc as T)
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

  // find (_class: string, query: {}): Promise<[]> {
  //   return request('find', [_class, query])
  // },
  // load (domain: string): Promise<[]> {
  //   return request('load', [domain])
  // }


  function findRequest<T extends Doc> (_class: Ref<Class<T>>, query: Partial<T>) {
    return rpc.request<[Ref<Class<T>>, Partial<T>], Doc[]>('find', _class, query)
  }

  function find<T extends Doc> (_class: Ref<Class<T>>, query: Partial<T>): Cursor<T> {
    const layouts = findRequest(_class, query)

    return {
      async all (): Promise<Instance<T>[]> {
        const result = await layouts.then(resolved => (resolved as T[]).map(doc => instantiateDoc(doc)))
        return Promise.all(result)
      }
    }
  }

  async function adapt (resource: Resource<any>, kind: string): Promise<Resource<any> | undefined> {
    const info = platform.getResourceInfo(resource)
    if (info.kind === kind) {
      return Promise.resolve(resource)
    }

    const adapter = await modelDb.findOne(core.class.Adapter, {
      from: info.kind as unknown as Property<ResourceKind>,
      to: kind as unknown as Property<ResourceKind>
    })

    if (adapter) {
      const instance = await getInstance(adapter._id as Ref<Adapter>)
      return (await instance.adapt).call(instance, resource)
    }

    return undefined
  }

  function getClassHierarchy (_class: Ref<Class<Obj>>, top?: Ref<Class<Obj>>): Ref<Class<Obj>>[] {
    const hierarchy = modelDb.getClassHierarchy(_class)
    console.log('TOP: ' + top)
    const result = top ? hierarchy.slice(0, hierarchy.indexOf(top)) : hierarchy
    console.log(result)
    return result
  }

  const session: Session = {
    commit,
    getClassHierarchy,
    newInstance,
    getInstance,
    as,
    is,
    find,
    adapt,
    instantiateEmb,
    getPrototype,
    getModel () { return modelDb }
  }

  return session
}