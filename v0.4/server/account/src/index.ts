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

import { Binary, Db, MongoClient, ObjectID } from 'mongodb'
import { PlatformError, Status, Severity } from '@anticrm/status'
import { AccountStatusCode } from '@anticrm/account'
import { Request, Response } from '@anticrm/rpc'
import { randomBytes, pbkdf2Sync } from 'crypto'
import { Buffer } from 'buffer'
import { encode } from 'jwt-simple'

const server = '3.12.129.141'
const port = '18080'
const secret = 'secret'

const WORKSPACE_COLLECTION = 'workspace'
const ACCOUNT_COLLECTION = 'account'

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
  const { hash, salt, ...result } = account
  return result
}

function getWorkspace (db: Db, workspace: string): Promise<Workspace> {
  return db
    .collection(WORKSPACE_COLLECTION).findOne<Workspace>({ workspace })
    .then(workspace => {
      if (workspace === null)
       throw new PlatformError(new Status(Severity.ERROR, AccountStatusCode.WORKSPACE_NOT_FOUND, 'Workspace not found.'))
      return workspace
    })
}

function getAccount (db: Db, email: string): Promise<Account> {
  return db
    .collection(ACCOUNT_COLLECTION).findOne<Account>({ email })
    .then(account => {
      if (account === null)
       throw new PlatformError(new Status(Severity.ERROR, AccountStatusCode.ACCOUNT_NOT_FOUND, 'Account not found.'))
      return account
    })
}

function getAccountInfo (db: Db, email: string, password: string): Promise<AccountInfo> {
  return getAccount(db, email)
    .then((account) => {
      if (!verifyPassword(password, account.hash.buffer, account.salt.buffer)) {
        throw new PlatformError(new Status(Severity.ERROR, AccountStatusCode.INCORRECT_PASSWORD, 'Incorrect password.'))
      }
      return toAccountInfo(account)    
    })
}

function createAccount (db: Db, email: string, password: string): Promise<AccountInfo> {
  const salt = randomBytes(32)
  const hash = hashWithSalt(password, salt)

  return db
    .collection(ACCOUNT_COLLECTION)
    .insertOne({ email, hash, salt, workspaces: [] })
    .then((result) => ({ _id: result.insertedId, email, workspaces: [] }))
    .catch((err) => {
      const status = err.code === 11000 ?
        new Status(Severity.ERROR, AccountStatusCode.DUPLICATE_ACCOUNT, 'Account already exists') :
        new Status(Severity.ERROR, AccountStatusCode.DATABASE_ERROR, err.message)
      throw new PlatformError(status)
    })
}

function createWorkspace (db: Db, workspace: string, organisation: string): Promise<string> {
  return db
    .collection(WORKSPACE_COLLECTION)
    .insertOne({ workspace, organisation })
    .then((result) => result.insertedId)
    .catch((err) => {
      const status = err.code === 11000 ?
        new Status(Severity.ERROR, AccountStatusCode.DUPLICATE_WORKSPACE, 'Workspace already exists') :
        new Status(Severity.ERROR, AccountStatusCode.DATABASE_ERROR, err.message)
      throw new PlatformError(status)
    })
}

function addWorkspace (db: Db, email: string, workspace: string): Promise<void> {
  return Promise.all([getWorkspace(db, workspace), getAccount(db, email)])
    .then(([workspace, account]) => {
      return Promise.all([
        db.collection(WORKSPACE_COLLECTION).updateOne({ _id: workspace._id }, { $push: { accounts: account._id } }),
        db.collection(ACCOUNT_COLLECTION).updateOne({ _id: account._id }, { $push: { workspaces: workspace._id } })
      ]).then(() => {})    
    })
}

