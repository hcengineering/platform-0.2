//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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

import { Broadcaster, ClientService, ClientSocket, ServerProtocol, start } from '../server'
import { Db, MongoClient } from 'mongodb'
import { createWorkspace, getWorkspace, withTenant } from '@anticrm/accounts'

import { Builder } from '@anticrm/model'

import { model } from '@anticrm/model/src/__model__'
import { model as presentationPlugin } from '@anticrm/presentation/src/__model__'
import contact, { model as contactPlugin } from '@anticrm/contact/src/__model__'
import { model as workbenchPlugin } from '@anticrm/workbench/src/__model__'
import { model as chunterPlugin } from '@anticrm/chunter/src/__model__'
import { Person } from '@anticrm/contact'
import { createClientService } from '../service'
import { WorkspaceProtocol } from '../workspace'
import { Doc, generateId, Property, Ref } from '@anticrm/core'
import { Response, readRequest, Request } from '@anticrm/rpc'
import { Space } from '@anticrm/domains'

// Import a special tasks model package for generoc testing.
import { model as taskPlugin } from '@anticrm/model/src/__tests__/test_tasks'

export const builder = new Builder()
builder.load(model)
builder.load(presentationPlugin)
builder.load(contactPlugin)
builder.load(workbenchPlugin)
builder.load(chunterPlugin)
builder.load(taskPlugin)

const Model = builder.dumpAll()

class PipeClientSocket implements ClientSocket {
  responses: Request<any>[] = []
  email: string
  workspace: string

  constructor (email: string, workspace: string) {
    this.email = email
    this.workspace = workspace
  }

  send (response: string): void {
    this.responses.push(readRequest(response))
  }
}

export interface ClientInfo {
  client: ClientService
  socket: PipeClientSocket
  ops: Promise<void>[]
  errors: Error[]
  wait (): void
}

export function createContact (db: Db, email: string, username: string): Promise<any> {
  const id = generateId() as Ref<Person>
  const user = builder.createDocument(
    contact.class.Person,
    {
      name: username,
      _space: (undefined as unknown) as Ref<Space>,
      _createdOn: Date.now() as Property<number, Date>,
      _createdBy: 'system' as Property<string, string>
    },
    id
  )

  builder.mixinDocument(user, contact.mixin.User, {
    account: email
  })

  return db.collection('contact').insertOne(user)
}

export class ServerSuite {
  mongodbUri: string = process.env.MONGODB_URI || 'mongodb://localhost:27017'
  server!: ServerProtocol
  wsName: string
  dbClient!: MongoClient

  constructor (wsName: string) {
    this.wsName = wsName
  }

  public async start (): Promise<void> {
    this.dbClient = await MongoClient.connect(this.mongodbUri, { useUnifiedTopology: true })

    const accounts = this.dbClient.db('accounts')

    await this.reInitDB()

    const ws = await getWorkspace(accounts, this.wsName)
    if (!ws) {
      await createWorkspace(accounts, this.wsName, 'test organization')
    }

    this.server = await start(0, this.mongodbUri, 'localhost')
  }

  public getWorkspace (wsName: string): Promise<WorkspaceProtocol> {
    return this.server.getWorkspace(wsName)
  }

  public async reInitDB (): Promise<void> {
    const db = withTenant(this.dbClient, this.wsName)
    for (const c of await db.collections()) {
      await db.dropCollection(c.collectionName)
    }

    await this.initDatabase(db)
  }

  initDatabase (db: Db): Promise<any> {
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

  async shutdown (): Promise<void> {
    await this.dbClient.close()
    await this.server.shutdown()
    console.log('All stopped')
  }

  async newClients (n: number, ws: Promise<WorkspaceProtocol>): Promise<ClientInfo[]> {
    const clients: ClientInfo[] = []

    const broadcast: Broadcaster = {
      broadcast: (from, response) => {
        // console.log(`broadcasting to ${clients.length} connections`)
        for (const client of clients) {
          if (client.client !== from) {
            // console.log(`broadcasting to ${client.client.email}`, response)
            client.ops.push(client.client.send(response).catch((e) => {
              client.errors.push(e)
            }))
          } else {
            // console.log('notify self about completeness without response')
            client.ops.push(client.client.send({
              id: response.id,
              error: response.error
            } as Response<any>).catch((e) => {
              client.errors.push(e)
            }))
          }
        }
      }
    }
    for (let i = 0; i < n; i++) {
      const socket = new PipeClientSocket('test@client' + (i + 1), this.wsName)
      const client = await createClientService(ws, socket, broadcast)
      const info = {
        client,
        socket,
        ops: [],
        errors: [],
        wait: async () => {
          for (const op of info.ops) {
            try {
              await op
            } catch (err) {
              console.log(err)
            }
          }
          info.ops = []
        }
      }
      clients.push(info)
    }
    return clients
  }
}
