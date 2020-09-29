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
  Space, CORE_CLASS_SPACE, CORE_CLASS_UPDATETX, UpdateTx, CORE_CLASS_CREATETX, CreateTx, Attribute,
  CORE_CLASS_ARRAYOF, ArrayOf, CORE_CLASS_PUSHTX, CORE_CLASS_DELETETX, PushTx, SpaceIndex } from '@anticrm/core'
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
      .find({ users: { $elemMatch: { $eq: account }}, _class: cls }, { projection: { _id: true }})
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

  function getSpaceKey(_class: Ref<Class<Doc>>): string {
    // for Space objects use their Id to filter available ones
    return _class === CORE_CLASS_SPACE ? '_id' : '_space'
  }

  async function getObjectSpace (_class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<Ref<Space>> {
    if (_class === CORE_CLASS_SPACE) {
      return _id as Ref<Space>
    }
    const domain = memdb.getDomain(_class)
    const doc = await db.collection(domain).findOne({ _id }, { projection: { _space: true }})
    return doc ? doc._space : null
  }

  async function find (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc[]> {
    const domain = memdb.getDomain(_class)
    const cls = memdb.getClass(_class)
    const q = {}
    memdb.assign(q, _class, query)

    const mongoQuery = { ...q, _class: cls}
    const userSpaces = await getUserSpaces()
    const spaceKey = getSpaceKey(_class)

    if (spaceKey in mongoQuery) {
      // check user-given '_space' filter
      const spaceInQuery = (mongoQuery as any)[spaceKey]

      if (userSpaces.indexOf(spaceInQuery) < 0) {
        // the requested space is NOT in the list of available to the user!
        return []
      }
      // else OK, use that filter to query
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
      const addToUniqueCollection = attr && memdb.is(attr.type._class, CORE_CLASS_ARRAYOF) && (attr.type as ArrayOf<any>).unique

      const updateValue = { [attribute]: attributes }
      const updateQuery = addToUniqueCollection ? { $addToSet : updateValue } : { $push: updateValue }
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
    new SpaceIndex(memdb, mongoStorage),
    new VDocIndex(memdb, mongoStorage),
    new TitleIndex(memdb, mongoStorage),
    new TextIndex(memdb, mongoStorage),
    new ModelIndex(memdb, mongoStorage)
  ])

  interface CheckRightsResult {
    objectSpace?: Ref<Space>
    error?: string
  }

  async function checkRightsToModify(_class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<CheckRightsResult> {
    const objectSpace = await getObjectSpace(_class, _id)

    if (objectSpace && (await getUserSpaces()).indexOf(objectSpace) < 0) {
      return {
        error: `The account '${account}' does not have access to the space '${objectSpace}' where it wanted to modify the object '${_id}'`
      }
    }

    return { objectSpace }
  }

  async function checkRightsToCreate(object: Doc): Promise<CheckRightsResult> {
    let objectSpace: Ref<Space> = undefined as unknown as Ref<Space>
    const spaceKey = getSpaceKey(object._class)

    if (spaceKey in object) {
      objectSpace = (object as any)[spaceKey]

      if (object._class !== CORE_CLASS_SPACE && objectSpace && (await getUserSpaces()).indexOf(objectSpace) < 0) {
        return {
          error: `The account '${account}' does not have access to the space '${objectSpace}' where it wanted to create the object '${object._id}'`
        }
      }
    } // else no space provided, all accounts will have access to the created object

    return { objectSpace }
  }

  async function checkRightsForTx(tx: Tx): Promise<CheckRightsResult> {
    switch (tx._class) {
      case CORE_CLASS_CREATETX:
        return checkRightsToCreate((tx as CreateTx).object)
      case CORE_CLASS_UPDATETX:
        const updateTx = tx as UpdateTx
        return checkRightsToModify(updateTx._objectClass, updateTx._objectId)
      case CORE_CLASS_PUSHTX:
        const pushTx = tx as PushTx
        return checkRightsToModify(pushTx._objectClass, pushTx._objectId)
      case CORE_CLASS_DELETETX:
        // TODO
        return {}
      default:
        return { error: `Bad transaction type '${tx._class}'` }
    }
  }

  const clientControl = {

    // C O R E  P R O T O C O L

    find,

    findOne (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc | undefined> {
      return find(_class, query).then(result => result.length > 0 ? result[0] : undefined)
    },

    async tx (tx: Tx): Promise<void> {
      const checkRightsResult = await checkRightsForTx(tx)

      if (checkRightsResult.error) {
        // TODO: reply with error response here
        console.log(checkRightsResult.error)
        return
      }

      // A space whose object will be modified by this transaction.
      // All clients that have access to this space will get notifications about the change.
      const spaceTouched = checkRightsResult.objectSpace

      return txProcessor.process(tx).then(() => {
        server.broadcast(clientControl, spaceTouched, { result: tx })
      })
    },

    async loadDomain (domain: string): Promise<Doc[]> {
      if (domain === MODEL_DOMAIN)
        return memdb.dump()

      console.log('loadDomain:', domain)
      const spaceKey = getSpaceKey(domain === 'space' ? CORE_CLASS_SPACE : '' as Ref<Class<Doc>>)
      const mongoQuery = {} as any
      (mongoQuery as any)[spaceKey] = { $in: await getUserSpaces() }

      return db.collection(domain).find(mongoQuery).toArray()
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
