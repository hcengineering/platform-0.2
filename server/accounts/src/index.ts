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
import { PlatformError, Status, Severity } from '@anticrm/platform'
import { Request, Response } from '@anticrm/core'
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

async function createAccount (db: Db, email: string, password: string): Promise<AccountInfo> {
  const salt = randomBytes(32)
  const hash = hashWithSalt(password, salt)

  const insert = await db.collection(ACCOUNT_COLLECTION).insertOne({
    email,
    hash,
    salt,
    workspaces: [],
  })
  return {
    _id: insert.insertedId,
    email,
    workspaces: []
  }
}

async function getAccountInfo (db: Db, email: string, password: string, create?: boolean): Promise<AccountInfo> {
  const account = await db.collection(ACCOUNT_COLLECTION).findOne<Account>({ email })
  if (!account) {
    if (create) {
      return createAccount(db, email, password)
    } else {
      throw new PlatformError(new Status(Severity.ERROR, Error.ACCOUNT_NOT_FOUND, 'Account not found.'))
    }
  }
  if (!verifyPassword(password, account.hash.buffer, account.salt.buffer)) {
    throw new PlatformError(new Status(Severity.ERROR, Error.INCORRECT_PASSWORD, 'Incorrect password.'))
  }
  return toAccountInfo(account)
}

async function login (db: Db, email: string, password: string, workspace: string): Promise<LoginInfo> {

  const accountInfo = await getAccountInfo(db, email, password)
  const workspaceInfo = await db.collection(WORKSPACE_COLLECTION).findOne({
    workspace
  })

  if (workspaceInfo) {

    const workspaces = accountInfo.workspaces

    for (const w of workspaces) {
      if (w.equals(workspaceInfo._id)) {
        const result = {
          workspace,
          server,
          port,
          token: encode({ email, workspace }, secret),
          email
        }
        return result
      }
    }
  }

  throw new PlatformError(new Status(Severity.ERROR, Error.FORBIDDEN, 'Forbidden.'))
}

export async function createWorkspace (db: Db, email: string, password: string, organisation: string, ws?: string): Promise<string> {
  const accountInfo = await getAccountInfo(db, email, password, true)
  const accountId = accountInfo._id

  const workspace = ws ?? 'ws-' + randomBytes(8).toString('hex')

  const insert = await db.collection(WORKSPACE_COLLECTION).insertOne({
    workspace,
    organisation,
    accounts: [accountId]
  })

  await db.collection(ACCOUNT_COLLECTION).updateOne({ _id: accountId }, {
    $push: { workspaces: insert.insertedId }
  })

  return workspace
}

////

function wrap (f: (db: Db, ...args: any[]) => Promise<any>) {
  return async function (db: Db, request: Request<[]>): Promise<Response<any>> {
    return f(db, ...request.params)
      .then(result => ({ id: request.id, result }))
      .catch(err => {
        if (err instanceof PlatformError) {
          const pe = err as PlatformError
          return { id: request.id, error: { code: pe.status.code, message: pe.status.message } }
        } else {
          return { id: request.id, error: { code: 0, message: err.message } }
        }
      })
  }
}

const methods = {
  login: wrap(login),
  getAccountInfo: wrap(getAccountInfo),
  createAccount: wrap(createAccount),
  createWorkspace: wrap(createWorkspace),
}

export default methods
