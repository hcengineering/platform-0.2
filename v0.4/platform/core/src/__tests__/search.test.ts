//
// Copyright © 2021 Anticrm Platform Contributors.
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

import { describe, expect, it } from '@jest/globals'
import { Model } from '../model'
import { FindOptions, SortingOrder } from '../storage'
import { createTask, data, Task, taskIds, TaskMixin } from './tasks'

describe('search', () => {
  describe('Search Options', () => {
    it('search order', async () => {
      let options: FindOptions<Task> = { sort: { _id: SortingOrder.Ascending, name: SortingOrder.Descending } }
      console.log(JSON.stringify(options))

      options = { sort: { name: SortingOrder.Descending, _id: SortingOrder.Ascending } }
      console.log(JSON.stringify(options))
    })

    it('find one happy path', async () => {
      const model = new Model('vdocs')
      model.loadModel(data)

      model.add(model.createDocument(taskIds.class.Task, createTask('t1', 10, 'test task1')))
      model.add(model.createDocument(taskIds.class.Task, createTask('t2', 11, 'test task2')))

      const result = await model.find<Task>(taskIds.class.Task, { name: { $regex: 't2' } })
      expect(result).toBeDefined()
    })

    it('find one not found', async () => {
      const model = new Model('vdocs')
      model.loadModel(data)

      model.add(model.createDocument(taskIds.class.Task, createTask('t1', 10, 'test task1')))

      const result = await model.find<Task>(taskIds.class.Task, { name: { $regex: 't3' } })
      expect(result.length).toEqual(0)
    })

    it('check mixin search in model', () => {
      const m = new Model('model')
      m.loadModel(data)

      const t1m: TaskMixin = m.createDocument(taskIds.mixin.TaskMixin, {
        name: 'qwe',
        description: '',
        lists: [],
        textValue: 'mixedValue'
      })

      m.add(t1m)

      const result = m.find<TaskMixin>(taskIds.mixin.TaskMixin, { textValue: 'mixedValue' })
      expect(result.length).toEqual(1)
    })
  })
  it('find limit check', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    model.add(model.createDocument(taskIds.class.Task, createTask('t1', 10, 'test task1')))
    model.add(model.createDocument(taskIds.class.Task, createTask('t2', 11, 'test task2')))
    model.add(model.createDocument(taskIds.class.Task, createTask('t3', 12, 'test task3')))

    const result = await model.find(taskIds.class.Task, { }, { limit: 1 })
    expect(result).toBeDefined()
    expect(result.length).toEqual(1)
  })

  it('find limit check-skip', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    model.add(model.createDocument(taskIds.class.Task, createTask('t1', 10, 'test task1')))
    model.add(model.createDocument(taskIds.class.Task, createTask('t2', 11, 'test task2')))
    model.add(model.createDocument(taskIds.class.Task, createTask('t3', 12, 'test task3')))

    const result = await model.find(taskIds.class.Task, { }, { skip: 1 })
    expect(result).toBeDefined()
    expect(result.length).toEqual(2)
  })
})
