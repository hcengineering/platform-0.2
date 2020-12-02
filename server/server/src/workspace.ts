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

import {
  AnyLayout,
  Class,
  CoreProtocol,
  Doc,
  Model,
  ModelIndex,
  MODEL_DOMAIN,
  Ref,
  Storage,
  TextIndex,
  TitleIndex,
  Tx,
  TxIndex,
  TxProcessor,
  VDocIndex
} from '@anticrm/core'
import { Collection, MongoClient } from 'mongodb'
import { withTenant } from '@anticrm/accounts'

interface CommitInfo {
  created: Doc[]
}
export interface WorkspaceProtocol extends CoreProtocol {
  delete (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<void>
  commit (commitInfo: CommitInfo): Promise<void>
  shutdown (): Promise<void>
}

export async function connectWorkspace (uri: string, workspace: string): Promise<CoreProtocol & WorkspaceProtocol> {
  console.log('connecting to ' + uri)
  const client = await MongoClient.connect(uri, { useUnifiedTopology: true })
  const db = withTenant(client, workspace)
  console.log('use ' + db.databaseName)

  const memdb = new Model(MODEL_DOMAIN)
  console.log('loading model...')
  const model = await db.collection('model').find({}).toArray()
  console.log('model loaded.')
  memdb.loadModel(model)

  function collection<T extends Doc> (_class: Ref<Class<Doc>>): Collection {
    const domain = memdb.getDomain(_class)
    return db.collection(domain)
  }

  const mongoStorage: Storage = {
    async store (doc: Doc): Promise<any> {
      const c = collection(doc._class)
      console.log('STORE:', c.namespace, doc)
      return c.insertOne(doc)
    },

    async push (_class: Ref<Class<Doc>>, _id: Ref<Doc>, attribute: string, attributes: any): Promise<any> {
      return collection(_class).updateOne({ _id }, { $push: { [attribute]: attributes } })
    },

    async update (_class: Ref<Class<Doc>>, _id: Ref<Doc>, attributes: any): Promise<any> {
      return collection(_class).updateOne({ _id }, { $set: attributes })
    },

    async remove (_class: Ref<Class<Doc>>, doc: Ref<Doc>): Promise<any> {
      return collection(_class).deleteOne({ _id: doc })
    },

    async find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
      return collection(_class)
        .find({
          ...memdb.assign({}, _class, query),
          _class: memdb.getClass(_class)
        })
        .toArray()
    }
  }

  const txProcessor = new TxProcessor([
    new TxIndex(mongoStorage),
    new VDocIndex(memdb, mongoStorage),
    new TitleIndex(memdb, mongoStorage),
    new TextIndex(memdb, mongoStorage),
    new ModelIndex(memdb, mongoStorage)
  ])

  const clientControl = {
    // C O R E  P R O T O C O L

    find<T extends Doc> (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<T[]> {
      return collection(_class)
        .find({
          ...memdb.assign({}, _class, query),
          _class: memdb.getClass(_class)
        })
        .toArray()
    },

    async findOne (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc | undefined> {
      const result = await collection(_class).findOne({
        ...memdb.assign({}, _class, query),
        _class: memdb.getClass(_class)
      })
      if (result == null) {
        return undefined
      }
      return result
    },

    async tx (tx: Tx): Promise<void> {
      return txProcessor.process(tx)
    },

    async loadDomain (domain: string): Promise<Doc[]> {
      if (domain === MODEL_DOMAIN) return memdb.dump()
      console.log('domain:', domain)
      return db.collection(domain).find({}).toArray()
    },

    // P R O T C O L  E X T E N S I O N S

    async delete (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<void> {
      console.log('DELETE', _class, query)
      await collection(_class).deleteMany({ ...query })
    },

    async commit (commitInfo: CommitInfo): Promise<void> {
      // group by domain
      const byDomain = commitInfo.created.reduce((group: Map<string, Doc[]>, doc) => {
        const domain = memdb.getDomain(doc._class)
        let g = group.get(domain)
        if (!g) {
          group.set(domain, (g = []))
        }
        g.push(doc)
        return group
      }, new Map())

      await Promise.all(Array.from(byDomain.entries()).map(domain => db.collection(domain[0]).insertMany(domain[1])))
    },
    shutdown (): Promise<void> {
      return client.close()
    }
  }

  return clientControl
}
