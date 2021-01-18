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

import { AnyLayout, BooleanProperty, Property, StringProperty } from '@anticrm/model'
import core from '@anticrm/core'
import { createSetArrayFilter } from '../mongo_utils'

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

    const f1 = createSetArrayFilter(model, core.class.Space, {
      users: {
        userId: 'qwe.com' as StringProperty
      }
    }, { owner: true as BooleanProperty })

    expect(f1).toEqual({
      updateOperation: {
        'users.$[f0].owner': true
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

    const f1 = createSetArrayFilter(model, task.class.Task, {
      tasks: {
        name: 'subtask1' as StringProperty,
        comments: {
          _id: '#0' as StringProperty
        }
      }
    }, { author: 'Dart' as StringProperty })

    expect(f1).toEqual({
      updateOperation: {
        'tasks.$[f0].comments.$[f1].author': 'Dart'
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

    doc1.tasks![0].comments = [{ _id: '#0', message: 'qwe' } as TaskComment]

    const ops = createOperations(await ws.getModel(), ws.tx, () => 'qwe' as StringProperty)

    const d1 = await ops.create(task.class.Task, (doc1 as unknown) as AnyLayout)
    await await ops.update(d1, {
      tasks: {
        name: 'subtask1' as StringProperty,
        comments: {
          _id: '#0' as StringProperty
        }
      }
    }, { author: 'Dart' as StringProperty })

    // Now le's find and check value

    const result = await ws.find(task.class.Task, { _id: d1._id })
    expect(result.length).toEqual(1)
  })

  it('should send query existing Spaces', async () => {
    const ws = server.getWorkspace(wsName)
    const { client } = (await server.newClients(1, ws))[0]

    const spaces = await client.find(core.class.Space, { isPublic: true as Property<boolean, boolean> })
    expect(spaces.length).toEqual(3)

    // Push value to space and try modify it.
  })
})
