import { Class, CoreProtocol, Doc, DocumentQuery, FindOptions, Model, Ref, Tx } from '@anticrm/core'
import { Space, VDoc } from '@anticrm/domains'
import { FindResponse, readResponse, ReqId, RPC_CALL_FIND, RPC_CALL_FINDONE, RPC_CALL_GEN_REF_ID, RPC_CALL_LOAD_DOMAIN, RPC_CALL_TX, serialize } from '@anticrm/rpc'

export type EventListener = (event: unknown) => void

export enum EventType {
  Transaction, // A normal transaction with data modification
  TransientTransaction // A transient transaction with derived data modification.
}

interface PromiseInfo {
  resolve: (value?: any) => void
  reject: (error: any) => void
}
export interface RawClient {
  request: <R>(method: string, ...params: any[]) => Promise<R>
  addEventListener: (type: EventType, listener: EventListener) => void
  close: () => void
}

export function newRawClient (token: string, host: string, port: number): RawClient {
  const requests = new Map<ReqId, PromiseInfo>()
  let lastId = 0

  function createWebsocket (): Promise<WebSocket> { // eslint-disable-line @typescript-eslint/promise-function-async
    return new Promise<WebSocket>((resolve) => {
      // Let's sure token is valid one
      let ws: WebSocket
      if (typeof window === 'undefined') {
        const WebSocket = require('ws') // eslint-disable-line
        ws = new WebSocket(`ws://${host}:${port}/${token}`)
      } else {
        ws = new WebSocket(`ws://${host}:${port}/${token}`)
      }

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
      }
    })
  }

  let websocket: WebSocket | undefined

  async function getWebSocket (): Promise<WebSocket> {
    let need = false
    if (typeof window === 'undefined') {
      const WebSocket = require('ws') // eslint-disable-line
      need = websocket !== undefined && (websocket.readyState === WebSocket.CLOSED || websocket.readyState === WebSocket.CLOSING)
    } else {
      need = websocket !== undefined && (websocket.readyState === WebSocket.CLOSED || websocket.readyState === WebSocket.CLOSING)
    }
    if (websocket === undefined || need) {
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
  const rawClient: RawClient = {
    request,
    addEventListener,
    close
  }
  return rawClient
}

export function newCoreProtocol (client: RawClient, model: Model): CoreProtocol {
  return {
    async find<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>, options?: FindOptions<T>): Promise<T[]> {
      const rpcResult = (await client.request<FindResponse<T>>(RPC_CALL_FIND, _class, query, options !== undefined ? options : null /* we send null since use JSON */))
      if (options?.countCallback !== undefined) {
        options.countCallback(rpcResult.skip, rpcResult.limit, rpcResult.count)
      }
      return rpcResult.values.map((it) => model.as(it, _class))
    },
    async findOne<T extends Doc> (_class: Ref<Class<T>>, query: DocumentQuery<T>): Promise<T | undefined> {
      const result = (await client.request<T>(RPC_CALL_FINDONE, _class, query))
      if (result !== undefined) {
        return model.as(result, _class)
      }
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
