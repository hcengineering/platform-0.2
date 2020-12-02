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

import { AnyLayout, Class, CoreProtocol, Doc, Ref, Tx } from '@anticrm/core'
import WebSocket from 'ws'
import { makeResponse, Response } from './rpc'
import { PlatformServer } from './server'
import { WorkspaceProtocol } from './workspace'

interface CommitInfo {
  created: Doc[]
}

export interface ClientControl {
  ping(): Promise<void>
  send(response: Response<unknown>): void
  shutdown(): Promise<void>
}

export async function connect(workspaceProtocol: Promise<WorkspaceProtocol>, ws: WebSocket, server: PlatformServer): Promise<CoreProtocol & ClientControl> {
  const workspace = await workspaceProtocol
  const clientControl = {
    // C O R E  P R O T O C O L
    ...workspace,

    // Handle sending from client.
    async tx(tx: Tx): Promise<void> {
      return workspace.tx(tx).then(() => {
        server.broadcast(clientControl, { result: tx })
      })
    },

    // P R O T C O L  E X T E N S I O N S

    delete(_class: Ref<Class<Doc>>, query: AnyLayout): Promise<void> {
      return workspace.delete(_class, query).then(() => {
        // Do we need to send update on delete?
        // server.broadcast(fromClient, )
      })
    },

    async commit(commitInfo: CommitInfo): Promise<void> {
      workspace.commit(commitInfo).then(() => {
        server.broadcast(clientControl, { result: commitInfo })
      })
    },

    // C O N T R O L

    async ping(): Promise<any> {
      return null
    },

    send<R>(response: Response<R>): void {
      ws.send(makeResponse(response))
    },

    // TODO rename to `close`
    shutdown(): Promise<void> {
      return workspace.shutdown()
    },

    serverShutdown(password: string): Promise<void> {
      return server.shutdown(password)
    }
  }

  return clientControl
}
