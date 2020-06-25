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

import { Platform, NetworkActivity } from '@anticrm/platform'
import { ReqId, makeRequest, getResponse } from '@anticrm/rpc'

import client, { RpcService, EventListener } from '.'

/*!
  * Anticrm Platform™ Remote Procedure Call Plugin
  * Copyright © 2020 Anticrm Platform Contributors. All Rights Reserved.
  * Licensed under the Eclipse Public License, Version 2.0
  */
export default async (platform: Platform): Promise<RpcService> => {

  interface PromiseInfo { resolve: (value?: any) => void, reject: (error: any) => void }
  const requests = new Map<ReqId, PromiseInfo>()
  let lastId = 0

  function createWebsocket () {
    const host = platform.getMetadata(client.metadata.WSHost)
    const port = platform.getMetadata(client.metadata.WSPort)

    // { tenant: 'latest-model' }
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJsYXRlc3QtbW9kZWwifQ.hKZDHkhxNL-eCOqk5NFToVh43KOGshLS4b6DgztJQqI'

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
        const response = getResponse(ev.data)
        console.log('>>>>>>>>>')
        console.log(ev.data)
        console.log('----------')
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
            if (requests.size === 0) {
              platform.broadcastEvent(NetworkActivity, false)
            }
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
    console.log('<<<<<<< ' + method)
    console.log(params)
    return new Promise<any>(async (resolve, reject) => {
      const id = ++lastId
      if (requests.size === 0) {
        platform.broadcastEvent(NetworkActivity, true)
      }
      requests.set(id, { resolve, reject })
      const ws = await getWebSocket()
      ws.send(makeRequest({ id, method, params }))
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