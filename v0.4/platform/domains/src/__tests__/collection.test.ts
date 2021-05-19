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

/* eslint-env jest */

import { Emb, Model, Ref, txContext } from '@anticrm/core'
import { ModelStorage } from '../model_storage'
import { Space } from '../space'
import { addItem, removeItem, updateItem } from '../tx'
import { createTask, data, Task, TaskComment, taskIds } from './domains_tasks'

describe('core tests', () => {
  it('find in test', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const t1: Task = model.createDocument<Task>(taskIds.class.Task, createTask('t1', 10, 'test task1'))

    t1.comments = {
      items: [
        { _class: taskIds.class.TaskComment, _id: '#1' as Ref<Emb>, author: 'vasya', date: new Date(), message: 'Some msg' },
        { _class: taskIds.class.TaskComment, _id: '#2' as Ref<Emb>, author: 'vasya', date: new Date(), message: 'Some msg 2' },
        { _class: taskIds.class.TaskComment, _id: '#3' as Ref<Emb>, author: 'petya', date: new Date(), message: 'Some more msg' }
      ]
    }
    model.add(t1)

    const storage = new ModelStorage(model)

    const result = await storage.findIn<Task, TaskComment>(taskIds.class.Task, t1._id,
      s => s.comments, taskIds.class.TaskComment,
      { message: { $regex: '.* msg$' } }
    )
    expect(result).toBeDefined()
    expect(result.length).toEqual(2)
    expect(result[0]._class).toEqual(taskIds.class.TaskComment)
  })
  it('create in test', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const t1 = model.createDocument(taskIds.class.Task, createTask('t1', 10, 'test task1'))
    model.add(t1)

    const storage = new ModelStorage(model)

    await storage.tx(txContext(),
      addItem<Task, TaskComment>(taskIds.class.Task, t1._id, '-' as Ref<Space>, taskIds.class.TaskComment,
        (s) => s.comments,
        { _id: '#1' as Ref<Emb>, author: 'vasya', date: new Date(), message: 'Some msg' })
    )
    await storage.tx(txContext(),
      addItem<Task, TaskComment>(taskIds.class.Task, t1._id, '-' as Ref<Space>, taskIds.class.TaskComment,
        (s) => s.comments,
        { _id: '#2' as Ref<Emb>, author: 'vasya', date: new Date(), message: 'Some msg 2' })
    )
    await storage.tx(txContext(),
      addItem<Task, TaskComment>(taskIds.class.Task, t1._id, '-' as Ref<Space>, taskIds.class.TaskComment,
        (s) => s.comments,
        { _id: '#2' as Ref<Emb>, author: 'petya', date: new Date(), message: 'Some more msg' })
    )

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
    const model = new Model('vdocs')
    model.loadModel(data)

    const t1 = model.createDocument(taskIds.class.Task, createTask('t1', 10, 'test task1'))

    t1.comments = {
      items: [
        { _class: taskIds.class.TaskComment, _id: '#1' as Ref<Emb>, author: 'vasya', date: new Date(), message: 'Some msg' },
        { _class: taskIds.class.TaskComment, _id: '#2' as Ref<Emb>, author: 'vasya', date: new Date(), message: 'Some msg 2' },
        { _class: taskIds.class.TaskComment, _id: '#3' as Ref<Emb>, author: 'petya', date: new Date(), message: 'Some more msg' }
      ]
    }
    model.add(t1)

    const storage = new ModelStorage(model)

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
    const model = new Model('vdocs')
    model.loadModel(data)

    const t1 = model.createDocument(taskIds.class.Task, createTask('t1', 10, 'test task1'))

    t1.comments = {
      items: [
        { _class: taskIds.class.TaskComment, _id: '#1' as Ref<Emb>, author: 'vasya', date: new Date(), message: 'Some msg' },
        { _class: taskIds.class.TaskComment, _id: '#2' as Ref<Emb>, author: 'vasya', date: new Date(), message: 'Some msg 2' },
        { _class: taskIds.class.TaskComment, _id: '#3' as Ref<Emb>, author: 'petya', date: new Date(), message: 'Some more msg' }
      ]
    }
    model.add(t1)

    const storage = new ModelStorage(model)

    await storage.tx(txContext(),
      removeItem<Task, TaskComment>(taskIds.class.Task, t1._id, '-' as Ref<Space>, taskIds.class.TaskComment,
        (s) => s.comments, '#2' as Ref<TaskComment>)
    )

    const result = await storage.findIn<Task, TaskComment>(taskIds.class.Task, t1._id, s => s.comments, taskIds.class.TaskComment, {})
    expect(result).toBeDefined()
    expect(result.length).toEqual(2)
    expect(result[0]._class).toEqual(taskIds.class.TaskComment)
  })
})
