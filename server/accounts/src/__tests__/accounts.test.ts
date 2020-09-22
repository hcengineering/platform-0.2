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

import { MongoClient, Db } from 'mongodb'
import { Request } from '@anticrm/core'
import methods from '..'

describe('server', () => {
  const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
  let conn: MongoClient
  let db: Db
  let workspace: string

  beforeAll(async () => {
    conn = await MongoClient.connect(dbUri, { useUnifiedTopology: true })
    const olddb = conn.db('accounts')
    await olddb.dropDatabase()
    db = conn.db('accounts')
    await db.collection('account').createIndex({ email: 1 }, { unique: true })
    await db.collection('workspace').createIndex({ workspace: 1 }, { unique: true })
  })

  it('should create workspace', async () => {
    const request: Request<[string, string, string]> = {
      method: 'createWorkspace',
      params: ['andrey', '123', 'ООО Рога и Копыта']
    }

    const result = await methods.createWorkspace(db, request)
    expect(result.result).toBeDefined()
    workspace = result.result as string
  })

  it('should create account', async () => {
    const request: Request<[string, string]> = {
      method: 'createAccount',
      params: ['andrey2', '123']
    }

    const result = await methods.createAccount(db, request)
    expect(result.result).toBeDefined()
  })

  it('should not create, duplicate account', async () => {
    const request: Request<[string, string]> = {
      method: 'createAccount',
      params: ['andrey', '123']
    }

    const result = await methods.createAccount(db, request)
    expect(result.error).toBeDefined()
  })

  it('should login', async () => {
    const request: Request<[string, string, string]> = {
      method: 'login',
      params: ['andrey', '123', workspace]
    }

    const result = await methods.login(db, request)
    expect(result.result).toBeDefined()
  })

  it('should not login, wrong password', async () => {
    const request: Request<[string, string, string]> = {
      method: 'login',
      params: ['andrey', '123555', workspace]
    }

    const result = await methods.login(db, request)
    expect(result.error).toBeDefined()
  })

  it('should not login, unknown user', async () => {
    const request: Request<[string, string, string]> = {
      method: 'login',
      params: ['andrey1', '123555', workspace]
    }

    const result = await methods.login(db, request)
    expect(result.error).toBeDefined()
  })

  it('should not login, wrong workspace', async () => {
    const request: Request<[string, string, string]> = {
      method: 'login',
      params: ['andrey', '123', 'non-existent-workspace']
    }

    const result = await methods.login(db, request)
    expect(result.error).toBeDefined()
  })

  afterAll(async () => {
    await conn.close()
  })
})
