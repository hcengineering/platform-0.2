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

import { Doc, generateId, Ref, Space } from '@anticrm/core'
import core from '@anticrm/platform-core'
import { Db, MongoClient } from 'mongodb'


async function getTestWorkspace (uri: string): Promise<{ db: Db; client: MongoClient }> {
  const client = await MongoClient.connect(uri, { useUnifiedTopology: true })

  // Drop Existing database
  await client.db('ttest-worksapce-db').dropDatabase()
  return { db: client.db('test-worksapce-db'), client }
}

describe('workspace', () => {
  const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
  const workspace: Promise<{ db: Db; client: MongoClient }> = getTestWorkspace(mongodbUri)

  it('should send query', async done => {
    const db = (await workspace).db

    const obj = {
      _id: generateId() as Ref<Doc>,
      _class: core.class.Space,
      name: 'space1',
      lists: []
    } as Space
    const objId = obj._id
    console.log('OBJID:', objId)
    const result = await db.collection('test-objects').insertOne(obj)
    expect(result.insertedId).toEqual(objId)

    const result2 = await db.collection('test-objects').insertOne(obj)
    expect(result2.insertedId).toEqual(objId)
    done()
  })

  afterAll(async () => {
    ; (await workspace).client.close()
  })
})
