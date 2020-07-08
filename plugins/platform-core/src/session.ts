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
import { Platform, Resource, Doc, Ref, Class, Obj, Emb, attributeKey, getResourceInfo } from '@anticrm/platform'
import { MemDb, findAll, Layout, AnyLayout } from '@anticrm/memdb'
import { createCache } from '@anticrm/memdb/lib/indexeddb'
import { generateId } from './objectid'

import core, { Instance, Type, Session, Values, Adapter, Cursor, CoreDomain } from '.'

import { Prototypes, createPrototypes } from './instance'

export function createSession (platform: Platform, modelDb: MemDb, coreProtocol: CoreProtocol, broadcastXact: (info: CommitInfo, originator?: Session) => void, closeSession: (session: Session) => void): Session {

  const created = new Map<Ref<Doc>, Instance<Doc>>()
  const updated = new Map<Ref<Doc>, Instance<Doc>>()

  const CoreRoot = {
    get _class (): Ref<Class<Obj>> { return (this as Instance<Obj>).__layout._class },
    getSession: (): Session => session
  }

  const prototypes = createPrototypes(platform, modelDb, CoreRoot, (doc: Instance<Doc>) => {
    updated.set(doc._id, doc)
  })

  async function newInstance<M extends Doc> (_class: Ref<Class<M>>, values: Values<Omit<M, keyof Doc>>, id?: Ref<M>): Promise<Instance<M>> {
    const _id = id ?? generateId() as Ref<Doc>
    const layout = { _class, _id } as Layout<Doc>

    const instance = await prototypes.instantiateDoc(layout)
    for (const key in values) {
      (instance as any)[key] = (values as any)[key]
    }

    created.set(_id, instance)

    return instance as unknown as Instance<M>
  }

  // I N S T A N C E S

  /** To be deprecated, use findOne instead */
  async function getInstance<T extends Doc> (_class: Ref<Class<T>>, _id: Ref<T>): Promise<Instance<T>> {
    if (!_class || !_id) { throw new Error('getInstance invalid args') }
    const newInstance = created.get(_id)
    if (newInstance) {
      return newInstance as unknown as Instance<T>
    }

    const clazz = modelDb.get(_class) as Layout<Class<T>>
    const domain = clazz._domain
    if (!domain) { throw new Error(`can't get domain for class: '${_class}'`) }

    let doc
    if (domain === CoreDomain.Model) {
      doc = modelDb.get(_id)
    } else {
      const cursor = find(_class, { _id } as unknown as Partial<T>) //  TODO: cast
      const all = await cursor.all()
      if (all.length !== 1) { { throw new Error('getInstance: no document ,id: ' + _id) } }
      return all[0]
    }

    if (!doc) { throw new Error('no document ,id: ' + _id) }
    return prototypes.instantiateDoc(doc as T)
  }

  // C O M M I T S

  function fullLayout (instance: Instance<Obj>): Layout<Obj> {
    const layout = instance.__layout
    const update = instance.__update
    return { ...layout, ...update }
  }

  async function commit () {
    return new Promise<void>(async (resolve, reject) => {
      const info: CommitInfo = {
        created: [] as Layout<Doc>[]
      }

      for (const instance of created.values()) {
        info.created.push(fullLayout(instance) as Layout<Doc>)
        updated.delete(instance._id)
      }

      await coreProtocol.commit(info)
      // transaction will NOT be broadcasted back to us (as a client), so we have to broadcast locally
      broadcastXact(info)
      resolve()
    })
  }

  async function acceptXact (info: CommitInfo) {
    console.log('session commitinfo')
    console.log(info)

    for (const doc of info.created) {
      created.delete(doc._id)
    }

    console.log('scanning ' + queries.length + ' queries...')
    for (const q of queries) {
      const find = findAll(info.created, q._class, q.query as AnyLayout)
      if (find.length > 0) {
        console.log('match found: ' + find.length)
        // q.result.push(...find)
        const foundInstances = await Promise.all(find.map(doc => prototypes.instantiateDoc(doc)))
        q.instances.push(...foundInstances)
        q.listener(q.instances)
      }
    }
  }

  function close (discard?: boolean) {
    if (created.size > 0 || updated.size > 0) {
      if (!discard) { throw new Error('you have uncommitted changes.') }
    }
    closeSession(session)
  }

  function find<T extends Doc> (_class: Ref<Class<T>>, query: Partial<T>): Cursor<T> {
    const layout = {} as AnyLayout
    const hierarchy = getClassHierarchy(_class)

    return {
      async all (): Promise<Instance<T>[]> {
        const promises = hierarchy.map(cls =>
          getInstance(core.class.Class, cls).then(async clazz => {
            const attributes = clazz._attributes
            for (const key in attributes) {
              const qv = (query as any)[key]
              if (qv) {
                const attribute = await attributes[key] as Instance<Type<any>>
                if (!attribute.hibernate) {
                  console.log('ATTRIBUTE', attribute)
                  throw new Error('should not happen, fix #49 and remove this line')
                }
                layout[attributeKey(cls, key)] = attribute.hibernate(qv)
              }
            }
          })
        )
        await Promise.all(promises)
        console.log('LAYOUT: ', layout)
        const layouts = coreProtocol.find(_class as Ref<Class<Doc>>, layout)
        const result = await layouts.then(resolved => (resolved as T[]).map(doc => prototypes.instantiateDoc(doc)))
        return Promise.all(result as unknown as Promise<Instance<T>>[])
      }
    }
  }

  /// Q U E R Y

  const cache = createCache('cache', modelDb)

  interface Query<T extends Doc> {
    _class: Ref<Class<T>>
    query: Values<Partial<T>>
    instances: Instance<T>[]
    listener: (result: Instance<T>[]) => void
  }

  const queries = [] as Query<Doc>[]

  function query<T extends Doc> (_class: Ref<Class<T>>, query: Values<Partial<T>>, listener: (result: Instance<T>[]) => void): () => void {
    const _q: Query<T> = { _class, query, listener, instances: [] }
    const q = _q as unknown as Query<Doc>
    queries.push(q)

    let done = false

    async function getFromCache (): Promise<void> {
      return (await cache).find(_class as Ref<Class<Doc>>, query as unknown as AnyLayout) // !!!!! WRONG, need hibernate
        .then(result => Promise.all(result.map(doc => prototypes.instantiateDoc(doc))))
        .then(result => {
          if (!done) {
            q.instances = result
            listener(result as unknown as Instance<T>[])
          }
        })
    }

    getFromCache().then(() => { })

    coreProtocol.find(_class as Ref<Class<Doc>>, query as unknown as AnyLayout) // !!!!! WRONG, need hibernate
      .then(async result => {
        done = true
          ; ((await cache).cache(result)).then(() => console.log('RESULTS CACHED'))
        return Promise.all(result.map(doc => prototypes.instantiateDoc(doc)))
      })
      .then(async result => {
        q.instances = result
        listener(result as unknown as Instance<T>[])
      })

    return () => {
      queries.splice(queries.indexOf(q), 1)
    }
  }

  async function del<T extends Doc> (_class: Ref<Class<T>>, _id: Ref<T>): Promise<void> {
    return coreProtocol.delete(_class as Ref<Class<Doc>>, { _id })
  }

  // A D A P T E R S

  async function adapt (resource: Resource<any>, kind: string): Promise<Resource<any> | undefined> {
    const info = getResourceInfo(resource)
    if (info.kind === kind) {
      return Promise.resolve(resource)
    }

    const adapter = await modelDb.findOne(core.class.Adapter, {
      from: info.kind,
      to: kind
    })

    if (adapter) {
      const instance = await getInstance(core.class.Adapter, adapter._id as string as Ref<Adapter>)
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
    acceptXact,
    close,
    getClassHierarchy,
    newInstance,
    getInstance,
    find,
    query,
    delete: del,
    adapt,
    getModel () { return modelDb },
    ...prototypes
  }

  return session
}