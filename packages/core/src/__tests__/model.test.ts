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

import { AnyLayout, Property, StringProperty } from '../classes'
import { Model } from '../model'
import { createSubtask, createTask, doc1, taskIds, data } from './tasks'

const model = new Model('vdocs')
model.loadModel(data)

describe('matching', () => {
  it('match object value', () => {
    expect(model.matchQuery(taskIds.class.Task, doc1, { name: 'my-space' as StringProperty })).toEqual(true)
  })
  it('match list value', () => {
    expect(model.matchQuery(taskIds.class.Task, doc1, { lists: ['val1' as StringProperty, 'val2' as StringProperty] })).toEqual(true)
  })

  it('match embedded value', () => {
    expect(
      model.matchQuery(taskIds.class.Task, doc1, {
        mainTask: {
          name: 'main-subtask' as StringProperty
        }
      })
    ).toEqual(true)
  })
  it('match embedded list value', () => {
    expect(
      model.matchQuery(taskIds.class.Task, doc1, {
        tasks: [
          {
            name: 'subtask1' as StringProperty
          },
          {
            rate: 33 as Property<number, number>
          }
        ]
      })
    ).toEqual(true)
  })

  it('apply string value', () => {
    const clone = model.createDocument(taskIds.class.Task, doc1)
    model.updateDocument(clone, null, { name: 'changed' as StringProperty } as AnyLayout)

    expect(clone.name).toEqual('changed')
  })
  it('apply number value', () => {
    const clone = model.createDocument(taskIds.class.Task, doc1)
    model.updateDocument(clone, null, { rate: 10 as Property<number, number> } as AnyLayout)

    expect(clone.rate).toEqual(10)
  })

  it('apply array value', () => {
    const clone = model.createDocument(taskIds.class.Task, doc1)
    model.updateDocument(clone, null, { lists: ['A' as StringProperty, 'B' as StringProperty] } as AnyLayout)

    expect(clone.lists).toEqual(['A', 'B'])
  })

  it('apply task value', () => {
    const clone = model.createDocument(taskIds.class.Task, doc1)
    clone.mainTask = undefined
    model.updateDocument(clone, null, { mainTask: createSubtask('subtask4') } as AnyLayout)

    expect(clone.mainTask).toBeDefined()
    expect(clone.mainTask!.name).toEqual('subtask4')
  })

  it('push subtask value', () => {
    const clone = model.createDocument(taskIds.class.Task, doc1)
    model.pushDocument(clone, null, 'tasks' as StringProperty, (createSubtask('subtask3', 34) as unknown) as AnyLayout)

    expect(clone.tasks!.length).toEqual(3)
  })

  it('push a new subtask value', () => {
    const clone = model.createDocument(taskIds.class.Task, doc1)
    const cloneResult = model.updateDocument(clone, { tasks: { name: 'subtask1' as StringProperty } }, {
      rate: 44 as Property<number, number>
    })

    expect(cloneResult.tasks![0].rate).toEqual(44)
  })

  it('push a new comment to subtask', () => {
    const clone = model.createDocument(taskIds.class.Task, doc1)
    const cloneResult = model.pushDocument(clone, { tasks: { name: 'subtask1' as StringProperty } },
      'comments' as StringProperty, {
        message: 'my-msg' as StringProperty
      })

    expect(cloneResult.tasks![0].comments!.length).toEqual(1)
  })

  it('remove item from array', () => {
    const clone = model.createDocument(taskIds.class.Task, doc1)
    const cloneResult = model.removeDocument(clone, { tasks: { name: 'subtask1' as StringProperty } })

    expect(cloneResult.tasks!.length).toEqual(1)
    expect(cloneResult.tasks![0].name).toEqual('subtask2')
  })

  it('remove item from instance', () => {
    const clone = model.createDocument(taskIds.class.Task, doc1)
    const cloneResult = model.removeDocument(clone, { mainTask: {} })

    expect(cloneResult.mainTask).toEqual(undefined)
  })

  it('match regex value', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    model.add(model.createDocument(taskIds.class.Task, createTask('t1', 10, 'test task1')))
    model.add(model.createDocument(taskIds.class.Task, createTask('t2t', 11, 'test task2')))

    const result = await model.find(taskIds.class.Task, { name: { $regex: 't.*t' as StringProperty } })

    expect(result.length).toEqual(1)
  })

  it('find one happy path', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    model.add(model.createDocument(taskIds.class.Task, createTask('t1', 10, 'test task1')))
    model.add(model.createDocument(taskIds.class.Task, createTask('t2', 11, 'test task2')))

    const result = await model.findOne(taskIds.class.Task, { name: { $regex: 't2' as StringProperty } })
    expect(result).toBeDefined()
  })

  it('find one not found', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    model.add(model.createDocument(taskIds.class.Task, createTask('t1', 10, 'test task1')))

    const result = await model.findOne(taskIds.class.Task, { name: { $regex: 't3' as StringProperty } })
    expect(result).toBeUndefined()
  })

  it('remove document without "query" argument', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const doc = model.createDocument(taskIds.class.Task, doc1)
    model.add(doc)

    // call to find() initialzes lazy loaded byClass model's attribute
    await model.find(taskIds.class.Task, { name: doc.name as StringProperty })

    model.removeDocument(doc, null)
    const result = await model.find(taskIds.class.Task, { name: doc.name as StringProperty })
    expect(result.length).toEqual(0)
  })
})
