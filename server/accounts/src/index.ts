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

import { Binary, Db, MongoClient, ObjectID } from 'mongodb'
import { PlatformError, Status, Severity } from '@anticrm/platform'
import { Request, Response } from '@anticrm/rpc'
import { randomBytes, pbkdf2Sync } from 'crypto'
import { Buffer } from 'buffer'
import { decode, encode } from 'jwt-simple'

const server = '3.12.129.141'
const port = '18080'
const secret = 'secret'

const WORKSPACE_COLLECTION = 'workspace'
const ACCOUNT_COLLECTION = 'account'

enum Error {
  ACCOUNT_NOT_FOUND = 1,
  ACCOUNT_DUPLICATE = 2,
  INCORRECT_PASSWORD = 3,
  FORBIDDEN = 4,
  WORKSPACE_ALREADY_EXISTS = 5,
  WORKSPACE_NOT_FOUND = 6
}

interface Account {
  _id: ObjectID
  email: string
  hash: Binary
  salt: Binary
  workspaces: ObjectID[]
}

type AccountInfo = Omit<Account, 'hash' | 'salt'>

export interface Workspace {
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hash, salt, ...result } = account
  return result
}

async function createAccount (db: Db, email: string, password: string): Promise<AccountInfo> {
  const salt = randomBytes(32)
  const hash = hashWithSalt(password, salt)

  const account = await getAccount(db, email)
  if (account != null) {
    throw new PlatformError(new Status(Severity.ERROR, Error.ACCOUNT_DUPLICATE, 'Account already exists.'))
  }

  const insert = await db.collection(ACCOUNT_COLLECTION).insertOne({
    email,
    hash,
    salt,
    workspaces: []
  })
  return {
    _id: insert.insertedId,
    email,
    workspaces: []
  }
}

// getWorkspaceInfo - return a workspace information promise
export async function getWorkspace (db: Db, workspace: string): Promise<Workspace> {
  return db.collection(WORKSPACE_COLLECTION).findOne({
    workspace
  }) as Promise<Workspace>
}

export async function getAccount (db: Db, email: string): Promise<Account | null> {
  return db.collection(ACCOUNT_COLLECTION).findOne<Account>({ email })
}

async function getAccountInfo (db: Db, email: string, password: string, create?: boolean): Promise<AccountInfo> {
  const account = await getAccount(db, email)
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
  const workspaceInfo = await getWorkspace(db, workspace)

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

export async function createWorkspace (db: Db, workspace: string, organisation: string): Promise<string> {
  // Ensure workspace is not exists yet.
  if ((await getWorkspace(db, workspace)) != null) {
    throw new PlatformError(new Status(Severity.ERROR, Error.WORKSPACE_ALREADY_EXISTS, 'Workspace already exists and could not be created.'))
  }
  // Create a new workspace record
  return db
    .collection(WORKSPACE_COLLECTION)
    .insertOne({
      workspace,
      organisation
    })
    .then((e) => e.insertedId)
}

async function getWorkspaceAndAccount (db: Db, email: string, workspace: string): Promise<{ accountId: ObjectID; workspaceId: ObjectID }> {
  const wsPromise = await getWorkspace(db, workspace)
  if (wsPromise == null) {
    throw new PlatformError(new Status(Severity.ERROR, Error.WORKSPACE_NOT_FOUND, `Workspace ${workspace} not found`))
  }
  const workspaceId = wsPromise._id
  const account = await getAccount(db, email)
  if (account == null) {
    throw new PlatformError(new Status(Severity.ERROR, Error.ACCOUNT_NOT_FOUND, 'Account not found.'))
  }
  const accountId = account!._id
  return { accountId, workspaceId }
}

export async function assignWorkspace (db: Db, email: string, workspace: string) {
  const { workspaceId, accountId } = await getWorkspaceAndAccount(db, email, workspace)
  // Add account into workspace.
  await db.collection(WORKSPACE_COLLECTION).updateOne({ _id: workspaceId }, { $push: { accounts: accountId } })

  // Add workspace to account
  await db.collection(ACCOUNT_COLLECTION).updateOne({ _id: accountId }, { $push: { workspaces: workspaceId } })
}

export async function removeWorkspace (db: Db, email: string, workspace: string) {
  const { workspaceId, accountId } = await getWorkspaceAndAccount(db, email, workspace)

  // Add account into workspace.
  await db.collection(WORKSPACE_COLLECTION).updateOne({ _id: workspaceId }, { $pull: { accounts: accountId } })

  // Add account a workspace
  await db.collection(ACCOUNT_COLLECTION).updateOne({ _id: accountId }, { $pull: { workspaces: workspaceId } })
}

export async function createUserAccount (db: Db, email: string, password: string): Promise<ObjectID> {
  return (await getAccountInfo(db, email, password, true))._id
}

export async function getUserAccount (db: Db, email: string): Promise<ObjectID | null> {
  const account = await getAccount(db, email)
  if (account != null) {
    return account._id
  }
  return null
}

export function withTenant (client: MongoClient, workspace: string): Db {
  return client.db('ws-' + workspace)
}

export function accountsDb (client: MongoClient): Db {
  return client.db('accounts')
}

function wrap (f: (db: Db, ...args: any[]) => Promise<any>) {
  return async function (db: Db, request: Request<any[]>): Promise<Response<any>> {
    return f(db, ...request.params)
      .then((result) => ({ id: request.id, result }))
      .catch((err) => {
        if (err instanceof PlatformError) {
          const pe = err as PlatformError
          return { id: request.id, error: { code: pe.status.code, message: pe.status.message } }
        } else {
          return { id: request.id, error: { code: 0, message: err.message } }
        }
      })
  }
}

export const methods = {
  login: wrap(login),
  getAccountInfo: wrap(getAccountInfo),
  createAccount: wrap(createAccount),
  createWorkspace: wrap(createWorkspace),
  assignWorkspace: wrap(assignWorkspace),
  removeWorkspace: wrap(removeWorkspace)
}
