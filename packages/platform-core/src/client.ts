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

import { makeRequest, getResponse } from '@anticrm/platform-rpc/src/rpc'
import { Ref, Class, Doc } from '.'

export interface ClientService {
  find (_class: Ref<Class<Doc>>, query: {}): Promise<Doc[]>
  load (domain: string): Promise<Doc[]>
  ping (): Promise<void>
}

export function createClient (host: string, port?: number): Promise<ClientService> {

  // { tenant: 'company1' }
  const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJjb21wYW55MSJ9.t8xg-wosznL6qYTCvsHfznq_Xe7iHeGjU1VAUBgyy7s'

  const websocket = new WebSocket('ws://' + host + (port ? ':' + port : '') + '/' + token)

  const requests = new Map<number | string, (value?: any) => void>()
  let lastId = 0

  function request (meth: string, params: any[]): Promise<any> {
    console.log('sending request: ', meth)
    return new Promise<any>((resolve, reject) => {
      const id = ++lastId
      requests.set(id, resolve)
      websocket.send(makeRequest({ id, meth, params }))
    })
  }

  websocket.onmessage = (ev: MessageEvent) => {
    console.log('got response')
    const response = getResponse(ev.data)
    if (response.id === null) { throw new Error('rpc id should not be null') }
    const resolve = requests.get(response.id)
    if (resolve) {
      resolve(response.result)
    } else {
      throw new Error('unknown rpc id')
    }
  }

  return new Promise<ClientService>((resolve, reject) => {
    websocket.onopen = () => {
      resolve({
        find (_class: string, query: {}): Promise<[]> {
          return request('find', [_class, query])
        },
        load (domain: string): Promise<[]> {
          return request('load', [domain])
        },
        ping (): Promise<void> {
          return request('ping', [])
        }
      })
    }
  })

}

export function createNullClient (): ClientService {
  return {
    find (_class: string, query: {}): Promise<[]> {
      throw new Error('not implemented')
    },
    load (domain: string): Promise<[]> {
      throw new Error('not implemented')
    },
    ping (): Promise<void> {
      throw new Error('not implemented')
    }
  }
}