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

import { Platform, PlatformStatus, Severity, Status } from '@anticrm/platform'
import { readResponse, ReqId, serialize } from '@anticrm/rpc'
import core from '.'
import { PlatformStatusCodes } from '@anticrm/foundation'

export type EventListener = (event: unknown) => void

export enum EventType {
  Transaction, // A normal transaction with data modification
  TransientTransaction // A transient transaction with derived data modification.
}

export interface RpcService {
  request: <R>(method: string, ...params: any[]) => Promise<R>
  addEventListener: (type: EventType, listener: EventListener) => void
}

export default (platform: Platform): RpcService => {
  interface PromiseInfo {
    resolve: (value?: any) => void
    reject: (error: any) => void
  }

  const requests = new Map<ReqId, PromiseInfo>()
  let lastId = 0

  function createWebsocket (): Promise<WebSocket> { // eslint-disable-line @typescript-eslint/promise-function-async
    const host = platform.getMetadata(core.metadata.WSHost) ?? 'localhost'
    const port = platform.getMetadata(core.metadata.WSPort) ?? 3000

    const token = platform.getMetadata(core.metadata.Token)

    if (token === undefined) {
      platform.broadcastEvent(PlatformStatus, new Status(Severity.ERROR, PlatformStatusCodes.AUTHENTICATON_REQUIRED, 'Authentication is required'))
      return Promise.reject(new Error('authentication required'))
    }
    return new Promise<WebSocket>((resolve) => {
      // Let's sure token is valid one
      const ws = new WebSocket(`ws://${host}:${port}/${token}`)
      ws.onopen = () => {
        resolve(ws)
      }

      ws.onerror = (ev: Event) => {
        console.log('websocket error: ', ev)
        // reject all pending requests
        for (const info of requests.values()) {
          info.reject(ev)
        }
        requests.clear()
      }

      ws.onmessage = (ev: MessageEvent) => {
        const response = readResponse(ev.data)
        if (response.id === undefined) {
          if (response.result !== undefined) {
            for (const listener of (listeners.get(EventType.Transaction) ?? [])) {
              listener(response.result)
            }
          }
        } else {
          const promise = requests.get(response.id)
          if (promise != null) {
            if (response.error != null) {
              promise.reject(response.error)
            } else {
              promise.resolve(response.result)
            }
            requests.delete(response.id)
          } else {
            throw new Error('unknown rpc id')
          }
        }
        if ((response.clientTx != null) && response.clientTx.length > 0) {
          for (const listener of (listeners.get(EventType.TransientTransaction) ?? [])) {
            listener(response.clientTx)
          }
        }
      }
    })
  }

  let websocket: WebSocket | undefined

  async function getWebSocket (): Promise<WebSocket> {
    if (websocket === undefined || websocket.readyState === WebSocket.CLOSED || websocket.readyState === WebSocket.CLOSING) {
      websocket = await createWebsocket()
    }
    return websocket
  }

  async function request<R> (method: string, ...params: any[]): Promise<R> {
    return await new Promise<any>((resolve, reject) => {
      const id = ++lastId
      requests.set(id, {
        resolve,
        reject
      })
      getWebSocket().then((ws: WebSocket) => { // eslint-disable-line
        ws.send(serialize({
          id,
          method,
          params
        }))
      }).catch((err: any) => {
        reject(err)
      })
    })
  }

  const listeners: Map<EventType, EventListener[]> = new Map()

  return {
    request,
    addEventListener (type: EventType, listener: EventListener) {
      let val = listeners.get(type)
      if (val === undefined) {
        val = []
        listeners.set(type, val)
      }
      val.push(listener)
    }
  }
}
