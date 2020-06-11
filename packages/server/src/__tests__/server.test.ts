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

import core from '@anticrm/platform-core'
import { makeRequest, getResponse } from '@anticrm/platform-rpc'
import { start, Client } from '../server'
import WebSocket from 'ws'
import { encode } from 'jwt-simple'

describe('server', () => {

  const shutdown = start(3333, 'mongodb://localhost:27017')

  function connect () {
    const client: Client = {
      tenant: 'company1'
    }
    const token = encode(client, 'secret')
    console.log(token)
    return new WebSocket('ws://localhost:3333/' + token)
  }

  it('should connect to server', (done) => {
    const conn = connect()
    conn.on('open', () => {
      conn.close()
      done()
    })
  })

  it('should send many requests', (done) => {
    const conn = connect()
    const total = 1000
    const start = Date.now()
    conn.on('open', () => {
      for (let i = 0; i < total; i++) {
        conn.send(makeRequest({
          id: i,
          meth: 'ping'
        }))
      }
    })
    let received = 0
    conn.on('message', (msg: string) => {
      const resp = getResponse(msg)
      if (++received === total) {
        console.log('Time: ', Date.now() - start)
        conn.close()
        done()
      }
    })
  })

  it('should send query', (done) => {
    const conn = connect()
    conn.on('open', () => {
      conn.send(makeRequest({
        id: null,
        meth: 'find',
        params: [
          core.class.Class,
          {}
        ]
      }))
    })
    conn.on('message', (msg: string) => {
      const resp = getResponse(msg)
      expect(resp.result.length).toBeGreaterThan(0)
      conn.close()
      done()
    })
  })

  it('should close server', () => {
    shutdown()
  })
})
