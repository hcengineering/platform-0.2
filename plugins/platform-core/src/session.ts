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

import { CommitInfo, CoreProtocol } from '@anticrm/rpc'
import { Platform, Resource, Doc, Ref, Class, Obj, Emb, Type, Layout, ClassLayout, DocLayout, ObjLayout } from '@anticrm/platform'
import { MemDb, findAll } from '@anticrm/memdb'
import { generateId } from './objectid'
import { attributeKey } from './plugin'

import core, { Instance, Session, Values, Adapter, Cursor } from '.'

export function createSession (platform: Platform, modelDb: MemDb, coreProtocol: CoreProtocol): Session {

  type Konstructor<T extends Obj> = new (obj: ObjLayout) => Instance<T>

  enum Stereotype {
    EMB,
    DOC
  }

  // M O D E L

  const konstructors = new Map<Ref<Class<Obj>>, Konstructor<Obj>>()
  const prototypes = new Map<Ref<Class<Obj>>, Object>()

  const created = new Map<Ref<Doc>, Instance<Doc>>()
  const updated = new Map<Ref<Doc>, Instance<Doc>>()

  const CoreRoot = {
    get _class (): Ref<Class<Obj>> { return (this as Instance<Obj>).__layout._class },
    getSession: (): Session => session
  }

  async function getPrototype<T extends Obj> (_class: Ref<Class<T>>, stereotype: Stereotype): Promise<Object> {
    const prototype = prototypes.get(_class)
    if (prototype) { return prototype }

    const clazz = modelDb.get(_class) as ClassLayout
    const parent = clazz._extends ? await getPrototype(clazz._extends as string as Ref<Class<Obj>>, stereotype) : CoreRoot
    const proto = Object.create(parent)
    prototypes.set(_class, proto)

    if (clazz._native) {
      const native = await platform.getResource(clazz._native as unknown as Resource<Object>) // TODO: must `resolve`! we need to have getPrototype async for this.
      if (!native) { throw new Error(`something went wrong, can't load '${clazz._native}' resource`) }
      const descriptors = Object.getOwnPropertyDescriptors(native)
      Object.defineProperties(proto, descriptors)
    }

    const attributes = clazz._attributes
    for (const key in attributes) {
      if (key === '_default') { continue } // we do not define `_default`'s type, it's infinitevely recursive :)
      const attr = attributes[key]
      // console.log(attr)
      const attrInstance = await instantiateEmb(attr) as Instance<Type<any>>
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
          let value = (this.__update as any)[fullKey]
          if (!value) {
            value = (this.__layout as any)[fullKey]
          }
          return exert(value, this.__layout, key)
        },
        set (this: Instance<Obj>, value: any) {
          (this.__update as any)[fullKey] = value
          const id = (this.__layout as DocLayout)._id
          if (id) { updated.set(id, this as Instance<Doc>) }
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
        [_class]: function (this: Instance<Obj>, obj: DocLayout) {
          this.__layout = obj
          this.__update = {} as DocLayout
        }
      }[_class] // A trick to `name` function as `_class` value
      proto.constructor = ctor
      ctor.prototype = proto
      konstructors.set(_class, ctor as unknown as Konstructor<Obj>)
      return ctor as unknown as Konstructor<T>
    }
  }

  async function instantiateEmb<T extends Emb> (obj: ObjLayout): Promise<Instance<T>> {
    const ctor = await getKonstructor(obj._class, Stereotype.EMB)
    return new ctor(obj) as Instance<T>
  }

  async function instantiateDoc<T extends Doc> (obj: DocLayout): Promise<Instance<T>> {
    const ctor = await getKonstructor(obj._class, Stereotype.DOC)
    return new ctor(obj) as unknown as Instance<T>
  }

  async function newInstance<M extends Doc> (_class: Ref<Class<M>>, values: Values<Omit<M, keyof Doc>>, id?: Ref<M>): Promise<Instance<M>> {
    const _id = id ?? generateId() as Ref<Doc>
    const layout = { _class, _id } as DocLayout

    const instance = await instantiateDoc(layout)
    for (const key in values) {
      (instance as any)[key] = (values as any)[key]
    }

    created.set(_id, instance)

    return instance as unknown as Instance<M>
  }

  // I N S T A N C E S

  async function getInstance<T extends Doc> (id: Ref<T>): Promise<Instance<T>> {
    const newInstance = created.get(id)
    if (newInstance) {
      return newInstance as unknown as Instance<T>
    }
    const doc = modelDb.get(id)
    if (!doc) { throw new Error('no document ,id: ' + id) }
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

  // C O M M I T S

  function fullLayout (instance: Instance<Obj>): ObjLayout {
    const layout = instance.__layout
    const update = instance.__update
    return { ...layout, ...update }
  }

  async function commit () {
    return new Promise<void>(async (resolve, reject) => {
      const info: CommitInfo = {
        created: [] as DocLayout[]
      }

      console.log('COMMIT')
      for (const instance of created.values()) {
        info.created.push(fullLayout(instance) as DocLayout)
        updated.delete(instance._id)
      }

      console.log(info)
      console.log('------------')

      coreProtocol.commit(info).then(() => {
        console.log('done rpc commit')
        console.log(info)
        commitInfo(info).then(() => { resolve() })
      })
    })
  }

  async function commitInfo (info: CommitInfo) {
    console.log('session commitinfo')
    console.log(info)

    for (const doc of info.created) {
      created.delete(doc._id)
    }

    for (const q of queries) {
      const find = findAll(info.created, q._class, q.query as Layout)
      if (find.length > 0) {
        q.result.push(...find)
        const foundInstances = await Promise.all(find.map(doc => instantiateDoc(doc)))
        q.instances.push(...foundInstances)
        q.listener(q.instances)
      }
    }
  }

  function close (discard?: boolean) {
    if (created.size > 0 || updated.size > 0) {
      if (!discard) { throw new Error('you have uncommitted changes.') }
    }
  }

  function find<T extends Doc> (_class: Ref<Class<T>>, query: Partial<T>): Cursor<T> {
    const layouts = coreProtocol.find(_class as Ref<Class<Doc>>, query as Layout)

    return {
      async all (): Promise<Instance<T>[]> {
        const result = await layouts.then(resolved => (resolved as T[]).map(doc => instantiateDoc(doc)))
        return Promise.all(result as unknown as Promise<Instance<T>>[])
      }
    }
  }

  interface Query<T extends Doc> {
    _class: Ref<Class<T>>
    query: Values<Partial<T>>
    result: DocLayout[]
    instances: Instance<T>[]
    listener: (result: Instance<T>[]) => void
  }

  const queries = [] as Query<Doc>[]

  function query<T extends Doc> (_class: Ref<Class<T>>, query: Values<Partial<T>>, listener: (result: Instance<T>[]) => void): () => void {
    const _q: Query<T> = { _class, query, listener, result: [], instances: [] }
    const q = _q as unknown as Query<Doc>
    queries.push(q)

    coreProtocol.find(_class as Ref<Class<Doc>>, query as Layout)
      .then(result => {
        q.result = result
        return Promise.all(result.map(doc => instantiateDoc(doc)))
      })
      .then(result => {
        q.instances = result
        listener(result as unknown as Instance<T>[])
      }
      )

    return () => {
      queries.splice(queries.indexOf(q), 1)
    }
  }

  // A D A P T E R S

  async function adapt (resource: Resource<any>, kind: string): Promise<Resource<any> | undefined> {
    const info = platform.getResourceInfo(resource)
    if (info.kind === kind) {
      return Promise.resolve(resource)
    }

    const adapter = await modelDb.findOne(core.class.Adapter, {
      from: info.kind,
      to: kind
    })

    if (adapter) {
      const instance = await getInstance(adapter._id as string as Ref<Adapter>)
      return (await instance.adapt).call(instance, resource)
    }

    return undefined
  }

  function getClassHierarchy (_class: Ref<Class<Doc>>, top?: Ref<Class<Obj>>): Ref<Class<Obj>>[] {
    const hierarchy = modelDb.getClassHierarchy(_class)
    console.log('TOP: ' + top)
    const result = top ? hierarchy.slice(0, hierarchy.indexOf(top)) : hierarchy
    console.log(result)
    return result as string[] as Ref<Class<Obj>>[]
  }

  const session: Session = {
    commit,
    commitInfo,
    close,
    getClassHierarchy,
    newInstance,
    getInstance,
    as,
    is,
    find,
    query,
    adapt,
    instantiateEmb,
    getPrototype,
    getModel () { return modelDb }
  }

  return session
}