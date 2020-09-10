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

import { makeRequest, getResponse } from './rpc'
import { start, Client } from './server'
import WebSocket from 'ws'
import { encode } from 'jwt-simple'

const ctlpassword = process.env.CTL_PASSWORD || '123pass'

const port = '18080'
const token = ''

function connect () {
  const client: Client = {
    workspace: 'latest-model'
  }
  const token = encode(client, 'secret')
  console.log(token)
  return new WebSocket('ws://localhost:' + port + '/' + token)
}

const conn = connect()

conn.onerror = (event) => {
  console.log('websocket error')
  console.log(event)
}

conn.on('open', () => {
  conn.send(makeRequest({
    method: 'serverShutdown',
    params: [ctlpassword]
  }))

  conn.close()
})

