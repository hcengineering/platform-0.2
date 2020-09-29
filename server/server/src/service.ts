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

import { MongoClient } from 'mongodb'

import { Ref, Class, Doc, Model, AnyLayout, MODEL_DOMAIN, CoreProtocol, Tx, TxProcessor, Storage, ModelIndex,
  Space, CORE_CLASS_SPACE, CORE_CLASS_UPDATETX, UpdateTx, CORE_CLASS_CREATETX, CreateTx, Attribute, CORE_CLASS_SETOF } from '@anticrm/core'
import { VDocIndex, TitleIndex, TextIndex, TxIndex } from '@anticrm/core'

import WebSocket from 'ws'
import { makeResponse, Response } from './rpc'
import { PlatformServer } from './server'


interface CommitInfo {
  created: Doc[]
}

export interface ClientControl {
  ping (): Promise<void>
  send (response: Response<unknown>): void
  shutdown (): Promise<void>
  getUserSpaces () : Promise<Ref<Space>[]>
}

export async function connect (uri: string, dbName: string, account: string, ws: WebSocket, server: PlatformServer): Promise<CoreProtocol & ClientControl> {
  console.log('connecting to ' + uri.substring(25))
  console.log('use dbName ' + dbName)
  console.log('connected client account ' + account)
  const client = await MongoClient.connect(uri, { useUnifiedTopology: true })
  const db = client.db(dbName)

  const memdb = new Model(MODEL_DOMAIN)
  console.log('loading model...')
  const model = await db.collection('model').find({}).toArray()
  console.log('model loaded.')
  memdb.loadModel(model)

  const spaceKey = '_space'

  // const graph = new Graph(memdb)
  // console.log('loading graph...')
  // db.collection(CoreDomain.Tx).find({}).forEach(tx => graph.updateGraph(tx), () => console.log(graph.dump()))
  // console.log('graph loaded.')

  async function getUserSpaces (): Promise<Ref<Space>[]> {
    // find spaces where [users] contain the current account

    const spaceClassId = CORE_CLASS_SPACE
    const domain = memdb.getDomain(spaceClassId)
    const cls = memdb.getClass(spaceClassId)

    const spaces = await db.collection(domain)
      .find({ users: { $elemMatch: { $eq: account }}, _class: cls })
      .project({ _id: true }) // need only space ids
      .toArray()

    // pass null and undefined here to obtain documents not assigned to any space
    // TODO: remove 'General' and 'Random' when implement public spaces concept
    let userSpaceIds: Ref<Space>[] = [
      null as unknown as Ref<Space>,
      undefined as unknown as Ref<Space>,
      'space:workbench.General' as Ref<Space>,
      'space:workbench.Random' as Ref<Space>
    ]

    return spaces ? userSpaceIds.concat(spaces.map(space => space._id)) : userSpaceIds
  }

  async function find (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc[]> {
    const domain = memdb.getDomain(_class)
    const cls = memdb.getClass(_class)
    const q = {}
    memdb.assign(q, _class, query)

    const mongoQuery = { ...q, _class: cls}
    const userSpaces = await getUserSpaces()

    if (spaceKey in mongoQuery) {
      // check user-given '_space' filter
      const spaceInQuery = (mongoQuery as any)[spaceKey]

      if (userSpaces.indexOf(spaceInQuery) >= 0) {
        // OK, use that filter to query
      } else {
        // the requested space is NOT in the list of available to the user!
        return []
      }
    } else {
      // no user-given '_space' filter, use all spaces available to the user
      (mongoQuery as any)[spaceKey] = { $in: userSpaces }
    }

    return db.collection(domain).find(mongoQuery).toArray()
  }

  const mongoStorage: Storage = {
    async store (doc: Doc): Promise<any> {
      const domain = memdb.getDomain(doc._class)
      console.log('STORE:', domain, doc)
      return db.collection(domain).insertOne(doc)
    },

    async push (_class: Ref<Class<Doc>>, _id: Ref<Doc>, attribute: string, attributes: any): Promise<any> {
      const domain = memdb.getDomain(_class)
      const clazz = memdb.get(_class) as Class<Doc>
      const attr = (clazz._attributes as any)[attribute] as Attribute
      const addValueToSet = attr && memdb.is(attr.type._class, CORE_CLASS_SETOF)

      const updateValue = { [attribute]: attributes }
      const updateQuery = addValueToSet ? { $addToSet : updateValue } : { $push: updateValue }
      return db.collection(domain).updateOne({ _id }, updateQuery)
    },

    async update (_class: Ref<Class<Doc>>, selector: object, attributes: any): Promise<any> {
      const domain = memdb.getDomain(_class)
      return db.collection(domain).updateOne(selector, { $set: attributes })
    },

    async remove (_class: Ref<Class<Doc>>, doc: Ref<Doc>): Promise<any> {
      throw new Error('Not implemented')
    },

    async find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
      throw new Error('find not implemented')
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

    find,

    findOne (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc | undefined> {
      return find(_class, query).then(result => result.length > 0 ? result[0] : undefined)
    },

    async tx (tx: Tx): Promise<void> {
      let spaceTouched: Ref<Space>

      if (tx._class === CORE_CLASS_CREATETX) {
        const createTx = tx as CreateTx

        if (spaceKey in createTx.object) {
          const objectSpace = (createTx.object as any)[spaceKey]

          if (createTx.object._class !== CORE_CLASS_SPACE && (await getUserSpaces()).indexOf(objectSpace) < 0) {
            // TODO: reply with error response here
            console.log(`!!! The account '${account}' does not have access to the space '${objectSpace}' where it wanted to create an object`)
            return
          }

          spaceTouched = objectSpace
        } else {
          // no space provided, all accounts will have access to the created object (leave spaceTouched undefined)
        }
      } else if (tx._class === CORE_CLASS_UPDATETX) {
        const updateTx = tx as UpdateTx
        const updatingObject = await clientControl.findOne(updateTx._objectClass, { _id: updateTx._objectId})

        if (!updatingObject) {
          // TODO: reply with error response here
          console.log(`!!! The object '${updateTx._id}' is not found or is not accessible to the account '${account}'`)
          return
        }

        if (spaceKey in updatingObject) {
          spaceTouched = (updatingObject as any)[spaceKey]
        }
      }

      return txProcessor.process(tx).then(() => {
        server.broadcast(clientControl, spaceTouched, { result: tx })
      })
    },

    async loadDomain (domain: string): Promise<Doc[]> {
      if (domain === MODEL_DOMAIN)
        return memdb.dump()
      console.log('domain:', domain)
      return db.collection(domain).find({ _space: { $in: await getUserSpaces() }}).toArray()
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
    },

    getUserSpaces
  }

  return clientControl
}
