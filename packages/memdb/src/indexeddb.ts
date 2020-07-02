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

import { Layout, AnyLayout, DbProtocol, CommitInfo, MemDb } from '.'
import { Doc, Ref, Class } from '@anticrm/platform'

import { openDB } from 'idb'

export interface CacheControl {
  cache (docs: Layout<Doc>[]): Promise<void>
}

export async function createCache (dbname: string, modelDb: MemDb): Promise<DbProtocol & CacheControl> {
  const db = await openDB(dbname, 1, {
    upgrade (db) {
      const domains = new Map<string, string>()
      const classes = modelDb.findClass({})
      for (const clazz of classes) {
        const domain = clazz._domain
        if (domain && !domains.get(domain)) {
          domains.set(domain, domain)
          console.log('create object store: ' + domain)
          const objectStore = db.createObjectStore(domain, { keyPath: '_id' })
          objectStore.createIndex('_class', '_class', { unique: false })
        }
      }
    }
  })

  return {
    async find (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Layout<Doc>[]> { // eslint-disable-line
      const result = [] as Layout<Doc>[]
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
      return result
    },
    delete (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<void> { // eslint-disable-line
      throw new Error('not implemented')
    },
    load (): Promise<Layout<Doc>[]> {
      throw new Error('not implemented')
    },
    commit (commitInfo: CommitInfo): Promise<void> { // eslint-disable-line
      throw new Error('not implemented')
    },

    /// /

    async cache (docs: Layout<Doc>[]): Promise<void> {
      if (docs.length === 0) { return }
      const domains = new Map<string, Layout<Doc>[]>()
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
      const tx = db.transaction(domainNames, 'readwrite')
      for (const e of domains.entries()) {
        const store = tx.objectStore(e[0])
        for (const doc of e[1]) {
          // console.log('PUT ' + e[0], doc)
          store.put(doc)
        }
      }
      return tx.done
    }
  }
}
