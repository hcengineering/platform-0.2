
import { getRequest, Response } from '../rpc'
import { start, ServerProtocol, Broadcaster, ClientSocket, ClientService } from '../server'
import { Db, MongoClient } from 'mongodb'
import { createWorkspace, getWorkspace, withTenant } from '@anticrm/accounts'

import { Builder } from '@anticrm/model'

import { model as platformCorePlugin } from '@anticrm/platform-core/src/__model__'
import { model as presentationPlugin } from '@anticrm/presentation/src/__model__'
import contact, { model as contactPlugin } from '@anticrm/contact/src/__model__'
import { model as workbenchPlugin } from '@anticrm/workbench/src/__model__'
import { model as taskPlugin } from '@anticrm/task/src/__model__'
import { model as chunterPlugin } from '@anticrm/chunter/src/__model__'
import { Doc, Request, generateId, Ref, Space, Property } from '@anticrm/core'
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

  console.log(user)
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
            } as Response<any>).catch((e) => { client.errors.push(e) }))
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
