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

import { getRequest, Response } from '../rpc'
import { start, ServerProtocol, Broadcaster, ClientSocket, ClientService } from '../server'
import { Db, MongoClient } from 'mongodb'
import { createWorkspace, getWorkspace, withTenant } from '@anticrm/accounts'

import { Builder } from '@anticrm/model'

import core from '@anticrm/platform-core'
import chunter, { Page } from '@anticrm/chunter'

import { newCreateTx } from '@anticrm/platform-core/src/tx'

import { model as platformCorePlugin } from '@anticrm/platform-core/src/__model__'
import { model as presentationPlugin } from '@anticrm/presentation/src/__model__'
import contact, { model as contactPlugin } from '@anticrm/contact/src/__model__'
import { model as workbenchPlugin } from '@anticrm/workbench/src/__model__'
import { model as taskPlugin } from '@anticrm/task/src/__model__'
import { model as chunterPlugin } from '@anticrm/chunter/src/__model__'
import { Doc, Request, generateId, Ref, Space, Property, StringProperty, SpaceUser } from '@anticrm/core'
import { Person } from '@anticrm/contact'
import { createClientService } from '../service'
import { WorkspaceProtocol } from '../workspace'

export const builder = new Builder()
builder.load(platformCorePlugin)
builder.load(presentationPlugin)
builder.load(contactPlugin)
builder.load(workbenchPlugin)
builder.load(chunterPlugin)
builder.load(taskPlugin)

const Model = builder.dumpAll()

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

  console.log(user)
  return db.collection('contact').insertOne(user)
}

class PipeClientSocket implements ClientSocket {
  responses: Request<any>[] = []
  email: string
  workspace: string

  constructor (email: string, workspace: string) {
    this.email = email
    this.workspace = workspace
  }

  send (response: string): void {
    this.responses.push(getRequest(response))
  }
}

