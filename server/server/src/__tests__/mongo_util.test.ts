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

import { BooleanProperty, DocumentValue, generateId, SortingOrder, StringProperty, Tx, txContext } from '@anticrm/core'
import { createSubtask, Task, taskIds as task } from '@anticrm/core/src/__tests__/tasks'
import { CORE_CLASS_OBJECT_SELECTOR, CORE_CLASS_SPACE } from '@anticrm/domains'
import { createOperations } from '@anticrm/domains/src/tx/operations'
import { createSetArrayFilters } from '../mongo_utils'
import { ServerSuite } from './serversuite'

jest.mock('../webrtc')

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

    const ops = createOperations(await ws.getModel(), processTx, 'qwe')

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
    const ops = createOperations(await ws.getModel(), processTx, 'qwe')

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
    const ops = createOperations(await ws.getModel(), processTx, 'qwe')

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
    const ops = createOperations(await ws.getModel(), processTx, 'qwe')

    await ops.create(task.class.Task, doc1)
    await ops.create(task.class.Task, doc2)

    let result = await ws.find(task.class.Task, { tasks: { name: 'subtask1-2' as StringProperty } })
    expect(result.length).toEqual(1)
    expect(result[0].name).toEqual('task2')

    result = await ws.find(task.class.Task, { tasks: [{ name: 'subtask1-2' as StringProperty }, { name: 'subtask2-2' as StringProperty }] })
    expect(result.length).toEqual(1)
    expect(result[0].name).toEqual('task2')
  })

  it('check limit', async () => {
    const ws = await server.getWorkspace(wsName)

    const processTx = async (tx: Tx): Promise<void> => {
      await ws.tx(txContext(), tx)
    }
    const ops = createOperations(await ws.getModel(), processTx, 'qwe')

    for (let i = 0; i < 50; i++) {
      const doc1: DocumentValue<Task> = {
        name: `my-task-${i}`,
        description: `${i * i}`,
        lists: [`${i}`],
        rate: 20 + i,
        tasks: []
      }
      await ops.create<Task>(task.class.Task, doc1)
    }

    const r = await ws.find(task.class.Task, {}, { limit: 10 })
    expect(r.length).toEqual(10)
  })
  it('check skip', async () => {
    const ws = await server.getWorkspace(wsName)

    const processTx = async (tx: Tx): Promise<void> => {
      await ws.tx(txContext(), tx)
    }
    const ops = createOperations(await ws.getModel(), processTx, 'qwe')

    for (let i = 0; i < 50; i++) {
      const doc1: DocumentValue<Task> = {
        name: `my-task-${i}`,
        description: `${i * i}`,
        lists: [`${i}`],
        rate: 20 + i,
        tasks: []
      }
      await ops.create<Task>(task.class.Task, doc1)
    }

    const r = await ws.find(task.class.Task, {}, { skip: 10 })
    expect(r.length).toEqual(40)
  })

  it('check sorting', async () => {
    const ws = await server.getWorkspace(wsName)

    const processTx = async (tx: Tx): Promise<void> => {
      await ws.tx(txContext(), tx)
    }
    const ops = createOperations(await ws.getModel(), processTx, 'qwe')

    for (let i = 0; i < 50; i++) {
      const doc1: DocumentValue<Task> = {
        name: `my-task-${10 - i % 5}`,
        description: `${10000 - i * i}`,
        comments: [{ _id: `#${i}`, author: generateId(), date: new Date(), oldVersion: [], message: `${i}` }],
        lists: [`${i}`],
        rate: 20 + i,
        tasks: []
      }
      await ops.create<Task>(task.class.Task, doc1)
    }

    let r = await ws.find(task.class.Task, {}, {
      sort: { name: SortingOrder.Ascending, comments: { message: SortingOrder.Descending } }
    })
    let names = r.map(v => v.name).filter(function (item, pos, self) {
      return self.indexOf(item) === pos
    })
    expect(names).toEqual([10, 6, 7, 8, 9].map(v => `my-task-${v}`))
    let messages = r.map(v => v.comments?.[0].message).filter(function (item, pos, self) {
      return self.indexOf(item) === pos
    })
    expect(messages).toEqual(['5', '45', '40', '35', '30', '25', '20', '15', '10', '0', '9', '49', '44', '4', '39', '34', '29', '24', '19', '14', '8', '48', '43', '38', '33', '3', '28', '23', '18', '13', '7', '47', '42', '37', '32', '27', '22', '2', '17', '12', '6', '46', '41', '36', '31', '26', '21', '16', '11', '1'])

    // Do search order reverse

    r = await ws.find(task.class.Task, {}, {
      sort: { comments: { message: SortingOrder.Descending }, name: SortingOrder.Ascending }
    })
    names = r.map(v => v.name).filter(function (item, pos, self) {
      return self.indexOf(item) === pos
    })
    expect(names).toEqual([6, 7, 8, 9, 10].map(v => `my-task-${v}`))
    messages = r.map(v => v.comments?.[0].message).filter(function (item, pos, self) {
      return self.indexOf(item) === pos
    })
    expect(messages).toEqual(['9', '8', '7', '6', '5', '49', '48', '47', '46', '45', '44', '43', '42', '41', '40', '4', '39', '38', '37', '36', '35', '34', '33', '32', '31', '30', '3', '29', '28', '27', '26', '25', '24', '23', '22', '21', '20', '2', '19', '18', '17', '16', '15', '14', '13', '12', '11', '10', '1', '0'])
  })
})
