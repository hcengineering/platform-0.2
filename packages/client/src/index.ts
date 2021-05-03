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

import { CoreProtocol, Doc, DocumentProtocol, generateId as genId, Ref } from '@anticrm/core'
import rpcService, { EventListener, EventType, newCoreProtocol } from './rpc'

export * from '@anticrm/rpc'

export interface ClientService extends CoreProtocol, DocumentProtocol {
  generateId: () => Ref<Doc>
  addEventListener: (type: EventType, listener: EventListener) => void
  close: () => void
}

/**
 * Construct a A generic Platform client.
 */
export async function newClient (factory: () => any/* WebSocket */): Promise<ClientService> {
  const rawClient = rpcService(factory)

  const coreProtocol: CoreProtocol = newCoreProtocol(rawClient)

  const service: ClientService = {
    ...coreProtocol,
    generateId: genId,
    close: () => rawClient.close(),
    addEventListener: rawClient.addEventListener
  }
  return service
}
