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

import { makeResponse, getRequest, Response } from './rpc'
import { createServer, IncomingMessage } from 'http'
import WebSocket, { Server } from 'ws'

import { decode } from 'jwt-simple'
import { ClientControl, createClientService } from './service'
import { connectWorkspace, WorkspaceProtocol } from './workspace'

export interface Client {
  email: string
  workspace: string
}

export interface Service {
  [key: string]: (...args: any[]) => Promise<any>
}
export interface ClientSocket {
  send (response: string): void
}

export type ClientService = Service & ClientControl & WorkspaceProtocol
export type ClientServiceUnregister = () => void

export interface Broadcaster {
  broadcast (from: ClientService, response: Response): void
}

export interface ServerProtocol {
  shutdown (): Promise<void>
  getWorkspace (wsName: string): Promise<WorkspaceProtocol>
}

export function start (port: number, dbUri: string, host?: string): Promise<ServerProtocol> {
  console.log('starting server on port ' + port + '...')
  console.log('host: ' + host)

  const server = createServer()
  const wss = new Server({ noServer: true })

  const workspaces = new Map<string, Promise<WorkspaceProtocol>>()

  let clientCounter = 0
  const connections = new Map<string, Promise<ClientService>>()

  function registerClient (service: Promise<ClientService>): ClientServiceUnregister {
    const id = 'c' + clientCounter++
    connections.set(id, service)
    return () => {
      connections.delete(id)
    }
  }
  const broadcaster: Broadcaster = {
    broadcast (from: ClientService, response: Response): void {
      console.log(`broadcasting to ${connections.size} connections`)
      for (const client of connections.values()) {
        client.then(client => {
          if (client !== from) {
            console.log(`broadcasting to ${client.email}`, response)
            client.send(response)
          } else {
            console.log('notify self about completeness without response')
            client.send({
              id: response.id,
              error: response.error
            } as Response)
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
    if (!workspace) {
      workspace = connectWorkspace(dbUri, wsName)
      workspaces.set(wsName, workspace)
    }
    return workspace
  }

  wss.on('connection', function connection (ws: WebSocket, request: any, client: Client) {
    console.log('connect:', client)
    const workspace = getWorkspace(client.workspace)

    const service = createClient(workspace, { ...client, send: (response) => { ws.send(response) } })

    const unreg = registerClient(service)
    ws.on('close', async () => {
      unreg()
    })
    ws.on('message', async (msg: string) => {
      const request = getRequest(msg)
      const f = (await service)[request.method]

      // TODO: Check for method are exists.
      const tx = await f.apply(null, request.params || [])
      const response = makeResponse({
        id: request.id,
        tx
      })
      ws.send(response)
    })
  })

  function auth (request: IncomingMessage, done: (err: Error | null, client: Client | null) => void) {
    const token = request.url?.substring(1) // remove leading '/'
    if (!token) {
      done(new Error('no authorization token'), null)
    } else {
      try {
        const payload = decode(token, 'secret', false)
        done(null, payload)
      } catch (err) {
        done(err, null)
      }
    }
  }

  server.on('upgrade', function upgrade (request: IncomingMessage, socket, head: Buffer) {
    auth(request, (err: Error | null, client: Client | null) => {
      if (err != null) {
        console.log(err)
      }
      if (!client) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
      }
      console.log('client: ', client)
      wss.handleUpgrade(request, socket, head, function done (ws) {
        wss.emit('connection', ws, request, client)
      })
    })
  })

  return new Promise((resolve) => {
    const httpServer = server.listen(port, host, () => {
      console.log('server started.')
      resolve({
        getWorkspace,
        shutdown: async () => {
          console.log('Shutting down server:', httpServer.address())

          for (const ws of workspaces.values()) {
            (await ws).close()
          }

          for (const conn of connections.values()) {
            (await conn).close()
          }
          console.log('stop server itself')
          httpServer.close()
        }
      } as ServerProtocol)
    })
  })
}
