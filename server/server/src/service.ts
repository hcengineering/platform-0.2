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
 CORE_CLASS_SPACE, SpaceIndex } from '@anticrm/core'
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

  const txProcessor = new TxProcessor()
  txProcessor
    .add([securityIndex])
    .add([
      new TxIndex(mongoStorage),
      new SpaceIndex(modelDb, spaceStorage),
      new VDocIndex(modelDb, mongoStorage),
      new TitleIndex(modelDb, mongoStorage),
      new TextIndex(modelDb, mongoStorage),
      new ModelIndex(modelDb, mongoStorage)
    ])

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
      return txProcessor.process(tx).then(async () => {
        // all active connecitons having access to this space should receive notification about the change
        const spaceTouchedByTransaction = tx._space
        const usersToNotify = spaceTouchedByTransaction ? await spaceStorage.getSpaceUsers(spaceTouchedByTransaction) : []
        server.broadcast(clientControl, usersToNotify, { result: tx })
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
