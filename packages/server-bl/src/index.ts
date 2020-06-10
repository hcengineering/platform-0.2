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

import { createServer, IncomingMessage } from 'http'
import { Server } from 'ws'

import jwt from 'jwt-simple'

const platform = new Platform()
console.log(platform.getPluginInfos())

const server = createServer()
const wss = new Server({ noServer: true });

wss.on('connection', function connection (ws, request, client) {
  console.log('here!!!!!')
  ws.on('message', function message (msg) {
    console.log(`Received message ${msg} from user ${client}`)
  })
})

const Bearer = "Bearer "

function auth (request: IncomingMessage, done: (err: Error, client: any) => void) {
  console.log('here!!')
  const auth = request.headers.authorization
  if (!auth) {
    done(new Error('no authorization header'), null)
  } else {
    const bearer = auth.substring(0, Bearer.length)
    if (bearer !== Bearer) {
      done(new Error('expect bearer'), null)
    } else {
      const token = auth.substring(Bearer.length)
      const payload = jwt.decode(token, 'secret')
      done(null, payload)
    }
  }
}

server.on('upgrade', function upgrade (request: IncomingMessage, socket, head: Buffer) {
  console.log('upgrade')
  auth(request, (err: any, client: any) => {
    console.log('we are here')
    if (err || !client) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }

    wss.handleUpgrade(request, socket, head, function done (ws) {
      wss.emit('connection', ws, request, client);
    })
  })
})

server.listen(8080)
