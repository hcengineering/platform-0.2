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

import { createServer, IncomingMessage } from 'http'
import WebSocket, { AddressInfo, Server } from 'ws'

import { decode } from 'jwt-simple'
import { ClientControl, createClientService } from './service'
import { connectWorkspace, WorkspaceProtocol } from './workspace'
import { Class, Doc, DocumentProtocol, DocumentQuery, FindOptions, Ref, Tx } from '@anticrm/core'
import {
  readRequest, Response, RPC_CALL_FIND, RPC_CALL_FINDONE, RPC_CALL_GEN_REF_ID, RPC_CALL_LOAD_DOMAIN, RPC_CALL_TX,
  RpcError,
  serialize
} from '@anticrm/rpc'
import { Space } from '@anticrm/domains'
import { SecurityContext } from './spaces'

export interface Client {
  email: string
  workspace: string
}

export interface ClientSocket {
  send: (response: string) => void
}

export interface ClientTxProtocol {
  tx: (tx: Tx) => Promise<{ clientTx: Tx[] }>

  genRefId: (_space: Ref<Space>) => Promise<Ref<Doc>>
}

export type ClientService = ClientControl & DocumentProtocol & ClientTxProtocol
export type ClientServiceUnregister = () => void

export interface Broadcaster {
  broadcast: (from: ClientService, response: Response<Tx>, ctx: SecurityContext) => void
}

export interface ServerProtocol {
  shutdown: () => Promise<void>
  getWorkspace: (wsName: string) => Promise<WorkspaceProtocol>
  address: () => {address: string, port: number}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isClientExpired (client: Client): boolean {
  return false
}

export async function start (port: number, dbUri: string, host?: string): Promise<ServerProtocol> {
  console.log(`starting server on port ${port}...`)
  console.log(`host: ${host ?? 'localhost'}`)

  const server = createServer()
  const wss = new Server({ noServer: true })

  const workspaces = new Map<string, Promise<WorkspaceProtocol>>()

  let clientCounter = 0
  const connections = new Map<string, Promise<ClientService>>()

  function registerClient (service: Promise<ClientService>): ClientServiceUnregister {
    const id = `c${clientCounter++}`
    connections.set(id, service)
    return () => {
      connections.delete(id)
    }
  }

  const broadcaster: Broadcaster = {
    broadcast (from: ClientService, response: Response<any>, ctx: SecurityContext): void {
      // console.log(`broadcasting to ${connections.size} connections`)
      for (const client of connections.values()) {
        client.then((cl) => { // eslint-disable-line
          if (cl.getId() !== from.getId()) {
            // console.log(`broadcasting to ${client.email}`, response)
            cl.send(ctx, response) // eslint-disable-line
          }
        })
      }
    }
  }

  async function createClient (workspace: Promise<WorkspaceProtocol>, ws: ClientSocket & Client): Promise<ClientService> {
    return await createClientService(workspace, ws, broadcaster)
  }

  async function getWorkspace (wsName: string): Promise<WorkspaceProtocol> {
    let workspace = workspaces.get(wsName)
    if (workspace === undefined) {
      workspace = connectWorkspace(dbUri, wsName)
      workspaces.set(wsName, workspace)
    }
    return await workspace
  }

  wss.on('connection', (ws: WebSocket, request: any, client: Client) => {
    console.log('connect:', client)
    const workspace = getWorkspace(client.workspace)

    const service = createClient(workspace, {
      ...client,
      send: (response) => {
        ws.send(response)
      }
    })

    const unreg = registerClient(service)
    ws.on('close', () => {
      unreg()
    })

    const handleMessage = async (msg: string): Promise<void> => {
      const request = readRequest(msg)
      const ss = await service

      if (isClientExpired(client)) {
        const err: RpcError = { code: 0, message: 'token is expired' }
        ws.send(serialize({ id: request.id, error: err }))
        return
      }

      const response: Response<any> = { id: request.id }
      try {
        switch (request.method) {
          case RPC_CALL_FINDONE:
            response.result = await ss.findOne(request.params[0] as Ref<Class<Doc>>, request.params[1] as DocumentQuery<Doc>)
            break
          case RPC_CALL_FIND: {
            const findOptions = ((request.params[2] !== null && request.params[2] !== undefined) ? request.params[2] : {}) as FindOptions<Doc>
            response.result = {}
            findOptions.countCallback = (skip, limit, count) => {
              response.result.skip = skip
              response.result.limit = limit
              response.result.count = count
            }
            response.result.values = await ss.find(
              request.params[0] as Ref<Class<Doc>>,
              request.params[1] as DocumentQuery<Doc>,
              findOptions // Convert to undefined.
            )
            break
          }
          case RPC_CALL_GEN_REF_ID:
            response.result = await ss.genRefId(request.params[0] as Ref<Space>)
            break
          case RPC_CALL_TX: {
            const { clientTx } = await ss.tx(request.params[0] as Tx)
            // response.result == undefined  => Do not pass result, since it is same.
            response.clientTx = clientTx
            break
          }
          case RPC_CALL_LOAD_DOMAIN:
            response.result = await ss.loadDomain(request.params[0] as string)
            break
        }
      } catch (error) {
        const err: RpcError = { code: 404, message: error?.message }
        response.error = err
        console.log(`Error occurred during processing websocket message '${request.method}': `, error)
      }
      ws.send(serialize(response))
    }
    ws.on('message', (msg: string): void => {
      handleMessage(msg) // eslint-disable-line
    })
  })

  function auth (request: IncomingMessage, done: (err: Error | undefined, client: Client | undefined) => void): void {
    const token = request.url?.substring(1) // remove leading '/'
    if (token === undefined) {
      done(new Error('no authorization token'), undefined)
    } else {
      try {
        const payload = decode(token, 'secret', false)
        done(undefined, payload)
      } catch (err) {
        done(err, undefined)
      }
    }
  }

  server.on('upgrade', (request: IncomingMessage, socket, head: Buffer) => {
    auth(request, (err: Error | undefined, client: Client | undefined) => {
      if (err !== undefined) {
        console.log(err)
      }
      if (client === undefined) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
      }

      console.log('client: ', client)
      wss.handleUpgrade(request, socket, head, ws => {
        wss.emit('connection', ws, request, client)
      })
    })
  })

  return new Promise((resolve) => {
    const httpServer = server.listen(port, host, () => {
      const serverProtocol: ServerProtocol = {
        getWorkspace,
        shutdown: async () => {
          console.log('Shutting down server:', httpServer.address())

          for (const ws of workspaces.values()) {
            await (await ws).close()
          }

          for (const conn of connections.values()) {
            await (await conn).close()
          }
          console.log('stop server itself')
          httpServer.close()
        },
        address: () => {
          const addr = httpServer.address()
          if (addr !== null && typeof addr !== 'string') {
            const ad = (addr as AddressInfo)
            return { address: ad.address, port: ad.port }
          }
          if (addr !== null && typeof addr === 'string') {
            const pos = addr.indexOf(':')
            if (pos !== -1) {
              const phost = addr.substring(0, pos)
              const pport = parseInt(addr.substring(pos + 1))
              return { address: phost, port: pport }
            }
            console.error('Invalid address returned:', addr)
          }

          return { address: host ?? 'locahost', port: port }
        }
      }
      resolve(serverProtocol)
    })
  })
}
