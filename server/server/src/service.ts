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
import { SecurityIndex } from './security'


export interface ClientControl {
  ping (): Promise<void>
  send (response: Response<unknown>): void
  shutdown (): Promise<void>
}

export async function connect (uri: string, dbName: string, account: string, ws: WebSocket, server: PlatformServer): Promise<CoreProtocol & ClientControl> {

  const mongoStorage = new MongoStorage()
  await mongoStorage.initialize(uri, dbName)
  const modelDb = mongoStorage.getModelDb()

  const spaceStorage = new SpaceStorage(mongoStorage)
  const securityIndex = new SecurityIndex(account, spaceStorage)

  const txProcessor = new TxProcessor([
    new TxIndex(mongoStorage),
    new SpaceIndex(modelDb, spaceStorage),
    new VDocIndex(modelDb, mongoStorage),
    new TitleIndex(modelDb, mongoStorage),
    new TextIndex(modelDb, mongoStorage),
    new ModelIndex(modelDb, mongoStorage)
  ])

  // TODO: move to SpaceStorage/SecurityIndex
  function getSpaceKey (_class: Ref<Class<Doc>>): string {
    // for Space objects use their Id to filter available ones
    return _class === CORE_CLASS_SPACE ? '_id' : '_space'
  }

  // TODO: move to SpaceStorage/SecurityIndex
  async function getSpaceUsers (space: Ref<Space>): Promise<string[]> {
    const getOnlyUsersOption = { projection: { users: true }} as unknown as AnyLayout
    const doc = await mongoStorage.findOne(CORE_CLASS_SPACE, { _id: space }, getOnlyUsersOption)
    return doc && doc.users ? doc.users : []
  }

  // TODO: move to SpaceStorage/SecurityIndex
  async function getObjectSpace (_class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<Ref<Space>> {
    if (_class === CORE_CLASS_SPACE) {
      return _id as Ref<Space>
    }

    const getOnlySpaceOption = { projection: { _space: true }} as unknown as AnyLayout
    const doc = await mongoStorage.findOne(_class, { _id }, getOnlySpaceOption)
    return doc ? (doc as any)._space : null
  }

  // TODO move to SecurityIndex
  interface CheckRightsResult {
    objectSpace?: Ref<Space>
    error?: string
  }

  // TODO move to SecurityIndex
  async function checkRightsToModify (_class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<CheckRightsResult> {
    const objectSpace = await getObjectSpace(_class, _id)

    if (objectSpace && (await spaceStorage.getUserSpaces(account)).indexOf(objectSpace) < 0) {
      return {
        error: `The account '${account}' does not have access to the space '${objectSpace}' where it wanted to modify the object '${_id}'`
      }
    }

    return { objectSpace }
  }

  // TODO move to SecurityIndex
  async function checkRightsToCreate (object: Doc): Promise<CheckRightsResult> {
    let objectSpace: Ref<Space> = undefined as unknown as Ref<Space>
    const spaceKey = getSpaceKey(object._class)

    if (spaceKey in object) {
      objectSpace = (object as any)[spaceKey]

      if (object._class !== CORE_CLASS_SPACE && objectSpace && (await spaceStorage.getUserSpaces(account)).indexOf(objectSpace) < 0) {
        return {
          error: `The account '${account}' does not have access to the space '${objectSpace}' where it wanted to create the object '${object._id}'`
        }
      }
    } // else no space provided, all accounts will have access to the created object

    return { objectSpace }
  }

  // TODO move to SecurityIndex
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

    async find (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc[]> {
      if (await securityIndex.filterQuery(_class, query)) {
        return mongoStorage.find(_class, query)
      }
      return []
    },

    async findOne (_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Doc | undefined> {
      if (await securityIndex.filterQuery(_class, query)) {
        const result = await mongoStorage.findOne(_class, query)
        if (result) {
          return result
        }
      }
      return undefined
    },

    async tx (tx: Tx): Promise<void> {
      const checkRightsResult = await checkRightsForTx(tx)

      if (checkRightsResult.error) {
        console.log(checkRightsResult.error)
        throw new Error(checkRightsResult.error)
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
      console.log('loadDomain:', domain)

      if (domain === MODEL_DOMAIN) {
        return modelDb.dump()
      }
      const query = {}
      const anyClassExceptSpace = '' as Ref<Class<Doc>>

      if (await securityIndex.filterQuery(domain === 'space' ? CORE_CLASS_SPACE : anyClassExceptSpace, query)) {
        return mongoStorage.findInDomain(domain, query)
      }
      return []
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
