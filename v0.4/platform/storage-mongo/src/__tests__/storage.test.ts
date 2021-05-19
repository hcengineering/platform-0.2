/* eslint-disable @typescript-eslint/no-non-null-assertion */
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

import { Doc, DocumentValue, Model, Ref, SortingOrder, txContext } from '@anticrm/core'
import { createTask, data, Task, TaskComment, taskIds as task, taskIds } from '@anticrm/core/src/__tests__/tasks'
import { Space, addItem, create, removeItem, updateItem, update } from '@anticrm/domains'

import { Db, MongoClient } from 'mongodb'
import { MongoStorage } from '../storage'

describe('mongo operations', () => {
  const mongodbUri: string = process.env.MONGODB_URI ?? 'mongodb://localhost:27017'
  let dbClient!: MongoClient
  const dbId = 'mongo-storage-tests'
  let db!: Db
  let model!: Model

  beforeAll(async () => {
    dbClient = await MongoClient.connect(mongodbUri, { useUnifiedTopology: true })

    // Take a random database and drop all stuff if it exists.
    db = dbClient.db(dbId)
  })

  afterAll(async () => {
    await db.dropDatabase() // Remove our generated stuff.
    await dbClient.close()
  })

  beforeEach(async () => {
    // Remove all stuff from database.
    const cls = await db.collections()
    for (const c of cls) {
      await c.drop()
    }
    model = new Model('model_domain')
    model.loadModel(data)
  })

  it('check limit', async () => {
    const mongoStorage = new MongoStorage(model, db)

    for (let i = 0; i < 50; i++) {
      const doc1: DocumentValue<Task> = {
        name: `my-task-${i}`,
        description: `${i * i}`,
        rate: 20 + i
      }
      await mongoStorage.tx(txContext(), create<Task>(task.class.Task, doc1))
    }

    const r = await mongoStorage.find(task.class.Task, {}, { limit: 10 })
    expect(r.length).toEqual(10)
  })
  it('check skip', async () => {
    const mongoStorage = new MongoStorage(model, db)

    for (let i = 0; i < 50; i++) {
      const doc1: DocumentValue<Task> = {
        name: `my-task-${i}`,
        description: `${i * i}`,
        rate: 20 + i
      }
      await mongoStorage.tx(txContext(), create<Task>(task.class.Task, doc1))
    }

    const r = await mongoStorage.find(task.class.Task, {}, { skip: 10 })
    expect(r.length).toEqual(40)
  })

  it('check sorting', async () => {
    const mongoStorage = new MongoStorage(model, db)

    for (let i = 0; i < 50; i++) {
      const doc1: DocumentValue<Task> = {
        name: `my-task-${10 - i % 5}`,
        description: `${i}`,
        rate: 20 + i
      }
      await mongoStorage.tx(txContext(), create<Task>(task.class.Task, doc1))
    }

    let r = await mongoStorage.find(task.class.Task, {}, {
      sort: { name: SortingOrder.Ascending, description: SortingOrder.Descending }
    })
    let names = r.map(v => v.name).filter(function (item, pos, self) {
      return self.indexOf(item) === pos
    })
    expect(names).toEqual([10, 6, 7, 8, 9].map(v => `my-task-${v}`))
    let messages = r.map(v => v.description).filter(function (item, pos, self) {
      return self.indexOf(item) === pos
    })
    expect(messages).toEqual(['5', '45', '40', '35', '30', '25', '20', '15', '10', '0', '9', '49', '44', '4', '39', '34', '29', '24', '19', '14', '8', '48', '43', '38', '33', '3', '28', '23', '18', '13', '7', '47', '42', '37', '32', '27', '22', '2', '17', '12', '6', '46', '41', '36', '31', '26', '21', '16', '11', '1'])

    // Do search order reverse

    r = await mongoStorage.find(task.class.Task, {}, {
      sort: { description: SortingOrder.Descending, name: SortingOrder.Ascending }
    })
    names = r.map(v => v.name).filter(function (item, pos, self) {
      return self.indexOf(item) === pos
    })
    expect(names).toEqual([6, 7, 8, 9, 10].map(v => `my-task-${v}`))
    messages = r.map(v => v.description).filter(function (item, pos, self) {
      return self.indexOf(item) === pos
    })
    expect(messages).toEqual(['9', '8', '7', '6', '5', '49', '48', '47', '46', '45', '44', '43', '42', '41', '40', '4', '39', '38', '37', '36', '35', '34', '33', '32', '31', '30', '3', '29', '28', '27', '26', '25', '24', '23', '22', '21', '20', '2', '19', '18', '17', '16', '15', '14', '13', '12', '11', '10', '1', '0'])
  })

  it('find in test', async () => {
    const storage = new MongoStorage(model, db)

    const t1 = model.createDocument(taskIds.class.Task, createTask('t1', 10, 'test task1'))
    await createTasks(storage, t1)

    const result = await storage.findIn<Task, TaskComment>(taskIds.class.Task, t1._id, s => s.comments, taskIds.class.TaskComment, {
      message: {
        $regex: '.* msg$'
      }
    })
    expect(result).toBeDefined()
    expect(result.length).toEqual(2)
    expect(result[0]._class).toEqual(taskIds.class.TaskComment)
  })
  it('update in test', async () => {
    jest.setTimeout(400000)
    const storage = new MongoStorage(model, db)

    const t1 = model.createDocument(taskIds.class.Task, createTask('t1', 10, 'test task1'))
    await createTasks(storage, t1)

    await storage.tx(txContext(),
      updateItem<Task, TaskComment>(taskIds.class.Task, t1._id, '-' as Ref<Space>, taskIds.class.TaskComment,
        (s) => s.comments,
        '#2' as Ref<TaskComment>,
        { message: 'Some more msg msg' })
    )

    const result = await storage.findIn<Task, TaskComment>(taskIds.class.Task, t1._id, s => s.comments, taskIds.class.TaskComment, {
      message: {
        $regex: '.* msg$'
      }
    })
    expect(result).toBeDefined()
    expect(result.length).toEqual(3)
    expect(result[0]._class).toEqual(taskIds.class.TaskComment)
  })
  it('remove in test', async () => {
    const storage = new MongoStorage(model, db)

    const t1 = model.createDocument(taskIds.class.Task, createTask('t1', 10, 'test task1'))
    await createTasks(storage, t1)

    await storage.tx(txContext(),
      removeItem<Task, TaskComment>(taskIds.class.Task, t1._id, '-' as Ref<Space>, taskIds.class.TaskComment,
        (s) => s.comments, '#2' as Ref<TaskComment>)
    )

    const result = await storage.findIn<Task, TaskComment>(taskIds.class.Task, t1._id, s => s.comments, taskIds.class.TaskComment, {})
    expect(result).toBeDefined()
    expect(result.length).toEqual(2)
    expect(result[0]._class).toEqual(taskIds.class.TaskComment)
  })

  it('find by emb value', async () => {
    const mongoStorage = new MongoStorage(model, db)

    for (let i = 0; i < 50; i++) {
      const doc1: DocumentValue<Task> = {
        name: `my-task-${i}`,
        description: `${i * i}`,
        rate: 20 + i,
        eta: {
          eta: 10 + i,
          rom: i % 5
        }
      }
      await mongoStorage.tx(txContext(), create<Task>(task.class.Task, doc1))
    }

    const r = await mongoStorage.find(task.class.Task, { eta: { rom: 2 } }, { limit: 10 })
    expect(r.length).toEqual(10)
    expect(r.map(t => t.eta?.rom).filter(e => e === 2).length).toEqual(10)
  })
  it('update emb value', async () => {
    const mongoStorage = new MongoStorage(model, db)

    const doc1: DocumentValue<Task> = {
      name: 'my-task-0',
      description: 'Hello 0',
      rate: 20,
      eta: {
        eta: 10,
        rom: 2
      }
    }

    const _id = 'd1' as Ref<Doc>
    await mongoStorage.tx(txContext(), create<Task>(task.class.Task, doc1, _id))

    await mongoStorage.tx(txContext(), update<Task>(task.class.Task, _id, { eta: { rom: 3 } }))

    const r = await mongoStorage.findOne(task.class.Task, { _id })
    expect(r?.eta?.rom).toEqual(3)
  })
})
async function createTasks (storage: MongoStorage, t1: Task): Promise<void> {
  await storage.tx(txContext(), create<Task>(task.class.Task, t1, t1._id))

  await storage.tx(txContext(),
    addItem<Task, TaskComment>(taskIds.class.Task, t1._id, '-' as Ref<Space>, taskIds.class.TaskComment,
      (s) => s.comments,
      { author: 'vasya', date: new Date(), message: 'Some msg' },
      '#1' as Ref<TaskComment>)
  )
  await storage.tx(txContext(),
    addItem<Task, TaskComment>(taskIds.class.Task, t1._id, '-' as Ref<Space>, taskIds.class.TaskComment,
      (s) => s.comments,
      { author: 'vasya', date: new Date(), message: 'Some msg 2' },
      '#2' as Ref<TaskComment>)
  )
  await storage.tx(txContext(),
    addItem<Task, TaskComment>(taskIds.class.Task, t1._id, '-' as Ref<Space>, taskIds.class.TaskComment,
      (s) => s.comments,
      { author: 'petya', date: new Date(), message: 'Some more msg' },
      '#3' as Ref<TaskComment>)
  )
}
