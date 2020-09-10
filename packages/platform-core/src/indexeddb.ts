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

import { AnyLayout, Class, Doc, Ref, Tx, TxProcessor, MemDb, Title, Index } from '@anticrm/platform'

import { openDB } from 'idb'
import { ModelDb } from './modeldb'
import core from '.'
import { Graph } from './graph'

import { VDocIndex } from '@anticrm/platform/src/indices/vdoc'
import { TitleIndex } from '@anticrm/platform/src/indices/title'

export interface CacheControl {
  cache (docs: Doc[]): Promise<void>
}

export async function createCache (dbname: string, modelDb: ModelDb, graph: Graph) {
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


  class CacheTxProcessor extends TxProcessor {

    private graph: Graph

    constructor(modelDb: MemDb, indices: Index[], graph: Graph) {
      super(modelDb, indices)
      this.graph = graph
    }

    async store (doc: Doc): Promise<void> {
      if (doc._class === core.class.Title) {
        const title = doc as Title
        console.log('got title, forward to graph')
        this.graph.add({
          _class: title._objectClass,
          _id: title._id,
          title: title.title
        })
        return
      }
      return store([doc])
    }

    async push (_class: Ref<Class<Doc>>, _id: Ref<Doc>, attribute: string, attributes: any): Promise<void> {
      console.log('cache push')
    }

    async update (_class: Ref<Class<Doc>>, _id: Ref<Doc>, attributes: any): Promise<void> {
      console.log('cache update')
    }

    async remove (_class: Ref<Class<Doc>>, doc: Ref<Doc>): Promise<void> {
      const domain = modelDb.getDomain(_class)
      const tx = db.transaction(domain, 'readwrite')
      const store = tx.objectStore(domain)
      store.delete(doc)
      return tx.done
    }

  }

  const txProcessor = new CacheTxProcessor(modelDb, [new VDocIndex(modelDb), new TitleIndex(modelDb)], graph)

  async function find (classOrMixin: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc[]> { // eslint-disable-line
    const result = [] as Doc[]
    const _class = modelDb.getClass(classOrMixin)
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
  }

  const cache = {

    find,

    findOne (classOrMixin: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc | undefined> {
      return find(classOrMixin, query).then(result => result.length > 0 ? result[0] : undefined)
    },

    tx (tx: Tx): Promise<void> {
      return txProcessor.process(tx)
    },

    async loadDomain (domain: string, index?: string, direction?: string): Promise<Doc[]> {
      const result = [] as Doc[]
      const tx = db.transaction(domain)
      const store = tx.objectStore(domain)
      let cursor = await store.openCursor(undefined, direction as any)
      while (cursor) {
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
