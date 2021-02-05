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

import { Platform } from '@anticrm/platform'
import { ReqId, readResponse, serialize } from '@anticrm/rpc'
import core from '.'
import login from '@anticrm/login'

export type EventListener = (event: unknown) => void

export enum EventType {
  Transaction, // A normal transaction with data modification
  TransientTransaction // A transient transaction with derived data modification.
}

export interface RpcService {
  request<R> (method: string, ...params: any[]): Promise<R>
  addEventListener (type: EventType, listener: EventListener): void
}

export default (platform: Platform): RpcService => {
  interface PromiseInfo {
    resolve: (value?: any) => void
    reject: (error: any) => void
  }

  const requests = new Map<ReqId, PromiseInfo>()
  let lastId = 0

  function createWebsocket () {
    const host = platform.getMetadata(core.metadata.WSHost)
    const port = platform.getMetadata(core.metadata.WSPort)
    const token = platform.getMetadata(login.metadata.Token)

    // console.log('token', platform.getMetadata(login.metadata.Token))
    // const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJsYXRlc3QtbW9kZWwifQ.hKZDHkhxNL-eCOqk5NFToVh43KOGshLS4b6DgztJQqI'

    return new Promise<WebSocket>((resolve, reject) => {
      if (token === undefined) {
        reject(new Error('authentication required'))
        return
      }
      const ws = new WebSocket('ws://' + host + ':' + port + '/' + token)
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
        if (!response.id) {
          if (response.result) {
            for (const listener of (listeners.get(EventType.Transaction) || [])) {
              listener(response.result)
            }
          }
        } else {
          const promise = requests.get(response.id)
          if (promise) {
            if (response.error) {
              promise.reject(response.error)
            } else {
              promise.resolve(response.result)
            }
            requests.delete(response.id)
          } else {
            throw new Error('unknown rpc id')
          }
        }
        if (response.clientTx && response.clientTx.length > 0) {
          for (const listener of (listeners.get(EventType.TransientTransaction) || [])) {
            listener(response.clientTx)
          }
        }
      }
    })
  }

  let websocket: WebSocket | null = null

  async function getWebSocket () {
    if (websocket === null || websocket.readyState === WebSocket.CLOSED || websocket.readyState === WebSocket.CLOSING) {
      websocket = await createWebsocket()
    }
    return websocket
  }

  function request<R> (method: string, ...params: any[]): Promise<R> {
    return new Promise<any>((resolve, reject) => {
      const id = ++lastId
      requests.set(id, {
        resolve,
        reject
      })
      getWebSocket().then(ws => {
        ws.send(serialize({
          id,
          method,
          params
        }))
      })
    })
  }

  const listeners: Map<EventType, EventListener[]> = new Map()

  return {
    request,
    addEventListener (type: EventType, listener: EventListener) {
      let val = listeners.get(type)
      if (!val) {
        val = []
        listeners.set(type, val)
      }
      val.push(listener)
    }
  }
}
