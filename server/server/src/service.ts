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

import { WorkspaceProtocol } from './workspace'

import {
  filterQuery, getUserSpaces, isAcceptable, processTx as processSpaceTx, SecurityContext, UserInfo
} from './spaces'
import { Broadcaster, Client, ClientService, ClientSocket } from './server'
import { AnyLayout, Class, Doc, DocumentQuery, FindOptions, generateId, Ref, Tx, txContext, TxContextSource } from '@anticrm/core'
import { CORE_CLASS_CREATE_TX, CORE_CLASS_SPACE, Space } from '@anticrm/domains'
import { Response, serialize } from '@anticrm/rpc'

export interface ClientControl {
  ping: () => Promise<void>

  send: (ctx: SecurityContext, response: Response<any>) => Promise<void>

  close: () => Promise<void>

  getId: () => string
}

let clientIndex = 0

export async function createClientService (workspaceProtocol: Promise<WorkspaceProtocol>, client: ClientSocket & Client, broadcaster: Broadcaster): Promise<ClientService> {
  const workspace = await workspaceProtocol

  const userSpaces: Map<string, UserInfo> = await getUserSpaces(workspace, client.email)

  const clientId = `${generateId()} ${(clientIndex++)}`

  const clientControl: ClientService = {
    getId: () => clientId,
    // C O R E  P R O T O C O L
    async find<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): Promise<T[]> {
      const {
        valid,
        filteredQuery
      } = filterQuery(userSpaces, _class, query)
      if (valid) {
        try {
          return await workspace.find(_class, filteredQuery as DocumentQuery<T>, options)
        } catch (err) {
          console.log(err)
        }
      }
      return await Promise.reject(new Error('Invalid space are specified'))
    },
    async findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
      const {
        valid,
        filteredQuery
      } = filterQuery(userSpaces, _class, query)
      if (valid) {
        return await workspace.findOne(_class, filteredQuery as DocumentQuery<T>)
      }
      return await Promise.reject(new Error('Invalid space are spefified'))
    },
    async loadDomain (domain: string): Promise<Doc[]> {
      const docs = await workspace.loadDomain(domain)
      return docs.filter((d) => isAcceptable(userSpaces, d))
    },

    // Handle sending from client.
    async tx (tx: Tx): Promise<{ clientTx: Tx[] }> {
      if (tx._user !== client.email) {
        return await Promise.reject(new Error(`invalid user passed: ${tx._user}`))
      }

      // Process spaces update is allowed
      const ctx: SecurityContext = { docs: [] }

      const spaceResult = await processSpaceTx(ctx, workspace, userSpaces, tx, client, true)
      if (!spaceResult.allowed) {
        return await Promise.reject(new Error('operations is not allowed by space check'))
      }
      const context = txContext(TxContextSource.Server)
      // Perform operation in workspace
      await workspace.tx(context, tx)

      // Perform all other active clients broadcast
      broadcaster.broadcast(clientControl, {
        result: tx,
        clientTx: context.clientTx
      }, ctx)
      return {
        clientTx: context.clientTx
      }
    },
    async genRefId (_space: Ref<Space>): Promise<Ref<Doc>> {
      if (userSpaces.has(_space)) {
        return await workspace.genRefId(_space)
      }
      return await Promise.reject(new Error('User not included into space ' + _space))
    },

    // C O N T R O L

    async ping (): Promise<any> {
      await Promise.resolve()
    },

    async send (ctx: SecurityContext, response: Response<any>): Promise<void> {
      if (response.result !== undefined) {
        // Process result as it from another client.
        const spaceTxResult = await processSpaceTx(ctx, workspace, userSpaces, response.result, client, false)
        if (!spaceTxResult.allowed) {
          // Client is not allowed to receive transaction
          return
        }
        if (spaceTxResult.sendSpace !== undefined) {
          // We need to send a create transaction for this space object creation, to allow process.
          const createSpaceTx = await workspace.findOne(CORE_CLASS_CREATE_TX, {
            _objectClass: CORE_CLASS_SPACE,
            _objectId: spaceTxResult.sendSpace._id
          })
          if (createSpaceTx !== undefined) {
            // update object value to latest one
            createSpaceTx.object = (spaceTxResult.sendSpace as unknown) as AnyLayout
            client.send(serialize({}))
            // No need to send space update operation, since client will recieve a full and final space object
            return
          }
        }
      }
      client.send(serialize(response))
    },

    async close (): Promise<void> {
      await workspace.close()
    },
    workspaceId: client.workspace
  }

  return clientControl
}
