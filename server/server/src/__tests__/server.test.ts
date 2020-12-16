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
import { start, Client, ServerProtocol } from '../server'
import WebSocket from 'ws'
import { encode } from 'jwt-simple'
import { Db, MongoClient } from 'mongodb'
import { withTenant } from '@anticrm/accounts'

import { Builder } from '@anticrm/model'

import { model as platformCore } from '@anticrm/platform-core/src/__model__'
import { model as presentation } from '@anticrm/presentation/src/__model__'
import { model as contact } from '@anticrm/contact/src/__model__'
import { model as workbench } from '@anticrm/workbench/src/__model__'
import { model as task } from '@anticrm/task/src/__model__'
import { model as chunter } from '@anticrm/chunter/src/__model__'
import { Doc } from '@anticrm/core'
// import recruitmentModel from '@anticrm/recruitment-model/src/model'

// import taskStrings from '@anticrm/task-model/src/strings/ru'

export const builder = new Builder()
builder.load(platformCore)
builder.load(presentation)
builder.load(contact)
builder.load(workbench)
builder.load(chunter)
builder.load(task)
// builder.load(recruitmentModel)

const Model = builder.dumpAll()

describe('server', () => {
  const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017'

  let conn: WebSocket
  let server: ServerProtocol

  function initDatabase (db: Db): Promise<any> {
    const domains = { ...Model } as { [key: string]: Doc[] }
    const ops = [] as Promise<any>[]
    for (const domain in domains) {
      const model = domains[domain]
      db.collection(domain, (err, coll) => {
        if (err) {
          console.log(err)
        }
        ops.push(coll.deleteMany({}).then(() => model.length > 0 ? coll.insertMany(model) : null))
      })
    }
    return Promise.all(ops)
  }
  const client: Client = {
    workspace: 'test-latest-model',
    email: 'test@client1'
  }
  const token = encode(client, 'secret')

  beforeAll(async () => {
    const dbClient = await MongoClient.connect(mongodbUri, { useUnifiedTopology: true })

    const db = withTenant(dbClient, client.workspace)
    for (const c of await db.collections()) {
      await db.dropCollection(c.collectionName)
    }

    await initDatabase(db)
    await dbClient.close()

    server = await start(3337, mongodbUri, 'localhost')
  })

  async function connect (): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      conn = new WebSocket('ws://localhost:3337/' + token)
      conn.on('open', () => {
        resolve(conn)
      })
      conn.onerror = function (err) {
        reject(err)
      }
    })
  }

  beforeEach(async () => {
    conn = await connect()
  })

  afterEach(() => {
    if (conn && conn.readyState) {
      conn.close()
    }
  })

  afterAll(async () => {
    await server.shutdown()
  })

  test('should connect to server', async () => {
    expect(conn.readyState).toEqual(1)
  })

  it('should send many requests', (done) => {
    const total = 10
    const start = Date.now()
    let received = 0
    conn.on('message', (msg: string) => {
      const resp = getResponse(msg)
      if (++received === total) {
        console.log('resp:', resp, ' Time: ', Date.now() - start)
        done()
      }
    })
    for (let i = 0; i < total; i++) {
      conn.send(makeRequest({
        id: i,
        method: 'ping',
        params: []
      }))
    }
  })

  it('should send query', (done) => {
    conn.on('message', (msg: string) => {
      const resp = getResponse(msg)
      expect(resp.tx instanceof Array).toBeTruthy()
      done()
    })
    conn.send(makeRequest({
      method: 'find',
      params: [
        'class:core.Class',
        {}
      ]
    }))
  })

  it('should load domain', (done) => {
    conn.on('message', (msg: string) => {
      const resp = getResponse(msg)
      expect(resp.tx instanceof Array).toBeTruthy()
      done()
    })
    conn.send(makeRequest({
      method: 'loadDomain',
      params: [
        'model'
      ]
    }))
  })
})
