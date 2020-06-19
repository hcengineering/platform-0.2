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

import client, { RpcService, ReqId, Request, Response } from '.'

/*!
  * Anticrm Platform™ Remote Procedure Call Plugin
  * Copyright © 2020 Anticrm Platform Contributors. All Rights Reserved.
  * Licensed under the Eclipse Public License, Version 2.0
  */
export default async (platform: Platform): Promise<RpcService> => {

  const host = platform.getMetadata(client.metadata.WSHost) || 'localhost'
  const port = platform.getMetadata(client.metadata.WSPort) || 18080

  // { tenant: 'company1' }
  const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJjb21wYW55MSJ9.t8xg-wosznL6qYTCvsHfznq_Xe7iHeGjU1VAUBgyy7s'

  const websocket = new WebSocket('ws://' + host + ':' + port + '/' + token)

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
    return new Promise<any>((resolve, reject) => {
      const id = ++lastId
      requests.set(id, { resolve, reject })
      websocket.send(makeRequest({ id, method, params }))
    })
  }

  websocket.onmessage = (ev: MessageEvent) => {
    const response = getResponse(ev.data)
    if (!response.id) { throw new Error('rpc id should not be null') }
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

  return {
    request,
  }

}