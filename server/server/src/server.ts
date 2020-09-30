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
import { Ref, Space } from '@anticrm/core'

const ctlpassword = process.env.CTL_PASSWORD || '123pass'

export interface Client {
  workspace: string
  email: string
}

interface Service {
  [key: string]: (...args: any[]) => Promise<any>
}

type ClientService = Service & ClientControl

export interface PlatformServer {
  broadcast<R> (from: ClientControl, to: string[], response: Response<R>): void
  shutdown (password: string): Promise<void>
}

export function start (port: number, dbUri: string, host?: string) {

  console.log('starting server on port ' + port + '...')
  console.log('host: ' + host)

  const server = createServer()
  const wss = new Server({ noServer: true })
  const connections = new Map<string, Promise<ClientService>[]>()

  const platformServer: PlatformServer = {
    broadcast<R> (from: ClientControl, to: string[], response: Response<R>) {
      // If 'to' is absent or empty, then broadcast to all active connections.

      for (const account of to && to.length > 0 ? to : connections.keys()) {
        const accountConnections = connections.get(account)

        if (accountConnections) {
          for (const connection of accountConnections) {
            connection.then(client => {
              if (client && client !== from) {
                console.log(`broadcasting to '${account}', response`, response)
                client.send(response)
              }
            })
          }
        }
      }
    },

    async shutdown (password: string) {
      console.log('shutting down...')
      if (password !== ctlpassword) {
        throw new Error('ctl password does not match')
      }
      for (const clients of connections.values()) {
        for (const client of clients) {
          (await client).shutdown()
        }
      }
      httpServer.close()
    }
  }

  function createClient (uri: string, workspace: string, email: string, ws: WebSocket): Promise<ClientService> {
    const service = new Promise<ClientService>((resolve, reject) => {
      connect(uri, workspace, email, ws, platformServer)
        .then(service => { resolve(service as unknown as ClientService) })
        .catch(err => reject(err))
    })
    return service
  }

  wss.on('connection', function connection (ws: WebSocket, request: any, client: Client) {
    const service = createClient(dbUri, client.workspace, client.email, ws)
    const clientActiveConnections = connections.get(client.email)

    if (clientActiveConnections) {
      clientActiveConnections.push(service)
    } else {
      connections.set(client.email, [service])
    }

    ws.on('message', async (msg: string) => {
      const request = getRequest(msg)
      const f = (await service)[request.method]
      const result = await f.apply(null, request.params || [])
      ws.send(makeResponse({
        id: request.id,
        result
      }))
    })
  })

  function auth (request: IncomingMessage, done: (err: Error | null, client: Client | null) => void) {
    const token = request.url?.substring(1) // remove leading '/'
    if (!token) {
      done(new Error('no authorization token'), null)
    } else {
      const payload = decode(token, 'secret', false)
      done(null, payload)
    }
  }

  server.on('upgrade', function upgrade (request: IncomingMessage, socket, head: Buffer) {
    auth(request, (err: Error | null, client: Client | null) => {
      if (!client) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
      }
      console.log('client: ', client)
      wss.handleUpgrade(request, socket, head, function done (ws) {
        wss.emit('connection', ws, request, client);
      })
    })
  })

  const httpServer = server.listen(port, host)

  console.log('server started.')

  return () => { platformServer.shutdown(ctlpassword) }
}
