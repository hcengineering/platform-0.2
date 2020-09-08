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
import { MongoClient, Db } from 'mongodb'
import { builder } from '@anticrm/boot/src/boot'

const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017'

function withDatabase (uri: string, workspace: string, f: (db: Db) => Promise<any>) {
  console.log(`connecting to workspace '${workspace}'...`)

  return MongoClient.connect(uri, { useUnifiedTopology: true }).then(client => {
    f(client.db(workspace)).then(() => client.close())
  })
}

program.version('0.0.1')

program
  .command('create-user <email>')
  .description('create user and corresponding account in master database')
  .requiredOption('-p, --password <password>', 'user password')
  .requiredOption('-u, --username <username>', 'full user name')
  .requiredOption('-w, --workspace <workspace>', 'workspace')
  .action((email, cmd) => {
    console.log(`create user ${email}, pass: ${cmd.password}, name: ${cmd.username}`)
    withDatabase(mongodbUri, cmd.workspace, db => createUser(builder, db, cmd.username))
  })

program
  .command('remove-user [email]')
  .description('remove user and corresponding account in master database')
  .requiredOption('-w, --workspace <workspace>', 'workspace')
  .action((email, cmd) => {
    withDatabase(mongodbUri, cmd.workspace, db => removeUser(db, email))
  })

program.parse(process.argv)
