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

import { AnyLayout, Class, Doc, Ref, Tx } from '@anticrm/model'
import { makeResponse, Response } from './rpc'
import { WorkspaceProtocol } from './workspace'

import { filterQuery, getUserSpaces, isAcceptable, processTx as processSpaceTx } from './spaces'
import { Broadcaster, Client, ClientService, ClientSocket } from './server'
import { SpaceUser } from '@anticrm/core'

export interface ClientControl {
  ping (): Promise<void>
  send (response: Response<any>): Promise<void>
  close (): Promise<void>
}

export async function createClientService (workspaceProtocol: Promise<WorkspaceProtocol>, client: ClientSocket & Client, broadcaster: Broadcaster): Promise<ClientService> {
  const workspace = await workspaceProtocol

  const userSpaces: Map<string, SpaceUser> = await getUserSpaces(workspace, client.email)

  const clientControl: ClientService = {
    // C O R E  P R O T O C O L
    async find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T[]> {
      const { valid, filteredQuery } = await filterQuery(userSpaces, _class, query)
      if (valid) {
        try {
          return await workspace.find(_class, filteredQuery)
        } catch (err) {
          console.log(err)
        }
      }
      return Promise.reject(new Error('Invalid space are spefified'))
    },
    async findOne<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout): Promise<T | undefined> {
      const { valid, filteredQuery } = await filterQuery(userSpaces, _class, query)
      if (valid) {
        return workspace.findOne(_class, filteredQuery)
      }
      return Promise.reject(new Error('Invalid space are spefified'))
    },
    async loadDomain (domain: string, index?: string, direction?: string): Promise<Doc[]> {
      const docs = await workspace.loadDomain(domain, index, direction)
      const filteredDocs = docs.filter((d) => isAcceptable(userSpaces, d._class, (d as unknown) as AnyLayout))
      return filteredDocs
    },

    // Handle sending from client.
    async tx (tx: Tx): Promise<any> {
      if (tx._user !== client.email) {
        return Promise.reject(new Error(`invalid user passed: ${tx._user}`))
      }

      // Process spaces update is allowed
      if (!await processSpaceTx(workspace, userSpaces, tx, client, true)) {
        return Promise.reject(new Error('operations is not allowed by space check'))
      }

      // Perform operation in workpace
      await workspace.tx(tx)
      // Perform all other active clients broadcast
      broadcaster.broadcast(clientControl, { result: tx })
    },

    // C O N T R O L

    async ping (): Promise<any> {
      return null
    },

    async send (response: Response<any>): Promise<void> {
      if (response.result) {
        // Process result as it from another client.
        if (!await processSpaceTx(workspace, userSpaces, response.result, client, false)) {
          // Client is not allowed to recieve transaction
          return
        }
      }
      client.send(makeResponse(response))
    },

    close (): Promise<void> {
      return workspace.close()
    }
  }

  return clientControl
}
