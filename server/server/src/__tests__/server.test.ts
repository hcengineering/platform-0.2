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

  function connect () {
    const client: Client = {
      workspace: 'latest-model'
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
        conn.close()
        done()
      }
    })
  })

  it('should send query', (done) => {
    const conn = connect()
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
      conn.close()
      expect(resp.result instanceof Array).toBeTruthy()
      // console.log(resp.result)
      done()
    })
  })

  it('should load domain', (done) => {
    const conn = connect()
    conn.on('open', () => {
      conn.send(makeRequest({
        method: 'loadDomain',
        params: [
        ]
      }))
    })
    conn.on('message', (msg: string) => {
      const resp = getResponse(msg)
      conn.close()
      expect(resp.result instanceof Array).toBeTruthy()
      done()
    })
  })

  it('should close server', () => {
    shutdown()
  })
})
