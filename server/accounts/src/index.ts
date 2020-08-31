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

import { Binary, Db, ObjectID } from 'mongodb'
import { Request, Response } from '@anticrm/platform'
import { randomBytes, pbkdf2Sync } from 'crypto'
import { Buffer } from 'buffer'
import { encode } from 'jwt-simple'

const server = '3.12.129.141'
const port = '18080'
const secret = 'secret'

const WORKSPACE_COLLECTION = 'workspace'
const ACCOUNT_COLLECTION = 'account'

enum Error {
  ACCOUNT_NOT_FOUND = 1,
  INCORRECT_PASSWORD = 2,
  FORBIDDEN = 3
}

interface Account {
  _id: ObjectID
  email: string
  hash: Binary
  salt: Binary
  workspaces: ObjectID[]
}

type AccountInfo = Omit<Account, 'hash' | 'salt'>

interface Workspace {
  _id: ObjectID
  workspace: string
  organisation: string
  accounts: ObjectID[]
}

interface LoginInfo {
  email: string
  workspace: string
  server: string
  port: string
  token: string
}

function hashWithSalt (password: string, salt: Buffer): Buffer {
  return pbkdf2Sync(password, salt, 1000, 32, 'sha256')
}

function verifyPassword (password: string, hash: Buffer, salt: Buffer): boolean {
  return Buffer.compare(hash, hashWithSalt(password, salt)) === 0
}

function toAccountInfo (account: Account): AccountInfo {
  const result = { ...account }
  delete result.hash
  delete result.salt
  return result
}

async function getAccountInfo (db: Db, request: Request<[string, string]>): Promise<Response<AccountInfo>> {
  const [email, password] = request.params

  const account = await db.collection(ACCOUNT_COLLECTION).findOne<Account>({ email })
  if (!account) {
    return { id: request.id, error: { code: Error.ACCOUNT_NOT_FOUND, message: 'Account not found.' } }
  }

  if (!verifyPassword(password, account.hash.buffer, account.salt.buffer)) {
    return { id: request.id, error: { code: Error.INCORRECT_PASSWORD, message: 'Incorrect password.' } }
  }

  return { result: toAccountInfo(account), id: request.id }
}

async function login (db: Db, request: Request<[string, string, string]>): Promise<Response<LoginInfo>> {
  const [email, password, workspace] = request.params

  const response = await getAccountInfo(db, { method: 'getAccountInfo', params: [email, password] })
  if (response.error) {
    return response as unknown as Response<LoginInfo>
  }

  const workspaceInfo = await db.collection(WORKSPACE_COLLECTION).findOne({
    workspace
  })

  if (workspaceInfo) {

    const workspaces = (response.result as AccountInfo).workspaces

    for (const w of workspaces) {
      if (w.equals(workspaceInfo._id)) {
        const result = {
          workspace,
          server,
          port,
          token: encode({ email, workspace }, secret),
          email
        }
        return { result, id: request.id }
      }
    }
  }

  return {
    id: request.id, error: { code: Error.FORBIDDEN, message: 'Forbidden.' }
  }

}

async function createAccount (db: Db, request: Request<[string, string]>): Promise<Response<ObjectID>> {
  const [email, password] = request.params

  const salt = randomBytes(32)
  const hash = hashWithSalt(password, salt)

  try {
    const insert = await db.collection(ACCOUNT_COLLECTION).insertOne({
      email,
      hash,
      salt,
      workspaces: [],
    })
    return { result: insert.insertedId, id: request.id }

  } catch (err) {
    return {
      id: request.id, error: { code: 0, message: err.toString() }
    }
  }
}

async function createWorkspace (db: Db, request: Request<[string, string, string]>): Promise<Response<string>> {
  const [email, password, organisation] = request.params

  let accountId
  const response = await getAccountInfo(db, { method: 'getAccountInfo', params: [email, password] })
  if (response.error) {
    switch (response.error.code) {
      case Error.ACCOUNT_NOT_FOUND: {
        const response = await createAccount(db, { method: 'createAccount', params: [email, password] })
        if (response.error) {
          return response as unknown as Response<string>
        }
        accountId = (response.result as ObjectID)
        break
      }
      default:
        return response as unknown as Response<string>
    }
  } else {
    accountId = (response.result as AccountInfo)._id
  }

  const workspace = 'ws-' + randomBytes(8).toString('hex')

  try {
    const insert = await db.collection(WORKSPACE_COLLECTION).insertOne({
      workspace,
      organisation,
      accounts: [accountId]
    })

    await db.collection(ACCOUNT_COLLECTION).updateOne({ _id: accountId }, {
      $push: { workspaces: insert.insertedId }
    })

    return { result: workspace, id: request.id }

  } catch (err) {
    return {
      id: request.id, error: { code: 0, message: err.toString() }
    }
  }
}

const methods = {
  login,
  getAccountInfo,
  createAccount,
  createWorkspace
}

export default methods
