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

import { Platform, readResponse, ReqId, Request, serialize } from '@anticrm/platform'

import client, { EventListener, NetworkActivity, RpcService } from '.'

/*!
  * Anticrm Platform™ Remote Procedure Call Plugin
  * Copyright © 2020 Anticrm Platform Contributors. All Rights Reserved.
  * Licensed under the Eclipse Public License, Version 2.0
  */
export default async (platform: Platform): Promise<RpcService> => {
  interface PromiseInfo {
    resolve: (value?: any) => void,
    reject: (error: any) => void
  }

  const requests = new Map<ReqId, PromiseInfo>()
  let lastId = 0

  function createWebsocket() {
    const host = platform.getMetadata(client.metadata.WSHost)
    const port = platform.getMetadata(client.metadata.WSPort)
    const token = platform.getMetadata(client.metadata.WSToken)

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
            platform.broadcastEvent(NetworkActivity, true)
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
      const ws = await getWebSocket()
      const request = new Request(method, params)
      const id = ++lastId
      request.id = id
      requests.set(id, { resolve, reject })
      platform.broadcastEvent(NetworkActivity, true)
      ws.send(serialize(request))
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