describe('service', () => {
  const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
  let server: ServerProtocol
  const wsName = 'test-service'

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

  beforeAll(async () => {
    const dbClient = await MongoClient.connect(mongodbUri, { useUnifiedTopology: true })

    const accounts = dbClient.db('accounts')
    const db = withTenant(dbClient, wsName)
    for (const c of await db.collections()) {
      await db.dropCollection(c.collectionName)
    }

    await initDatabase(db)

    const ws = await getWorkspace(accounts, wsName)
    if (!ws) {
      await createWorkspace(accounts, wsName, 'test organization')
    }

    await dbClient.close()

    server = await start(3338, mongodbUri, 'localhost')
  })

  afterAll(async () => {
    await server.shutdown()
    console.log('All stopped')
  })

  const noopBroadcast: Broadcaster = {
    // eslint-disable-next-line
    broadcast: (_from, _response) => { }
  }

  interface ClientInfo {
    client: ClientService
    socket: PipeClientSocket
    ops: Promise<void>[]
    errors: Error[]
    wait (): void
  }

  async function newClients (n: number, ws: Promise<WorkspaceProtocol>): Promise<ClientInfo[]> {
    const clients: ClientInfo[] = []

    const broadcast: Broadcaster = {
      broadcast: (from, response) => {
        console.log(`broadcasting to ${clients.length} connections`)
        for (const client of clients) {
          if (client.client !== from) {
            console.log(`broadcasting to ${client.client.email}`, response)
            client.ops.push(client.client.send(response).catch((e) => {
              client.errors.push(e)
            }))
          } else {
            console.log('notify self about completeness without response')
            client.ops.push(client.client.send({
              id: response.id,
              error: response.error
            } as Response).catch((e) => { client.errors.push(e) }))
          }
        }
      }
    }
    for (let i = 0; i < n; i++) {
      const socket = new PipeClientSocket('test@client' + (i + 1), wsName)
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

  it('should send query existing Spaces', async () => {
    const ws = server.getWorkspace(wsName)
    const { client } = (await newClients(1, ws))[0]

    const spaces = await client.find(core.class.Space, { isPublic: true as Property<boolean, boolean> })
    expect(spaces.length).toEqual(2)
  })

  it('should not allow to create private space without owner', async () => {
    const ws = server.getWorkspace(wsName)
    const { client } = (await newClients(1, ws))[0]

    const spaces = await client.find(core.class.Space, { isPublic: true as Property<boolean, boolean> })
    expect(spaces.length).toEqual(2)

    // Create a private space
    await client.tx(newCreateTx(
      {
        _class: core.class.Space,
        name: 'private-space',
        users: [{ userId: 'test@client1' } as unknown as SpaceUser],
        isPublic: false
      } as unknown as Space,
      'test@client1' as StringProperty
    )).then(() => {
      fail('show not complete sucessfully')
    }).catch((e) => {
      expect(e.message).toEqual('Space doesn\'t contain owner. Operation is not allowed')
    })
  })
  it('check space creation', async () => {
    const ws = server.getWorkspace(wsName)

    const clients = (await newClients(2, ws))
    const c1 = clients[0].client
    const c2 = clients[1].client

    await c1.tx(newCreateTx(
      {
        _class: core.class.Space,
        name: 'public-space',
        users: [],
        isPublic: true
      } as unknown as Space,
      'test@client1' as StringProperty
    ))

    let spaces = await c1.find(core.class.Space, { isPublic: true as Property<boolean, boolean> })
    expect(spaces.length).toEqual(3)
    await clients[1].wait()

    await c1.tx(newCreateTx(
      {
        _class: chunter.class.Page,
        title: 'public-space Page',
        _space: spaces[0]._id
      } as unknown as Page,
      'test@client1' as StringProperty
    ))

    let pages = await c1.find(chunter.class.Page, {})
    expect(pages.length).toEqual(1)

    pages = await c2.find(chunter.class.Page, {})
    expect(pages.length).toEqual(1) // Both c1 and c2 see page

    // Create a private space
    await c1.tx(newCreateTx(
      {
        _class: core.class.Space,
        name: 'private-space',
        users: [{ userId: 'test@client1', owner: true } as unknown as SpaceUser],
        isPublic: false
      } as unknown as Space,
      'test@client1' as StringProperty
    ))
    spaces = await c1.find(core.class.Space, { isPublic: false as Property<boolean, boolean> })
    expect(spaces.length).toEqual(1)
    // Let's create task inside private space and check c2 is not recieve it.

    await c1.tx(newCreateTx(
      {
        _class: chunter.class.Page,
        title: 'private-space Page',
        _space: spaces[0]._id
      } as unknown as Page,
      'test@client1' as StringProperty
    ))
    pages = await c1.find(chunter.class.Page, {})
    expect(pages.length).toEqual(2)

    await clients[1].wait()

    // Client2 had access to client1 private-space, it should not.
    spaces = await c2.find(core.class.Space, { isPublic: false as Property<boolean, boolean> })
    expect(spaces.length).toEqual(0)

    pages = await c2.find(chunter.class.Page, {})
    expect(pages.length).toEqual(1) // c2 is not allowed to see page from private space of c1

    // Create a shared private space
    await c1.tx(newCreateTx(
      {
        _class: core.class.Space,
        name: 'shared-space',
        users: [{ userId: 'test@client1', owner: true } as unknown as SpaceUser, { userId: 'test@client2', owner: false } as unknown as SpaceUser],
        isPublic: false
      } as unknown as Space,
      'test@client1' as StringProperty
    ))

    spaces = await c1.find(core.class.Space, { name: 'shared-space' as StringProperty })

    await c1.tx(newCreateTx(
      {
        _class: chunter.class.Page,
        title: 'shared-space Page',
        _space: spaces[0]._id
      } as unknown as Page,
      'test@client1' as StringProperty
    ))

    // Wait for all to be processed for c2
    await clients[1].wait()

    pages = await c1.find(chunter.class.Page, {})
    expect(pages.length).toEqual(3) // c2 is not allowed to see page from private space of c1

    pages = await c2.find(chunter.class.Page, {})
    expect(pages.length).toEqual(2) // c2 is not allowed to see page from private space of c1

    // Client2 should have access to shared-space and recieve update about it.
    spaces = await c2.find(core.class.Space, { isPublic: false as Property<boolean, boolean> })
    expect(spaces.length).toEqual(1)
  })
})
