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
import { Response, ReqId, readResponse, serialize } from '@anticrm/core'
import core from '.'
import login from '@anticrm/login'

export type EventListener = (event: Response<unknown>) => void

export interface RpcService {
  request<R> (method: string, ...params: any[]): Promise<R>
  addEventListener (listener: EventListener): void
}

export default (platform: Platform): RpcService => {

  interface PromiseInfo { resolve: (value?: any) => void, reject: (error: any) => void }
  const requests = new Map<ReqId, PromiseInfo>()
  let lastId = 0

  function createWebsocket () {
    const host = platform.getMetadata(core.metadata.WSHost)
    const port = platform.getMetadata(core.metadata.WSPort)
    const token = platform.getMetadata(login.metadata.Token)

    // console.log('token', platform.getMetadata(login.metadata.Token))
    // const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJsYXRlc3QtbW9kZWwifQ.hKZDHkhxNL-eCOqk5NFToVh43KOGshLS4b6DgztJQqI'

    return new Promise<WebSocket>((resolve, reject) => {
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
        // console.log('>>>>>>>>>')
        // console.log(ev.data)
        // console.log('----------')
        if (!response.id) {
          for (const listener of listeners) {
            listener(response)
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
            // if (requests.size === 0) {
            //   platform.broadcastEvent(NetworkActivity, false)
            // }
          } else {
            throw new Error('unknown rpc id')
          }
        }
      }
    })
  }

  let websocket: WebSocket | null = null
  async function getWebSocket () {
    if (websocket === null ||
      websocket.readyState === WebSocket.CLOSED ||
      websocket.readyState === WebSocket.CLOSING) {
      websocket = await createWebsocket()
    }
    return websocket
  }

  function request<R> (method: string, ...params: any[]): Promise<R> {
    // console.log('<<<<<<< ' + method)
    // console.log(params)
    return new Promise<any>(async (resolve, reject) => {
      const id = ++lastId
      // if (requests.size === 0) {
      //   platform.broadcastEvent(NetworkActivity, true)
      // }
      requests.set(id, { resolve, reject })
      const ws = await getWebSocket()
      ws.send(serialize({ id, method, params }))
    })
  }

  const listeners: EventListener[] = []

  return {
    request,
    addEventListener (listener: EventListener) {
      listeners.push(listener)
    }
  }

}