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
import { connect, ClientControl } from './service'
import { connectWorkspace, WorkspaceProtocol } from './workspace'
import { CoreProtocol } from '@anticrm/core'

const ctlpassword = process.env.CTL_PASSWORD || '123pass'

export interface Client {
  workspace: string
}

interface Service {
  [key: string]: (...args: any[]) => Promise<any>
}

type ClientService = Service & ClientControl

export interface PlatformServer {
  broadcast<R>(from: ClientControl, response: Response<R>): void
  shutdown(password: string): Promise<void>
}

export function start(port: number, dbUri: string, host?: string) {
  console.log('starting server on port ' + port + '...')
  console.log('host: ' + host)

  const server = createServer()
  const wss = new Server({ noServer: true })

  const connections = new Map<string, Promise<ClientService>>()
  const workspaces = new Map<string, Promise<WorkspaceProtocol>>()
  let clientCounter = 0

  const platformServer: PlatformServer = {
    broadcast<R>(from: ClientControl, response: Response<R>) {
      for (const client of connections.values()) {
        console.log(`broadcasting to ${connections.size} connections`)
        client.then(client => {
          if (client !== from) {
            console.log(`broadcasting to ${client}`, response)
            client.send(response)
          } else {
            console.log('notify self about completeness without response')
            client.send({
              id: response.id,
              error: response.error
            } as Response<R>)
          }
        })
      }
    },

    async shutdown(password: string) {
      console.log('shutting down...')
      if (password !== ctlpassword) {
        throw new Error('ctl password does not match')
      }
      for (const client of connections.values()) {
        ;(await client).shutdown()
      }
      httpServer.close()
    }
  }

  async function createClient(workspace: Promise<WorkspaceProtocol>, ws: WebSocket): Promise<ClientService> {
    return ((await connect(workspace, ws, platformServer)) as unknown) as ClientService
  }
  async function getWorkspace(wsName: string): Promise<WorkspaceProtocol> {
    let workspace = workspaces.get(wsName)
    if (!workspace) {
      workspace = connectWorkspace(dbUri, wsName)
      workspaces.set(wsName, workspace)
    }
    return workspace
  }

  wss.on('connection', function connection(ws: WebSocket, request: any, client: Client) {
    console.log('connect:', client)
    const workspace = getWorkspace(client.workspace)
    const service = createClient(workspace, ws)
    const id = 'c' + clientCounter++
    connections.set(id, service)
    ws.on('close', async () => {
      connections.delete(id)
    })
    ws.on('message', async (msg: string) => {
      const request = getRequest(msg)
      const f = (await service)[request.method]

      // TODO: Check for method are exists.
      const result = await f.apply(null, request.params || [])
      const response = makeResponse({
        id: request.id,
        result
      })
      ws.send(response)
    })
  })

  function auth(request: IncomingMessage, done: (err: Error | null, client: Client | null) => void) {
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

  server.on('upgrade', function upgrade(request: IncomingMessage, socket, head: Buffer) {
    auth(request, (err: Error | null, client: Client | null) => {
      if (!client) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
      }
      console.log('client: ', client)
      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request, client)
      })
    })
  })

  const httpServer = server.listen(port, host)

  console.log('server started.')

  return () => {
    platformServer.shutdown(ctlpassword)
  }
}
