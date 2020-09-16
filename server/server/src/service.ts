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

import { MongoClient, Db } from 'mongodb'

import { Ref, Class, Doc, Model, AnyLayout, MODEL_DOMAIN, CoreProtocol, Tx, TxProcessor, Storage } from '@anticrm/core'

import WebSocket from 'ws'
import { makeResponse, Response } from './rpc'
import { PlatformServer } from './server'

import { VDocIndex } from '@anticrm/core/src/indices/vdoc'
import { TitleIndex } from '@anticrm/core/src/indices/title'
import { TextIndex } from '@anticrm/core/src/indices/text'
import { TxIndex } from '@anticrm/core/src/indices/tx'

interface CommitInfo {
  created: Doc[]
}

export interface ClientControl {
  ping (): Promise<void>
  send (response: Response<unknown>): void
  shutdown (): Promise<void>
}

export async function connect (uri: string, dbName: string, ws: WebSocket, server: PlatformServer): Promise<CoreProtocol & ClientControl> {
  console.log('connecting to ' + uri.substring(25))
  console.log('use ' + dbName)
  const client = await MongoClient.connect(uri, { useUnifiedTopology: true })
  const db = client.db(dbName)

  const memdb = new Model(MODEL_DOMAIN)
  console.log('loading model...')
  const model = await db.collection('model').find({}).toArray()
  console.log('model loaded.')
  memdb.loadModel(model)

  // const graph = new Graph(memdb)
  // console.log('loading graph...')
  // db.collection(CoreDomain.Tx).find({}).forEach(tx => graph.updateGraph(tx), () => console.log(graph.dump()))
  // console.log('graph loaded.')

  function find (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc[]> {
    const domain = memdb.getDomain(_class)
    const cls = memdb.getClass(_class)
    const q = {}
    memdb.assign(q, _class, query)
    return db.collection(domain).find({ ...q, _class: cls }).toArray()
  }

  const mongoStorage: Storage = {
    async store (doc: Doc): Promise<any> {
      const domain = memdb.getDomain(doc._class)
      return db.collection(domain).insertOne(doc)
    },

    async push (_class: Ref<Class<Doc>>, _id: Ref<Doc>, attribute: string, attributes: any): Promise<any> {
      const domain = memdb.getDomain(_class)
      return db.collection(domain).updateOne({ _id }, { $push: { [attribute]: attributes } })
    },

    async update (_class: Ref<Class<Doc>>, selector: object, attributes: any): Promise<any> {
      const domain = memdb.getDomain(_class)
      return db.collection(domain).updateOne(selector, { $set: attributes })
    },

    async remove (_class: Ref<Class<Doc>>, doc: Ref<Doc>): Promise<any> {
      throw new Error('Not implemented')
    }
  }

  const txProcessor = new TxProcessor(memdb, [
    new VDocIndex(memdb, mongoStorage),
    new TitleIndex(memdb, mongoStorage),
    new TextIndex(memdb, mongoStorage),
    new TxIndex(memdb, mongoStorage),
  ])

  const clientControl = {

    // C O R E  P R O T O C O L

    find,

    findOne (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc | undefined> {
      return find(_class, query).then(result => result.length > 0 ? result[0] : undefined)
    },

    async tx (tx: Tx): Promise<void> {
      return txProcessor.process(tx).then(() => {
        server.broadcast(clientControl, { result: tx })
      })
    },

    async loadDomain (domain: string): Promise<Doc[]> {
      if (domain === MODEL_DOMAIN)
        return memdb.dump()
      console.log('domain:', domain)
      return db.collection(domain).find({}).toArray()
    },

    // P R O T C O L  E X T E N S I O N S

    delete (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<void> {
      console.log('DELETE', _class, query)
      const domain = memdb.getDomain(_class)
      return db.collection(domain).deleteMany({ ...query }).then(result => { })
    },

    async commit (commitInfo: CommitInfo): Promise<void> {
      // group by domain
      const byDomain = commitInfo.created.reduce((group: Map<string, Doc[]>, doc) => {
        const domain = memdb.getDomain(doc._class)
        let g = group.get(domain)
        if (!g) { group.set(domain, g = []) }
        g.push(doc)
        return group
      }, new Map())

      await Promise.all(Array.from(byDomain.entries()).map(domain => db.collection(domain[0]).insertMany(domain[1])))

      server.broadcast(clientControl, { result: commitInfo })
    },

    // C O N T R O L

    async ping (): Promise<any> { return null },

    send<R> (response: Response<R>): void {
      ws.send(makeResponse(response))
    },

    // TODO rename to `close`
    shutdown (): Promise<void> {
      return client.close()
    },

    serverShutdown (password: string): Promise<void> {
      return server.shutdown(password)
    }

  }

  return clientControl
}
