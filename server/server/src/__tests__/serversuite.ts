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

import { assignWorkspace, createAccount, createWorkspace, getAccount, getWorkspace, login, withTenant } from '@anticrm/accounts'
import { model as activityPlugin } from '@anticrm/activity/src/__model__'
import { model as chunterPlugin } from '@anticrm/chunter/src/__model__'
import { ClientService, newClient } from '@anticrm/client'
import { Person } from '@anticrm/contact'
import contact, { model as contactPlugin } from '@anticrm/contact/src/__model__'
import { Doc, generateId, Property, Ref } from '@anticrm/core'
import { Space } from '@anticrm/domains'
import { Builder } from '@anticrm/model'
import { model } from '@anticrm/model/src/__model__'
// Import a special tasks model package for generoc testing.
import { model as taskPlugin } from '@anticrm/model/src/__tests__/test_tasks'
import { model as presentationPlugin } from '@anticrm/presentation/src/__model__'
import { model as workbenchPlugin } from '@anticrm/workbench/src/__model__'
import { Db, MongoClient } from 'mongodb'
import { ServerProtocol, start } from '../server'
import { WorkspaceProtocol } from '../workspace'

export const builder = new Builder()
builder.load(model)
builder.load(presentationPlugin)
builder.load(workbenchPlugin)
builder.load(activityPlugin)
builder.load(contactPlugin)
builder.load(chunterPlugin)
builder.load(taskPlugin)

const Model = builder.dumpAll()

export interface ClientInfo {
  client: ClientService
  ops: Array<Promise<void>>
  errors: Error[]
  wait: () => void
}

export async function createContact (db: Db, email: string, username: string): Promise<any> {
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

  await db.collection('contact').insertOne(user)
}

export class ServerSuite {
  mongodbUri: string = process.env.MONGODB_URI ?? 'mongodb://localhost:27017'
  server!: ServerProtocol
  wsName: string
  dbClient!: MongoClient
  accounts!: Db
  finalizers: Array<() => void> = []

  constructor (wsName: string) {
    this.wsName = wsName
  }

  public async start (): Promise<void> {
    this.dbClient = await MongoClient.connect(this.mongodbUri, { useUnifiedTopology: true })

    this.accounts = this.dbClient.db('accounts-' + this.wsName)

    await this.reInitDB()

    const ws = await getWorkspace(this.accounts, this.wsName)
    if (ws === null) {
      await createWorkspace(this.accounts, this.wsName, 'test organization')
    }

    this.server = await start(0, this.mongodbUri, 'localhost')
  }

  public async getWorkspace (wsName: string): Promise<WorkspaceProtocol> {
    const protocol = await this.server.getWorkspace(wsName)
    return protocol
  }

  public async reInitDB (): Promise<void> {
    for (const c of this.finalizers) {
      c()
    }
    this.finalizers = []
    const db = withTenant(this.dbClient, this.wsName)
    for (const c of await db.collections()) {
      await db.dropCollection(c.collectionName)
    }

    await this.initDatabase(db)
  }

  async initDatabase (db: Db): Promise<any> {
    const domains: { [key: string]: Doc[] } = { ...Model }
    const ops = [] as Array<Promise<any>>
    for (const domain in domains) {
      const model = domains[domain]
      db.collection(domain, (err, coll) => {
        if (err !== undefined) {
          console.log(err)
        }
        ops.push(coll.deleteMany({}).then(() => model.length > 0 ? coll.insertMany(model) : null))
      })
    }
    return Promise.all(ops)
  }

  async shutdown (): Promise<void> {
    for (const c of this.finalizers) {
      c()
    }
    await this.dbClient.close()
    await this.server.shutdown()
    console.log('All stopped')
  }

  async newClients (n: number, ws: Promise<WorkspaceProtocol>): Promise<ClientInfo[]> {
    const clients: ClientInfo[] = []
    const addr = this.server.address()
    for (let i = 0; i < n; i++) {
      const email = `test@client${i + 1}`
      const a = await getAccount(this.accounts, email)
      if (a === null) {
        await createAccount(this.accounts, email, 'qwe')
      }
      await assignWorkspace(this.accounts, email, this.wsName)
      const loginInfo = await login(this.accounts, email, 'qwe', this.wsName, email, '')

      const client = await newClient(loginInfo.token, email, addr.address, addr.port)

      const info = {
        client,
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
      this.finalizers.push(() => {
        client.close()
      })
    }
    return clients
  }
}