function login (db: Db, email: string, password: string, workspace: string): Promise<LoginInfo> {
  return Promise.all([
    getAccountInfo(db, email, password),
    getWorkspace(db, workspace)
  ]).then(([accountInfo, workspaceInfo]) => {
    for (const w of accountInfo.workspaces) {
      if (w.equals(workspaceInfo._id)) {
        const result: LoginInfo = {
          workspace,
          server,
          port,
          token: encode({ email, workspace }, secret),
          email
        }
        return result
      }
    }
    throw new PlatformError(new Status(Severity.ERROR, AccountStatusCode.WORKSPACE_NOT_ACCESSIBLE, 'Workspace not accessible'))
  })
}


// async function updateAccount (db: Db, email: string, password: string, newPassword: string): Promise<AccountInfo> {
//   let account = await getAccount(db, email)

//   if (!account) {
//     throw new PlatformError(new Status(Severity.ERROR, AccountStatusCode.ACCOUNT_NOT_FOUND, 'Account not found.'))
//   }
//   if (!verifyPassword(password, account.hash.buffer, account.salt.buffer)) {
//     throw new PlatformError(new Status(Severity.ERROR, AccountStatusCode.INCORRECT_PASSWORD, 'Incorrect password.'))
//   }

//   let hash = hashWithSalt(password, account.salt.buffer)
//   if (newPassword) {
//     hash = hashWithSalt(newPassword, account.salt.buffer)
//   }

//   db.collection(ACCOUNT_COLLECTION).updateOne({ _id: account._id }, {
//     $set: {
//       hash: hash,
//       clientSecret: clientSecret
//     }
//   })

//   account = await getAccount(db, email)

//   if (!account) {
//     throw new PlatformError(new Status(Severity.ERROR, PlatformStatusCodes.ACCOUNT_NOT_FOUND, 'Account not found.'))
//   }
//   return toAccountInfo(account)
// }

// async function pushClientId (db: Db, email: string, clientId: string) {
//   const account = await getAccount(db, email)

//   if (!account) {
//     throw new PlatformError(new Status(Severity.ERROR, PlatformStatusCodes.ACCOUNT_NOT_FOUND, 'Account not found.'))
//   }

//   for (const id of account.clientIds) {
//     if (id === clientId) return
//   }

//   db.collection(ACCOUNT_COLLECTION).updateOne({ _id: account._id }, { $push: { clientIds: clientId } })
// }

// export async function removeWorkspace (db: Db, email: string, workspace: string): Promise<void> {
//   const { workspaceId, accountId } = await getWorkspaceAndAccount(db, email, workspace)

//   // Add account into workspace.
//   await db.collection(WORKSPACE_COLLECTION).updateOne({ _id: workspaceId }, { $pull: { accounts: accountId } })

//   // Add account a workspace
//   await db.collection(ACCOUNT_COLLECTION).updateOne({ _id: accountId }, { $pull: { workspaces: workspaceId } })
// }

// export async function createUserAccount (db: Db, email: string, password: string): Promise<ObjectID> {
//   return (await createAccount(db, email, password))._id
// }

// export async function getUserAccount (db: Db, email: string): Promise<ObjectID | null> {
//   const account = await getAccount(db, email)
//   if (account != null) {
//     return account._id
//   }
//   return null
// }

// export function withTenant (client: MongoClient, workspace: string): Db {
//   return client.db('ws-' + workspace)
// }

// export function accountsDb (client: MongoClient): Db {
//   return client.db('accounts')
// }

function wrap<P extends any[], R> (f: (db: Db, ...args: P) => Promise<R>) {
  return function (db: Db, request: Request<P>): Promise<Response<R>> {
    return f(db, ...request.params)
      .then((result) => ({ id: request.id, result }))
      .catch((err) => {
        if (err instanceof PlatformError) {
          const pe = err
          return { id: request.id, error: { code: pe.status.code, message: pe.status.message } }
        } else {
          return { id: request.id, error: { code: 0, message: err.message } }
        }
      })
  }
}

export const methods = {
  login: wrap(login),
  // getAccountInfo: wrap(getAccountInfo),
  createAccount: wrap(createAccount),
  createWorkspace: wrap(createWorkspace),
  addWorkspace: wrap(addWorkspace),
  // removeWorkspace: wrap(removeWorkspace),
  // updateAccount: wrap(updateAccount)
}
