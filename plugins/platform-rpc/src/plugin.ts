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

import client, { RpcService, ReqId, Request, Response, EventListener } from '.'

/*!
  * Anticrm Platform™ Remote Procedure Call Plugin
  * Copyright © 2020 Anticrm Platform Contributors. All Rights Reserved.
  * Licensed under the Eclipse Public License, Version 2.0
  */
export default async (platform: Platform): Promise<RpcService> => {

  const host = platform.getMetadata(client.metadata.WSHost) || 'localhost'
  const port = platform.getMetadata(client.metadata.WSPort) || 18080

  // { tenant: 'latest-model' }
  const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJsYXRlc3QtbW9kZWwifQ.hKZDHkhxNL-eCOqk5NFToVh43KOGshLS4b6DgztJQqI'

  const websocket = new Promise<WebSocket>((resolve, reject) => {
    const ws = new WebSocket('ws://' + host + ':' + port + '/' + token)
    ws.onopen = () => {
      resolve(ws)
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
        } else {
          throw new Error('unknown rpc id')
        }
      }
    }

  })

  interface PromiseInfo { resolve: (value?: any) => void, reject: (error: any) => void }
  const requests = new Map<ReqId, PromiseInfo>()
  let lastId = 0

  function makeRequest<P extends any[]> (request: Request<P>): string {
    return JSON.stringify(request)
  }

  function getResponse<D> (res: string): Response<D> {
    return JSON.parse(res as string)
  }

  function request<P extends any[], R> (method: string, ...params: P): Promise<R> {
    console.log('<<<<<<< ' + method)
    console.log(params)
    return new Promise<any>(async (resolve, reject) => {
      const id = ++lastId
      requests.set(id, { resolve, reject })
      const ws = await websocket
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