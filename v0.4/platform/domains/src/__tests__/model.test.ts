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

import core, { AnyLayout, Class, Doc, DocumentQuery, DocumentValue, Model, PropertyType, Ref, txContext } from '@anticrm/core'
import { createSubtask, createTask, data, doc1, SubTask, Task, taskIds } from '@anticrm/core/src/__tests__/tasks'
import domains from '..'
import { ModelStorage } from '../model_storage'
import { getPrimaryKey } from '../primary_utils'
import { Space } from '../space'
import { create, ObjectTx, txBuilder, TxOperation, TxOperationKind, updateDocument } from '../tx'
import { push, updateDocumentPull, updateDocumentPush, updateDocumentSet } from './model_test_utils'

describe('core tests', () => {
  const model = new Model('vdocs')
  model.loadModel(data)

  it('create object selector ', () => {
    const s = txBuilder(taskIds.class.Task)

    expect(s.tasks?.match({ name: 'qwe' }).build()).toEqual([
      {
        _class: 'class:core.ObjectSelector',
        key: 'tasks',
        pattern: { name: 'qwe' }
      }
    ])
  })
  it('create multiple object selector ', () => {
    const s = txBuilder(taskIds.class.Task)

    expect(s.tasks?.match({ name: 'qwe' }).comments?.build()).toEqual([
      {
        _class: domains.class.ObjectSelector,
        key: 'tasks',
        pattern: { name: 'qwe' }
      },
      {
        _class: domains.class.ObjectSelector,
        key: 'comments'
      }
    ])
  })
  it('create object set operation ', () => {
    const s = txBuilder(taskIds.class.Task)

    expect(s.tasks?.match({ name: 'qwe' }).comments?.set({ message: 'comment msg' })).toEqual({
      _class: domains.class.TxOperation,
      kind: TxOperationKind.Set,
      _attributes: {
        message: 'comment msg'
      },
      selector: [
        {
          _class: domains.class.ObjectSelector,
          key: 'tasks',
          pattern: { name: 'qwe' }
        },
        {
          _class: domains.class.ObjectSelector,
          key: 'comments'
        }
      ]
    })
  })

  it('returns primary key of class', () => {
    expect(getPrimaryKey(model, core.class.Emb))
      .toBeUndefined()
    expect(getPrimaryKey(model, 'core.class.TaskObj' as Ref<Class<Doc>>))
      .toEqual('name')
    expect(getPrimaryKey(model, 'core.class.DerivedTaskObj' as Ref<Class<Doc>>))
      .toEqual('name')
  })
  it('create multiple operations ', () => {
    const s = txBuilder(taskIds.class.Task)

    expect(s.tasks?.match({ name: 'qwe' }).comments?.set({ message: 'comment msg' })).toEqual({
      _class: domains.class.TxOperation,
      kind: TxOperationKind.Set,
      _attributes: {
        message: 'comment msg'
      },
      selector: [
        {
          _class: domains.class.ObjectSelector,
          key: 'tasks',
          pattern: { name: 'qwe' }
        },
        {
          _class: domains.class.ObjectSelector,
          key: 'comments'
        }
      ]
    })
    expect(s.comments?.match({ message: 'qwe' }).set({ message: 'comment msg' })).toEqual({
      _class: domains.class.TxOperation,
      kind: TxOperationKind.Set,
      _attributes: {
        message: 'comment msg'
      },
      selector: [
        {
          _class: domains.class.ObjectSelector,
          key: 'comments',
          pattern: { message: 'qwe' }
        }
      ]
    })
  })

  it('check named attribute update', () => {
    const s = txBuilder(taskIds.class.Task)
    const fieldName = 'description'
    expect(s.set({ [fieldName]: 'someValue' })).toEqual({
      _class: domains.class.TxOperation,
      kind: TxOperationKind.Set,
      _attributes: {
        description: 'someValue'
      }
    })
  })
  it('apply string value', () => {
    const clone = model.createDocument(taskIds.class.Task, doc1)
    updateDocumentSet(model, clone, { name: 'changed' })

    expect(clone.name).toEqual('changed')
  })
  it('apply number value', () => {
    const clone = model.createDocument(taskIds.class.Task, doc1)
    updateDocumentSet(model, clone, { rate: 10 })

    expect(clone.rate).toEqual(10)
  })

  it('apply array value', () => {
    const clone = model.createDocument(taskIds.class.Task, doc1)
    updateDocumentSet(model, clone, { lists: ['A', 'B'] })

    expect(clone.lists).toEqual(['A', 'B'])
  })

  it('apply task value', () => {
    const clone = model.createDocument(taskIds.class.Task, doc1)
    clone.mainTask = undefined
    updateDocumentSet(model, clone, { mainTask: createSubtask('subtask4') })

    expect(clone.mainTask).toBeDefined()
    expect(((clone.mainTask as never) as SubTask).name).toEqual('subtask4')
  })

  it('push subtask value', () => {
    const clone = model.createDocument(taskIds.class.Task, doc1)
    updateDocumentPush<Task, SubTask>(model, clone, 'tasks', createSubtask('subtask3', 34))

    expect(clone.tasks?.length).toEqual(3)
  })

  it('push a new subtask value', () => {
    const clone = model.createDocument(taskIds.class.Task, doc1)
    const txOp: TxOperation = {
      _class: domains.class.TxOperation,
      kind: TxOperationKind.Set,
      _attributes: {
        rate: 44
      },
      selector: [{ _class: domains.class.ObjectSelector, key: 'tasks', pattern: { name: 'subtask1' } }]
    }
    const cloneResult = updateDocument(model, clone, [txOp])

    expect(cloneResult.tasks?.[0].rate).toEqual(44)
  })

  it('push a new comment to subtask', () => {
    const clone = model.createDocument(taskIds.class.Task, doc1)
    const txOp: TxOperation = {
      _class: domains.class.TxOperation,
      kind: TxOperationKind.Push,
      selector: [
        {
          _class: domains.class.ObjectSelector,
          key: 'tasks',
          pattern: { name: 'subtask1' }
        },
        { _class: domains.class.ObjectSelector, key: 'comments' }
      ],
      _attributes: {
        message: 'my-msg'
      }
    }
    const cloneResult = updateDocument(model, clone, [txOp])

    expect(cloneResult.tasks?.[0].comments?.length).toEqual(1)
  })

  it('remove item from array', () => {
    const clone = model.createDocument(taskIds.class.Task, doc1)
    const cloneResult = updateDocumentPull<Task, SubTask>(model, clone, 'tasks', { name: 'subtask1' })

    expect(cloneResult.tasks?.length).toEqual(1)
    expect(cloneResult.tasks?.[0].name).toEqual('subtask2')
  })

  it('remove item from instance', () => {
    const clone = model.createDocument(taskIds.class.Task, doc1)
    const cloneResult = updateDocumentPull<Task, SubTask>(model, clone, 'mainTask', {})

    expect(cloneResult.mainTask).toEqual(undefined)
  })

  it('rejects on storing existing doc', async () => {
    const model = new Model('vdocs')
    const modelStore = new ModelStorage(model)
    model.loadModel(data)

    const doc = model.createDocument(taskIds.class.Task, createTask('', 0, ''))

    const tx = create(model, 'vasya', doc._class, doc) as ObjectTx
    await modelStore.tx(txContext(), tx)
    try {
      await modelStore.tx(txContext(), tx)
      expect(model).toBeUndefined()
    } catch (err) {
      expect(err.message).toEqual('document added already ' + tx._objectId)
    }
  })

  it('rejects on removing missing doc', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    try {
      model.del('id' as Ref<Doc>)
      expect(model).toBeUndefined()
    } catch (err) {
      expect(err.message).toEqual('document is not found id')
    }
  })
  it('throws on pushing to missing object', () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const doc = model.createDocument<Task>(taskIds.class.Task, createTask('', 0, ''))

    const txOp: TxOperation = {
      _class: domains.class.TxOperation,
      kind: TxOperationKind.Set,
      _attributes: (createSubtask('subtask3', 34) as unknown) as AnyLayout,
      selector: [{ _class: domains.class.ObjectSelector, key: 'tasks', pattern: { name: 'Not exist' } }]
    }
    expect(() => updateDocument(model, doc, [txOp])).toThrowError()
  })

  it('throws on pushing to missing attribute', () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const doc = model.createDocument<Task>(taskIds.class.Task, createTask('', 0, ''))

    expect(() =>
      updateDocumentPush<Task, SubTask>(model, doc, 'Not exist', createSubtask('subtask3', 34))
    ).toThrowError()
  })

  it('document query specification test', () => {
    const q1: DocumentQuery<Space> = {
      name: 's1',
      users: { userId: 'qwe' }
    }

    const q2: DocumentQuery<Space> = {
      name: 's1',
      users: [{ userId: 'qwe' }]
    }
    const t1: DocumentValue<Task> = {
      description: '',
      lists: [],
      name: '',
      tasks: [{ name: '' }]
    }
    expect(q1).toBeDefined()
    expect(q2).toBeDefined()
    expect(t1).toBeDefined()
  })
})

describe('Model storage', () => {
  it('pushes attributes', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const doc = model.createDocument(taskIds.class.Task, doc1)
    model.add(doc)

    const existingSubtasks = [...(doc.tasks ?? [])]
    const newSubtask = createSubtask('subtask3', 34)
    const expectedDoc = {
      ...doc,
      tasks: [...existingSubtasks, { ...newSubtask, _class: taskIds.class.Subtask }]
    }

    push<SubTask>(model, '' as Ref<Class<Doc>>, doc._id, 'tasks', newSubtask)

    const updatedDoc = model.get(doc._id) as Task

    expect(updatedDoc).toEqual(expectedDoc)
  })

  it('updates doc', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const doc = model.createDocument(taskIds.class.Task, doc1)
    model.add(doc)

    const newName = 'your-space'
    const expectedDoc = {
      ...doc,
      name: newName
    }

    const txOp: TxOperation = {
      _class: domains.class.TxOperation,
      kind: TxOperationKind.Set,
      _attributes: { name: newName as PropertyType }
    }
    updateDocument(model, model.get(doc._id), [txOp])

    const updatedDoc = model.get(doc._id) as Task

    expect(updatedDoc).toEqual(expectedDoc)
  })
})
