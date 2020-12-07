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
/* eslint-env jest */

import { makeRequest, getResponse } from '../rpc'
import { start, Client } from '../server'
import WebSocket from 'ws'
import { encode } from 'jwt-simple'

describe('server', () => {
  const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
  const shutdown = start(3333, mongodbUri)

  let conn: WebSocket

  beforeEach(() => {
    const client: Client = {
      workspace: 'latest-model'
    }
    const token = encode(client, 'secret')
    console.log(token)
    conn = new WebSocket('ws://localhost:3333/' + token)
  })
  afterEach(() => {
    conn.close()
  })

  it('should connect to server', (done) => {
    conn.on('open', () => {
      done()
    })
  })

  it('should send many requests', (done) => {
    const total = 10
    const start = Date.now()
    conn.on('open', () => {
      for (let i = 0; i < total; i++) {
        conn.send(makeRequest({
          id: i,
          method: 'ping',
          params: []
        }))
      }
    })
    let received = 0
    conn.on('message', (msg: string) => {
      const resp = getResponse(msg)
      if (++received === total) {
        console.log('resp:', resp, ' Time: ', Date.now() - start)
        done()
      }
    })
  })

  it('should send query', (done) => {
    conn.on('open', () => {
      conn.send(makeRequest({
        method: 'find',
        params: [
          'class:core.Class',
          {}
        ]
      }))
    })
    conn.on('message', (msg: string) => {
      const resp = getResponse(msg)
      expect(resp.result instanceof Array).toBeTruthy()
      // console.log(resp.result)
      done()
    })
  })

  it('should load domain', (done) => {
    conn.on('open', () => {
      conn.send(makeRequest({
        method: 'loadDomain',
        params: [
          'model'
        ]
      }))
    })
    conn.on('message', (msg: string) => {
      const resp = getResponse(msg)
      expect(resp.result instanceof Array).toBeTruthy()
      done()
    })
  })

  afterAll(() => {
    shutdown()
  })
})
