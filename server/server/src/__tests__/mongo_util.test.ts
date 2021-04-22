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

import { BooleanProperty, DocumentValue, StringProperty, Tx, txContext } from '@anticrm/core'
import { createSubtask, Task, taskIds as task } from '@anticrm/core/src/__tests__/tasks'
import { CORE_CLASS_OBJECT_SELECTOR, CORE_CLASS_SPACE } from '@anticrm/domains'
import { createOperations } from '@anticrm/platform-core/src/operations'
import { createSetArrayFilters } from '../mongo_utils'
import { ServerSuite } from './serversuite'

describe('mongo operations', () => {
  const wsName = 'test-service-mongo'
  const server = new ServerSuite(wsName)

  beforeAll(async () => {
    await server.start()
  })

  afterAll(async () => {
    await server.shutdown()
  })
  beforeEach(async () => {
    await server.reInitDB()
  })

  it('check $set field', async () => {
    const ws = await server.getWorkspace(wsName)
    const model = await ws.getModel()

    const f1 = createSetArrayFilters(model, CORE_CLASS_SPACE,
      [{
        _class: CORE_CLASS_OBJECT_SELECTOR,
        key: 'users',
        pattern: { userId: 'qwe.com' }
      }],
      { owner: true as BooleanProperty }, 1)

    expect(f1).toEqual({
      updateOperation: {
        'users.$[f1].owner': true
      },
      index: 2,
      arrayFilter: [
        {
          'f1.userId': 'qwe.com'
        }
      ]
    })
  })

  it('check $set depth2-verify', async () => {
    const ws = await server.getWorkspace(wsName)
    const model = await ws.getModel()

    const f1 = createSetArrayFilters(model, task.class.Task,
      [{
        _class: CORE_CLASS_OBJECT_SELECTOR,
        key: 'tasks',
        pattern: { name: 'subtask1' }
      }, {
        _class: CORE_CLASS_OBJECT_SELECTOR,
        key: 'comments',
        pattern: { _id: '#0' }
      }], { author: 'Dart' as StringProperty },
      1
    )

    expect(f1).toEqual({
      updateOperation: {
        'tasks.$[f1].comments.$[f2].author': 'Dart'
      },
      index: 3,
      arrayFilter: [
        {
          'f1.name': 'subtask1'
        },
        {
          'f2._id': '#0'
        }
      ]
    })
  })
  it('check $set depth2', async () => {
    const ws = await server.getWorkspace(wsName)

    const doc1: DocumentValue<Task> = {
      description: '',
      name: 'my-space',
      lists: ['val1', 'val2'],
      rate: 20,
      mainTask: createSubtask('main-subtask', 30),
      tasks: [
        createSubtask('subtask1', 31),
        createSubtask('subtask2', 33)
      ]
    }

    doc1.tasks![0].comments = [{
      _id: '#0',
      author: '',
      date: new Date(),
      oldVersion: [],
      message: 'qwe'
    }]

    const processTx = async (tx: Tx): Promise<void> => {
      await ws.tx(txContext(), tx)
    }

    const ops = createOperations(await ws.getModel(), processTx, () => 'qwe' as StringProperty)

    const d1 = await ops.create<Task>(task.class.Task, doc1)
    const d2 = await ops.updateWith(d1, (s) =>
      s.tasks.match({ name: 'subtask1' }).comments.match({ _id: '#0' }).set({
        author: 'Dart',
        message: 'Vaider is god or bad?'
      }))
    expect(d2).toBeDefined()
    // Now le's find and check value

    const result = await ws.find(task.class.Task, { _id: d1._id })
    expect(result.length).toEqual(1)
    expect(result[0].tasks![0].comments!.length).toEqual(1)
    expect(result[0].tasks![0].comments![0].author).toEqual('Dart')
  })

  it('check $set depth2-verify', async () => {
    const ws = await server.getWorkspace(wsName)
    const model = await ws.getModel()

    const f1 = createSetArrayFilters(model, task.class.Task, [
      {
        _class: CORE_CLASS_OBJECT_SELECTOR,
        key: 'tasks',
        pattern: { name: 'subtask1' }
      }, {
        _class: CORE_CLASS_OBJECT_SELECTOR,
        key: 'comments',
        pattern: { _id: '#0' as StringProperty }
      }
    ], { author: 'Dart' as StringProperty }, 1)

    expect(f1).toEqual({
      updateOperation: {
        'tasks.$[f1].comments.$[f2].author': 'Dart'
      },
      arrayFilter: [
        {
          'f1.name': 'subtask1'
        },
        {
          'f2._id': '#0'
        }
      ],
      index: 3
    })
  })

  it('check $push with depth', async () => {
    const ws = await server.getWorkspace(wsName)

    const doc1: DocumentValue<Task> = {
      name: 'my-space',
      description: '',
      lists: ['val1', 'val2'],
      rate: 20,
      mainTask: createSubtask('main-subtask', 30),
      tasks: [
        createSubtask('subtask1', 31),
        createSubtask('subtask2', 33)
      ]
    }

    doc1.tasks![0].comments = [{
      _id: '#1',
      message: 'qwe',
      author: '',
      date: new Date(),
      oldVersion: []
    }]

    const processTx = async (tx: Tx): Promise<void> => {
      await ws.tx(txContext(), tx)
    }
    const ops = createOperations(await ws.getModel(), processTx, () => 'qwe' as StringProperty)

    const d1 = await ops.create<Task>(task.class.Task, doc1)
    const d2 = await ops.updateWith(d1, (s) =>
      s.tasks.match({ name: 'subtask1' }).comments.push({ _id: '#2', message: 'qwe-comment' }))

    expect(d2).toBeDefined()
    // Now le's find and check value

    const result = await ws.find(task.class.Task, { _id: d1._id })
    expect(result.length).toEqual(1)
    expect(result[0].tasks![0].comments!.length).toEqual(2)
    expect(result[0].tasks![0].comments![1].message).toEqual('qwe-comment')
  })
  it('check $pull with depth', async () => {
    const ws = await server.getWorkspace(wsName)

    const doc1: DocumentValue<Task> = {
      name: 'my-space',
      description: '',
      lists: ['val1', 'val2'],
      rate: 20,
      mainTask: createSubtask('main-subtask', 30),
      tasks: [
        createSubtask('subtask1', 31, [
          { _id: '#1', message: 'qwe', author: '', date: new Date(), oldVersion: [] },
          { _id: '#2', message: 'qwe2', author: '', date: new Date(), oldVersion: [] }]
        ),
        createSubtask('subtask2', 33)
      ]
    }

    const processTx = async (tx: Tx): Promise<void> => {
      await ws.tx(txContext(), tx)
    }
    const ops = createOperations(await ws.getModel(), processTx, () => 'qwe' as StringProperty)

    const d1 = await ops.create<Task>(task.class.Task, doc1)

    const d2 = await ops.updateWith(d1, (s) =>
      s.tasks.match({ name: 'subtask2' }).pull()
    )
    expect(d2).toBeDefined()

    const d4 = await ops.updateWith(d1, (s) =>
      s.lists.match('val2').pull()
    )
    expect(d4).toBeDefined()
    // Now le's find and check value

    let result = await ws.find(task.class.Task, { _id: d1._id })
    expect(result.length).toEqual(1)
    expect(result[0].tasks!.length).toEqual(1)
    expect(result[0].lists.length).toEqual(1)

    const d3 = await ops.updateWith(d1, (s) =>
      s.tasks.match({ name: 'subtask1' }).comments.match({ _id: '#2' }).pull())

    expect(d3).toBeDefined()
    // Now le's find and check value

    result = await ws.find(task.class.Task, { _id: d1._id })
    expect(result.length).toEqual(1)
    expect(result[0].tasks!.length).toEqual(1)
    expect(result[0].tasks![0].comments!.length).toEqual(1)
  })
  it('find embedded in depth', async () => {
    const ws = await server.getWorkspace(wsName)

    const doc1: DocumentValue<Task> = {
      name: 'task1',
      lists: ['val1'],
      description: '',
      rate: 20,
      tasks: [
        createSubtask('subtask1', 31, [
          { _id: '#1', message: 'qwe', author: '', date: new Date(), oldVersion: [] }, { _id: '#2', message: 'qwe2', author: '', date: new Date(), oldVersion: [] }]),
        createSubtask('subtask2', 33)
      ]
    }
    const doc2: DocumentValue<Task> = {
      name: 'task2',
      lists: ['val2'],
      description: '',
      rate: 20,
      tasks: [
        createSubtask('subtask1-2', 31, [{ _id: '#1', message: 'qwe', author: '', date: new Date(), oldVersion: [] }, { _id: '#2', message: 'qwe2', author: '', date: new Date(), oldVersion: [] }]),
        createSubtask('subtask2-2', 33)
      ]
    }

    const processTx = async (tx: Tx): Promise<void> => {
      await ws.tx(txContext(), tx)
    }
    const ops = createOperations(await ws.getModel(), processTx, () => 'qwe' as StringProperty)

    await ops.create(task.class.Task, doc1)
    await ops.create(task.class.Task, doc2)

    let result = await ws.find(task.class.Task, { tasks: { name: 'subtask1-2' as StringProperty } })
    expect(result.length).toEqual(1)
    expect(result[0].name).toEqual('task2')

    result = await ws.find(task.class.Task, { tasks: [{ name: 'subtask1-2' as StringProperty }, { name: 'subtask2-2' as StringProperty }] })
    expect(result.length).toEqual(1)
    expect(result[0].name).toEqual('task2')
  })
})
