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

import { Ref, Class, Doc, AnyLayout, MODEL_DOMAIN, CoreProtocol, Tx, TxProcessor, ModelIndex,
  Space, CORE_CLASS_SPACE, CORE_CLASS_UPDATETX, UpdateTx, CORE_CLASS_CREATETX, CreateTx,
  CORE_CLASS_PUSHTX, CORE_CLASS_DELETETX, PushTx, SpaceIndex } from '@anticrm/core'
import { VDocIndex, TitleIndex, TextIndex, TxIndex } from '@anticrm/core'

import WebSocket from 'ws'
import { makeResponse, Response } from './rpc'
import { PlatformServer } from './server'
import { SpaceStorage } from './spaceStorage'
import { MongoStorage } from './mongo'


interface CommitInfo {
  created: Doc[]
}

export interface ClientControl {
  ping (): Promise<void>
  send (response: Response<unknown>): void
  shutdown (): Promise<void>
}

export async function connect (uri: string, dbName: string, account: string, ws: WebSocket, server: PlatformServer): Promise<CoreProtocol & ClientControl> {

  const mongoStorage = new MongoStorage()
  await mongoStorage.initialize(uri, dbName)
  const modelDb = mongoStorage.getModelDb()

  async function getUserSpaces (): Promise<Ref<Space>[]> {
    // find spaces where [users] contain the current account

    const usersQuery = { users: { $elemMatch: { $eq: account }}} as unknown as AnyLayout
    const getOnlyIdsOption = { projection: { _id: true }} as unknown as AnyLayout
    const spaces: Space[] = await mongoStorage.find(CORE_CLASS_SPACE, usersQuery, getOnlyIdsOption)

    // pass null and undefined here to obtain documents not assigned to any space
    // TODO: remove 'General' and 'Random' when implement public spaces concept
    let userSpaceIds: Ref<Space>[] = [
      null as unknown as Ref<Space>,
      undefined as unknown as Ref<Space>,
      'space:workbench.General' as Ref<Space>,
      'space:workbench.Random' as Ref<Space>
    ]

    return userSpaceIds.concat(spaces.map(space => space._id as Ref<Space>))
  }

  function getSpaceKey (_class: Ref<Class<Doc>>): string {
    // for Space objects use their Id to filter available ones
    return _class === CORE_CLASS_SPACE ? '_id' : '_space'
  }

  async function getSpaceUsers (space: Ref<Space>): Promise<string[]> {
    const getOnlyUsersOption = { projection: { users: true }} as unknown as AnyLayout
    const doc = await mongoStorage.findOne(CORE_CLASS_SPACE, { _id: space }, getOnlyUsersOption)
    return doc && doc.users ? doc.users : []
  }

  async function getObjectSpace (_class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<Ref<Space>> {
    if (_class === CORE_CLASS_SPACE) {
      return _id as Ref<Space>
    }

    const getOnlySpaceOption = { projection: { _space: true }} as unknown as AnyLayout
    const doc = await mongoStorage.findOne(_class, { _id }, getOnlySpaceOption)
    return doc ? (doc as any)._space : null
  }

  async function find (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc[]> {
    const userSpaces = await getUserSpaces()
    const spaceKey = getSpaceKey(_class)

    if (spaceKey in query) {
      // check user-given filter by space
      const spaceInQuery = query[spaceKey] as Ref<Space>

      if (userSpaces.indexOf(spaceInQuery) < 0) {
        // the requested space is NOT in the list of available to the user!
        return []
      }
      // else OK, use that filter to query
    } else {
      // the user didn't provide any filter by space, use all spaces available to the user
      query[spaceKey] = { $in: userSpaces }
    }

    return mongoStorage.find(_class, query)
  }

  const txProcessor = new TxProcessor([
    new TxIndex(mongoStorage),
    new SpaceIndex(modelDb, new SpaceStorage(mongoStorage)),
    new VDocIndex(modelDb, mongoStorage),
    new TitleIndex(modelDb, mongoStorage),
    new TextIndex(modelDb, mongoStorage),
    new ModelIndex(modelDb, mongoStorage)
  ])

  interface CheckRightsResult {
    objectSpace?: Ref<Space>
    error?: string
  }

  async function checkRightsToModify (_class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<CheckRightsResult> {
    const objectSpace = await getObjectSpace(_class, _id)

    if (objectSpace && (await getUserSpaces()).indexOf(objectSpace) < 0) {
      return {
        error: `The account '${account}' does not have access to the space '${objectSpace}' where it wanted to modify the object '${_id}'`
      }
    }

    return { objectSpace }
  }

  async function checkRightsToCreate (object: Doc): Promise<CheckRightsResult> {
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

  async function checkRightsForTx (tx: Tx): Promise<CheckRightsResult> {
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

      return txProcessor.process(tx).then(async () => {
        const spaceUsers = spaceTouched ? await getSpaceUsers(spaceTouched) : []
        server.broadcast(clientControl, spaceUsers, { result: tx })
      })
    },

    async loadDomain (domain: string): Promise<Doc[]> {
      if (domain === MODEL_DOMAIN)
        return modelDb.dump()

      console.log('loadDomain:', domain)
      const spaceKey = getSpaceKey(domain === 'space' ? CORE_CLASS_SPACE : '' as Ref<Class<Doc>>)
      const mongoQuery = {} as any
      (mongoQuery as any)[spaceKey] = { $in: await getUserSpaces() }

      return mongoStorage.findInDomain(domain, mongoQuery)
    },

    // C O N T R O L

    async ping (): Promise<any> { return null },

    send<R> (response: Response<R>): void {
      ws.send(makeResponse(response))
    },

    // TODO rename to `close`
    shutdown (): Promise<void> {
      return mongoStorage.close()
    },

    serverShutdown (password: string): Promise<void> {
      return server.shutdown(password)
    }
  }

  return clientControl
}
