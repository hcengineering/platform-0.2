//
// Copyright © 2021 Anticrm Platform Contributors.
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

import { CoreProtocol, generateId as genId } from '@anticrm/core'
import { ClientService, EventType, RpcClient, EventListener } from '@anticrm/client/src/common'
import rpcService, { newCoreProtocol } from '@anticrm/client/src/rpc'

export { EventListener, EventType, ClientService }

/**
 * Construct a A generic Platform client.
 */
export async function newClient (token: string, host: string, port: number): Promise<ClientService> {
  const rawClient = rpcService(() => newRpcClient(token, host, port))

  const coreProtocol: CoreProtocol = newCoreProtocol(rawClient)

  const service: ClientService = {
    ...coreProtocol,
    generateId: genId,
    close: () => rawClient.close(),
    addEventListener: rawClient.addEventListener,
    request: rawClient.request
  }
  return service
}

function newRpcClient (token: string, host: string, port: number): RpcClient {
  const ws = new WebSocket(`ws://${host}:${port}/${token}`)
  const d: RpcClient = {
    close: () => { ws.close() },
    send: (data) => ws.send(data),
    onOpen: (op) => { ws.onopen = op },
    onClose: (op) => { ws.onclose = op },
    onMessage: (op) => { ws.onmessage = op },
    onError: (op) => { ws.onerror = op },
    isdone: () => ws.readyState === ws.CLOSING || ws.readyState === ws.CLOSED
  }
  return d
}
