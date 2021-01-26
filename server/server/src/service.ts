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

import { AnyLayout, Class, Doc, Model, Ref, StringProperty, Tx } from '@anticrm/model'
import { makeResponse, Response } from './rpc'
import { WorkspaceProtocol } from './workspace'

import { filterQuery, getUserSpaces, isAcceptable, processTx as processSpaceTx } from './spaces'
import { Broadcaster, Client, ClientService, ClientSocket } from './server'
import core, { CreateTx, SpaceUser } from '@anticrm/core'
import { newCreateTx } from '@anticrm/platform-core/src/tx'

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
      const {
        valid,
        filteredQuery
      } = await filterQuery(userSpaces, _class, query)
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
      const {
        valid,
        filteredQuery
      } = await filterQuery(userSpaces, _class, query)
      if (valid) {
        return workspace.findOne(_class, filteredQuery)
      }
      return Promise.reject(new Error('Invalid space are spefified'))
    },
    async loadDomain (domain: string, index?: string, direction?: string): Promise<Doc[]> {
      const docs = await workspace.loadDomain(domain, index, direction)
      const filteredDocs = docs.filter((d) => isAcceptable(userSpaces, d._class, (d as unknown) as AnyLayout), false)
      return filteredDocs
    },

    // Handle sending from client.
    async tx (tx: Tx): Promise<any> {
      if (tx._user !== client.email) {
        return Promise.reject(new Error(`invalid user passed: ${tx._user}`))
      }

      // Process spaces update is allowed
      const spaceResult = await processSpaceTx(workspace, userSpaces, tx, client, true)
      if (!spaceResult.allowed) {
        return Promise.reject(new Error('operations is not allowed by space check'))
      }
      // Perform operation in workspace
      await workspace.tx(tx)

      if (spaceResult.sendSpace) {
        // We need to send space create event before to allow client to accept our modification
      }
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
        const spaceTxResult = await processSpaceTx(workspace, userSpaces, response.result, client, false)
        if (!spaceTxResult.allowed) {
          // Client is not allowed to receive transaction
          return
        }
        if (spaceTxResult.sendSpace) {
          // We need to send a create transaction for this space object creation, to allow process.
          const createSpaceTx = await workspace.findOne(core.class.CreateTx, {
            _objectClass: core.class.Space,
            _objectId: spaceTxResult.sendSpace._id
          })
          if (createSpaceTx) {
            // update object value to latest one
            createSpaceTx.object = (spaceTxResult.sendSpace as unknown) as AnyLayout
            client.send(makeResponse({ result: createSpaceTx }))
            // No need to send space update operation, since client will recieve a full and final space object
            return
          }
        }
      }
      client.send(makeResponse(response))
    },

    close (): Promise<void> {
      return workspace.close()
    },

    getModel (): Promise<Model> {
      return workspace.getModel()
    }
  }

  return clientControl
}
