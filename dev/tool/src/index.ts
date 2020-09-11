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
import { createUser, removeUser } from './user'
import { initDatabase } from './init'
import { MongoClient } from 'mongodb'

import { createWorkspace } from '@anticrm/accounts'

const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017'

function withDatabase (uri: string, f: (client: MongoClient) => Promise<any>) {
  console.log(`connecting to database '${uri}'...`)

  return MongoClient.connect(uri, { useUnifiedTopology: true }).then(client => {
    f(client).then(() => client.close())
  })
}

program.version('0.0.1')

program
  .command('create-user <email>')
  .description('create user and corresponding account in master database')
  .requiredOption('-p, --password <password>', 'user password')
  .requiredOption('-f, --fullname <fullname>', 'full user name')
  .action((email, cmd) => {
    withDatabase(mongodbUri, client => createUser(client.db(cmd.workspace), email, cmd.fullname))
  })

program
  .command('remove-user [email]')
  .description('remove user and corresponding account in master database')
  .requiredOption('-w, --workspace <workspace>', 'workspace')
  .action((email, cmd) => {
    withDatabase(mongodbUri, client => removeUser(client.db(cmd.workspace), email))
  })

program
  .command('create-workspace <email>')
  .description('create workspace')
  .requiredOption('-p, --password <password>', 'user password')
  .requiredOption('-f, --fullname <fullname>', 'full user name')
  .requiredOption('-w, --workspace <workspace>', 'workspace')
  .action((email, cmd) => {
    MongoClient.connect(mongodbUri, { useUnifiedTopology: true }).then(client => {
      const db = client.db('accounts')
      const p1 = createWorkspace(db, email, cmd.password, 'Organization', cmd.workspace)
      const tenant = client.db(cmd.workspace)
      const p2 = initDatabase(tenant)
      Promise.all([p1, p2]).then(() => createUser(tenant, email, cmd.fullname)).then(() => client.close())
    })
  })

program
  .command('upgrade-workspace <workspace>')
  .description('upgrade workspace')
  .action((workspace, cmd) => {
    MongoClient.connect(mongodbUri, { useUnifiedTopology: true }).then(client => {
      const tenant = client.db(workspace)
      const p2 = initDatabase(tenant).then(() => client.close())
    })
  })

program.parse(process.argv)
