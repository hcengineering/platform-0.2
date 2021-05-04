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

import { Class, CoreProtocol, Doc, DocumentQuery, FindOptions, Ref, Tx } from '@anticrm/core'
import { Space, VDoc } from '@anticrm/domains'
import { FindResponse, readResponse, ReqId, RPC_CALL_FIND, RPC_CALL_FINDONE, RPC_CALL_GEN_REF_ID, RPC_CALL_LOAD_DOMAIN, RPC_CALL_TX, serialize } from '@anticrm/rpc'
import { EventListener, EventType, MessageEvent, RpcClient } from './common'

export interface RpcService {
  request: <R>(method: string, ...params: any[]) => Promise<R>
  addEventListener: (type: EventType, listener: EventListener) => void
  close: () => void
}

export default (newRpcClient: () => RpcClient): RpcService => {
  interface PromiseInfo {
    resolve: (value?: any) => void
    reject: (error: any) => void
  }
  const requests = new Map<ReqId, PromiseInfo>()
  let lastId = 0

  function createClient (): Promise<RpcClient> { // eslint-disable-line @typescript-eslint/promise-function-async
    return new Promise<RpcClient>((resolve) => {
      // Let's sure token is valid one
      const ws: RpcClient = newRpcClient()

      ws.onOpen(() => {
        resolve(ws)
      })

      ws.onError((ev) => {
        console.log('websocket error: ', ev)
        // reject all pending requests
        for (const info of requests.values()) {
          info.reject(ev)
        }
        requests.clear()
      })

      ws.onMessage((event: MessageEvent) => {
        const response = readResponse(event.data)
        if (response.id === undefined) {
          if (response.result !== undefined) {
            for (const listener of (listeners.get(EventType.Transaction) ?? [])) {
              listener(response.result)
            }
          }
        } else {
          const promise = requests.get(response.id)
          if (promise !== undefined) {
            if (response.error !== undefined) {
              promise.reject(response.error)
            } else {
              promise.resolve(response.result)
            }
            requests.delete(response.id)
          } else {
            throw new Error('unknown rpc id')
          }
        }
        if ((response.clientTx !== undefined) && response.clientTx.length > 0) {
          for (const listener of (listeners.get(EventType.TransientTransaction) ?? [])) {
            listener(response.clientTx)
          }
        }
      })
    })
  }

  let websocket: RpcClient | undefined

  async function getWebSocket (): Promise<RpcClient> {
    if (websocket === undefined || (websocket.isdone())) {
      websocket = await createClient()
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
      getWebSocket().then((ws: RpcClient) => {
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

  function addEventListener (type: EventType, listener: EventListener): void {
    let val = listeners.get(type)
    if (val === undefined) {
      val = []
      listeners.set(type, val)
    }
    val.push(listener)
  }

  function close (): void {
    if (websocket !== undefined) {
      websocket.close()
    }
  }
  return {
    request,
    addEventListener,
    close
  }
}

export function newCoreProtocol (client: RpcService): CoreProtocol {
  return {
    async find<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): Promise<T[]> {
      const rpcResult = (await client.request<FindResponse<T>>(RPC_CALL_FIND, _class, query, options !== undefined ? options : null /* we send null since use JSON */))
      if (options?.countCallback !== undefined) {
        options.countCallback(rpcResult.skip, rpcResult.limit, rpcResult.count)
      }
      return rpcResult.values
    },
    async findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
      const result = (await client.request<T>(RPC_CALL_FINDONE, _class, query))
      return result
    },
    async tx (tx: Tx): Promise<any> {
      const result = await client.request(RPC_CALL_TX, tx)
      return result
    },
    loadDomain (domain: string): Promise<Doc[]> { // eslint-disable-line @typescript-eslint/promise-function-async
      return client.request(RPC_CALL_LOAD_DOMAIN, domain)
    },
    genRefId (_space: Ref<Space>): Promise<Ref<VDoc>> { // eslint-disable-line @typescript-eslint/promise-function-async
      return client.request(RPC_CALL_GEN_REF_ID, _space)
    }
  }
}
