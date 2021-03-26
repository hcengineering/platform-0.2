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

import { program } from 'commander'
import { createContact, removeContact } from './user'
import { initDatabase } from './init'
import { MongoClient } from 'mongodb'

import { createWorkspace, createUserAccount, assignWorkspace, getWorkspace, removeWorkspace, withTenant } from '@anticrm/accounts'

const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017'

function withDatabase (uri: string, f: (client: MongoClient) => Promise<any>) {
  console.log(`connecting to database '${uri}'...`)

  return MongoClient.connect(uri, { useUnifiedTopology: true }).then((client) => {
    f(client).then(() => client.close())
  })
}
program.version('0.0.1')

// create-user john.appleseed@gmail.com --password 123 --workspace workspace --fullname "John Appleseed"
program
  .command('create-user <email>')
  .description('create user and corresponding account in master database')
  .requiredOption('-p, --password <password>', 'user password')
  .requiredOption('-f, --fullname <fullname>', 'full user name')
  .requiredOption('-w, --workspace <workspace>', 'workspace')
  .action((email, cmd) => {
    withDatabase(mongodbUri, async (client) => {
      const db = client.db('accounts')
      const user = createUserAccount(db, email, cmd.password) // Create user accont inside accounts
      const workspace = getWorkspace(db, cmd.workspace) // a workspace

      const assignDone = Promise.all([user, workspace]).then(() => {
        return assignWorkspace(db, email, cmd.workspace)
      })
      const contactDone = createContact(withTenant(client, cmd.workspace), email, cmd.fullname)
      return Promise.all([contactDone, assignDone])
    })
  })

// remove-user john.appleseed@gmail.com
program
  .command('remove-user [email]')
  .description('remove user and corresponding account in master database')
  .requiredOption('-w, --workspace <workspace>', 'workspace')
  .action((email, cmd) => {
    withDatabase(mongodbUri, async (client) => {
      const db = client.db('accounts')
      return Promise.all([
        removeContact(withTenant(client, cmd.workspace), email), // Create contact
        removeWorkspace(db, email, cmd.workspace) //
      ])
    })
  })

// create-workspace workspace --name "Organization"
program
  .command('create-workspace <name>')
  .description('create workspace')
  .requiredOption('-o, --organization <organization>', 'organization name')
  .action((workspace, cmd) => {
    withDatabase(mongodbUri, (client) => {
      const accounts = client.db('accounts')
      const workspaceId = createWorkspace(accounts, workspace, cmd.organization)

      const tenant = withTenant(client, workspace)
      const databaseDone = initDatabase(tenant)
      return Promise.all([workspaceId, databaseDone])
    })
  })

program
  .command('upgrade-workspace <workspace>')
  .description('upgrade workspace')
  .action((workspace, cmd) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    withDatabase(mongodbUri, async (client) => {
      const tenant = withTenant(client, workspace)
      return initDatabase(tenant)
    })
  })

program.parse(process.argv)
