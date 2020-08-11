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

import { AnyLayout, Class, Mixin, CoreProtocol, CreateTx, Doc, Ref, Tx, VDoc, Obj, ClassifierKind } from '@anticrm/platform'

import { openDB } from 'idb'
import { ModelDb } from './modeldb'
import core from '.'

export interface CacheControl {
  cache (docs: Doc[]): Promise<void>
}

export async function createCache (dbname: string, modelDb: ModelDb): Promise<CoreProtocol & CacheControl> {
  const db = await openDB(dbname, 1, {
    upgrade (db) {
      const domains = new Map<string, string>()
      const classes = modelDb.findClasses({})
      for (const clazz of classes) {
        const domain = clazz._domain as string
        if (domain && !domains.get(domain)) {
          domains.set(domain, domain)
          console.log('create object store: ' + domain)
          const objectStore = db.createObjectStore(domain, { keyPath: '_id' })
          // TODO: following are hardcoded indexes, replace with generic mechanism
          objectStore.createIndex('_class', '_class', { unique: false })
          if (domain === 'tx') {
            objectStore.createIndex('date', 'date', { unique: false })
          }
        }
      }
    }
  })

  async function store (docs: Doc[]): Promise<void> {
    if (docs.length === 0) { return }
    const domains = new Map<string, Doc[]>()
    for (const doc of docs) {
      const domain = modelDb.getDomain(doc._class)
      let perDomain = domains.get(domain)
      if (!perDomain) {
        perDomain = []
        domains.set(domain, perDomain)
      }
      perDomain.push(doc)
    }
    const domainNames = Array.from(domains.keys())
    if (domainNames.length === 0) {
      throw new Error('no domains!')
    }
    console.log('domain names: ', domainNames)
    const tx = db.transaction(domainNames, 'readwrite')
    for (const e of domains.entries()) {
      const store = tx.objectStore(e[0])
      for (const doc of e[1]) {
        console.log('PUT', e[0], doc)
        store.put(doc)
      }
    }
    return tx.done
  }

  async function remove (_class: Ref<Class<Doc>>, doc: Ref<Doc>): Promise<void> {
    const domain = modelDb.getDomain(_class)
    const tx = db.transaction(domain, 'readwrite')
    const store = tx.objectStore(domain)
    store.delete(doc)
    return tx.done
  }

  function createTx2VDoc (create: CreateTx): VDoc {
    const doc: VDoc = {
      _class: create._objectClass,
      _id: create._objectId,
      _createdBy: create._user,
      _createdOn: create._date,
      ...create._attributes
    }
    let _class = create._objectClass
    while (true) {
      const clazz = modelDb.get(_class) as Class<Obj>
      if (clazz._kind === ClassifierKind.MIXIN) {
        if (doc._mixins) {
          doc._mixins.push(_class as Ref<Mixin<Doc>>)
        } else {
          doc._mixins = [_class as Ref<Mixin<Doc>>]
        }
        _class = clazz._extends as Ref<Class<VDoc>>
      } else {
        doc._class = _class
        break
      }
    }
    return doc
  }

  /**
   * Apply given transaction to cached results.
   * @param tx
   */
  function apply (tx: Tx): Promise<void> {
    const _class = tx._class
    switch (_class) {
      case core.class.CreateTx: {
        const doc = createTx2VDoc(tx as CreateTx)
        return store([doc])
      }
      case core.class.DeleteTx: {
        return remove(tx._objectClass, tx._objectId)
      }
      default:
        throw new Error('not implemented (apply tx)')
    }
  }

  function getClass (_class: Ref<Class<Doc>>): Ref<Class<Doc>> {
    let cls = _class
    while (cls) {
      const clazz = modelDb.get(cls) as Class<Doc>
      if (clazz._kind === ClassifierKind.CLASS)
        return cls
      cls = clazz._extends as Ref<Class<Doc>>
    }
    throw new Error('class not found in hierarchy: ' + _class)
  }

  const cache: CoreProtocol & CacheControl = {

    async find (classOrMixin: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc[]> { // eslint-disable-line
      const result = [] as Doc[]
      const _class = getClass(classOrMixin)
      console.log('mixin: ' + classOrMixin + ', class: ' + _class)
      const domain = modelDb.getDomain(_class)
      const tx = db.transaction(domain)
      const store = tx.objectStore(domain)
      const index = store.index('_class')
      const range = IDBKeyRange.bound(_class, _class)
      let cursor = await index.openCursor(range)
      while (cursor) {
        // console.log('cursor value: ', cursor.value)
        result.push(cursor.value)
        cursor = await cursor.continue()
      }
      return tx.done.then(() => result)
    },

    tx (tx: Tx): Promise<void> {
      return Promise.all([store([tx]), apply(tx)]).then()
    },

    async loadDomain (domain: string, index?: string, direction?: string): Promise<Doc[]> {
      const result = [] as Doc[]
      const tx = db.transaction(domain)
      const store = tx.objectStore(domain)
      let cursor = await store.openCursor(undefined, direction as any)
      while (cursor) {
        // console.log('cursor value: ', cursor.value)
        result.push(cursor.value)
        cursor = await cursor.continue()
      }
      return tx.done.then(() => result)
    },

    /// /

    cache: store
  }

  return cache
}
