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

import { ServerSuite } from './serversuite'

import core, { AnyLayout, BooleanProperty, StringProperty } from '@anticrm/core'
import { createSetArrayFilters } from '../mongo_utils'

import { taskIds as task, createSubtask, Task, TaskComment } from '@anticrm/model/src/__tests__/test_tasks'

import { createOperations } from '@anticrm/platform-core/src/operations'

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

    const f1 = createSetArrayFilters(model, core.class.Space, {
      users: {
        userId: 'qwe.com' as StringProperty
      }
    }, { owner: true as BooleanProperty })

    expect(f1).toEqual({
      updateOperation: {
        'users.$[f1].owner': true
      },
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

    const f1 = createSetArrayFilters(model, task.class.Task, {
      tasks: {
        name: 'subtask1' as StringProperty,
        comments: {
          _id: '#0' as StringProperty
        }
      }
    }, { author: 'Dart' as StringProperty })

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
      ]
    })
  })
  it('check $set depth2', async () => {
    const ws = await server.getWorkspace(wsName)

    const doc1 = {
      name: 'my-space',
      lists: ['val1', 'val2'],
      rate: 20,
      mainTask: createSubtask('main-subtask', 30),
      tasks: [
        createSubtask('subtask1', 31),
        createSubtask('subtask2', 33)
      ]
    } as Task

    doc1.tasks![0].comments = [{
      _id: '#0',
      message: 'qwe'
    } as TaskComment]

    const ops = createOperations(await ws.getModel(), ws.tx, () => 'qwe' as StringProperty)

    const d1 = await ops.create(task.class.Task, (doc1 as unknown) as AnyLayout)
    const d2 = await ops.update(d1, {
      tasks: {
        name: 'subtask1' as StringProperty,
        comments: {
          _id: '#0' as StringProperty
        }
      }
    }, {
      author: 'Dart' as StringProperty,
      message: 'Vaider is god or bad?' as StringProperty
    })
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

    const f1 = createSetArrayFilters(model, task.class.Task, {
      tasks: {
        name: 'subtask1' as StringProperty,
        comments: {
          _id: '#0' as StringProperty
        }
      }
    }, { author: 'Dart' as StringProperty })

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
      ]
    })
  })
  it('check $push with depth', async () => {
    const ws = await server.getWorkspace(wsName)

    const doc1 = {
      name: 'my-space',
      lists: ['val1', 'val2'],
      rate: 20,
      mainTask: createSubtask('main-subtask', 30),
      tasks: [
        createSubtask('subtask1', 31),
        createSubtask('subtask2', 33)
      ]
    } as Task

    doc1.tasks![0].comments = [{
      _id: '#1',
      message: 'qwe'
    } as TaskComment]

    const ops = createOperations(await ws.getModel(), ws.tx, () => 'qwe' as StringProperty)

    const d1 = await ops.create(task.class.Task, (doc1 as unknown) as AnyLayout)
    const d2 = await ops.push(d1,
      {
        tasks: {
          name: 'subtask1' as StringProperty
        }
      }, 'comments' as StringProperty,
      {
        _id: '#2' as StringProperty,
        message: 'qwe-comment' as StringProperty
      })
    expect(d2).toBeDefined()
    // Now le's find and check value

    const result = await ws.find(task.class.Task, { _id: d1._id })
    expect(result.length).toEqual(1)
    expect(result[0].tasks![0].comments!.length).toEqual(2)
    expect(result[0].tasks![0].comments![1].message).toEqual('qwe-comment')
  })
  it('check $pull with depth', async () => {
    const ws = await server.getWorkspace(wsName)

    const doc1 = {
      name: 'my-space',
      lists: ['val1', 'val2'],
      rate: 20,
      mainTask: createSubtask('main-subtask', 30),
      tasks: [
        createSubtask('subtask1', 31),
        createSubtask('subtask2', 33)
      ]
    } as Task

    const ops = createOperations(await ws.getModel(), ws.tx, () => 'qwe' as StringProperty)

    const d1 = await ops.create(task.class.Task, (doc1 as unknown) as AnyLayout)
    const d2 = await ops.remove(d1,
      {
        tasks: {
          name: 'subtask2' as StringProperty
        }
      })
    expect(d2).toBeDefined()
    // Now le's find and check value

    let result = await ws.find(task.class.Task, { _id: d1._id })
    expect(result.length).toEqual(1)
    expect(result[0].tasks!.length).toEqual(1)

    const d3 = await ops.remove(d1,
      {
        mainTask: {}
      })
    expect(d3).toBeDefined()
    result = await ws.find(task.class.Task, { _id: d1._id })
    expect(result.length).toEqual(1)
    expect(result[0].mainTask).toBeUndefined()
  })
})
