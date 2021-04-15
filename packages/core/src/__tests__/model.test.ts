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

import {
  AnyLayout, Attribute, Class, CORE_CLASS_ATTRIBUTE, CORE_CLASS_CLASS, CORE_CLASS_DOC, CORE_CLASS_EMB, CORE_CLASS_OBJ,
  Doc, Mixin, Obj, Property, PropertyType, Ref, StringProperty
} from '../classes'
import { mixinFromKey, mixinKey, Model } from '../model'
import { DocumentQuery, generateId, txContext } from '../storage'
import { createSubtask, createTask, data, doc1, SubTask, Task, taskIds } from './tasks'
import { ObjectSelector, Space, TxOperation, TxOperationKind } from '@anticrm/domains'

describe('matching', () => {
  const model = new Model('vdocs')
  model.loadModel(data)

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
    const clone = model.newDoc(taskIds.class.Task, doc1._id, doc1)
    model.updateDocumentSet(clone, { name: 'changed' as StringProperty })

    expect(clone.name).toEqual('changed')
  })
  it('apply number value', () => {
    const clone = model.newDoc(taskIds.class.Task, doc1._id, doc1)
    model.updateDocumentSet(clone, { rate: 10 as Property<number, number> })

    expect(clone.rate).toEqual(10)
  })

  it('apply array value', () => {
    const clone = model.newDoc(taskIds.class.Task, doc1._id, doc1)
    model.updateDocumentSet(clone, { lists: ['A' as StringProperty, 'B' as StringProperty] })

    expect(clone.lists).toEqual(['A', 'B'])
  })

  it('apply task value', () => {
    const clone = model.newDoc(taskIds.class.Task, doc1._id, doc1)
    clone.mainTask = undefined
    model.updateDocumentSet(clone, { mainTask: createSubtask('subtask4') })

    expect(clone.mainTask).toBeDefined()
    expect((clone.mainTask as never as SubTask).name).toEqual('subtask4')
  })

  it('push subtask value', () => {
    const clone = model.newDoc(taskIds.class.Task, doc1._id, doc1)
    model.updateDocumentPush(clone, 'tasks' as StringProperty, (createSubtask('subtask3', 34) as unknown) as AnyLayout)

    expect(clone.tasks?.length).toEqual(3)
  })

  it('push a new subtask value', () => {
    const clone = model.newDoc(taskIds.class.Task, doc1._id, doc1)
    const cloneResult = model.updateDocument(clone, [{
      kind: TxOperationKind.Set,
      _attributes: {
        rate: 44 as Property<number, number>
      },
      selector: [{ key: 'tasks', pattern: { name: 'subtask1' } } as ObjectSelector]
    } as TxOperation])

    expect(cloneResult.tasks?.[0].rate).toEqual(44)
  })

  it('push a new comment to subtask', () => {
    const clone = model.newDoc(taskIds.class.Task, doc1._id, doc1)
    const cloneResult = model.updateDocument(clone, [{
      kind: TxOperationKind.Push,
      selector: [{
        key: 'tasks',
        pattern: { name: 'subtask1' }
      } as ObjectSelector, { key: 'comments' } as ObjectSelector],
      _attributes: {
        message: 'my-msg' as StringProperty
      }
    } as TxOperation])

    expect(cloneResult.tasks?.[0].comments?.length).toEqual(1)
  })

  it('remove item from array', () => {
    const clone = model.newDoc(taskIds.class.Task, doc1._id, doc1)
    const cloneResult = model.updateDocumentPull(clone, 'tasks', { name: 'subtask1' as StringProperty })

    expect(cloneResult.tasks?.length).toEqual(1)
    expect(cloneResult.tasks?.[0].name).toEqual('subtask2')
  })

  it('remove item from instance', () => {
    const clone = model.newDoc(taskIds.class.Task, doc1._id, doc1)
    const cloneResult = model.updateDocumentPull(clone, 'mainTask', {})

    expect(cloneResult.mainTask).toEqual(undefined)
  })

  it('match regex value', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    model.add(model.newDoc(taskIds.class.Task, generateId(), createTask('t1', 10, 'test task1')))
    model.add(model.newDoc(taskIds.class.Task, generateId(), createTask('t2t', 11, 'test task2')))

    const result = await model.find(taskIds.class.Task, { name: { $regex: 't.*t' } })

    expect(result.length).toEqual(1)
  })

  it('find one happy path', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    model.add(model.newDoc(taskIds.class.Task, generateId(), createTask('t1', 10, 'test task1')))
    model.add(model.newDoc(taskIds.class.Task, generateId(), createTask('t2', 11, 'test task2')))

    const result = await model.findOne(taskIds.class.Task, { name: { $regex: 't2' } })
    expect(result).toBeDefined()
  })

  it('find one not found', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    model.add(model.newDoc(taskIds.class.Task, generateId(), createTask('t1', 10, 'test task1')))

    const result = await model.findOne(taskIds.class.Task, { name: { $regex: 't3' } })
    expect(result).toBeUndefined()
  })

  it('remove document without "query" argument', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const doc = model.newDoc(taskIds.class.Task, doc1._id, doc1)
    model.add(doc)

    // call to find() initialzes lazy loaded byClass model's attribute
    await model.find(taskIds.class.Task, { name: doc.name as StringProperty })

    model.removeDocument(doc)
    const result = await model.find(taskIds.class.Task, { name: doc.name as StringProperty })
    expect(result.length).toEqual(0)
  })
})

describe('invalid cases', () => {
  it('throws on adding existing doc', () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const doc = model.newDoc(
      taskIds.class.Task,
      'id' as Ref<Task>,
      createTask('', 0, '')
    )

    model.add(doc)
    expect(() => model.add(doc)).toThrowError()
  })

  it('rejects on storing existing doc', () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const doc = model.newDoc(
      taskIds.class.Task,
      'id' as Ref<Task>,
      createTask('', 0, '')
    )

    model.store(txContext(), doc)
    expect(model.store(txContext(), doc)).rejects.toThrowError()
  })

  it('throws on deleting missing doc', () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    expect(() => model.del('id' as Ref<Doc>)).toThrowError()
  })

  it('rejects on removing missing doc', () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    expect(() => model.remove(txContext(), {} as Ref<Class<Doc>>, 'id' as Ref<Doc>)).toThrowError()
  })

  it('throws on getting missing doc', () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    expect(() => model.get('id' as Ref<Doc>)).toThrowError()
  })

  it('throws on pushing to missing object', () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const doc = model.newDoc(taskIds.class.Task,
      'id' as Ref<Task>,
      createTask('', 0, '')
    )

    expect(
      () => model.updateDocument(
        doc,
        [{
          kind: TxOperationKind.Set,
          _attributes: (createSubtask('subtask3', 34) as unknown) as AnyLayout,
          selector: [{ key: 'tasks', pattern: { name: 'Not exist' } } as ObjectSelector]
        } as TxOperation])
    ).toThrowError()
  })

  it('throws on pushing to missing attribute', () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const doc = model.newDoc(taskIds.class.Task,
      'id' as Ref<Task>,
      createTask('', 0, '')
    )

    expect(
      () => model.updateDocumentPush(
        doc,
        'Not exist',
        (createSubtask('subtask3', 34) as unknown) as AnyLayout
      )
    ).toThrowError()
  })

  it('throws on loading non-matching domain', () =>
    expect(new Model('vdocs').loadDomain('vdocs2')).rejects.toThrowError()
  )
})

describe('Model domain', () => {
  const model = new Model('vdocs')
  model.loadModel(data)

  it('returns domains', () => {
    expect(model.getDomain(CORE_CLASS_CLASS))
      .toEqual('model')
    expect(model.getDomain('class:core.Title' as Ref<Class<Doc>>))
      .toEqual('title')
  })

  it('throws if domain does not exist', () => {
    expect(() => model.getDomain(CORE_CLASS_DOC))
      .toThrowError()
  })

  it('returns classes', () => {
    expect(model.getClass(CORE_CLASS_CLASS))
      .toEqual(CORE_CLASS_CLASS.toString())
    expect(model.getClass('mixin:core.ShortID' as Ref<Class<Doc>>))
      .toBe('class:core.VDoc')
  })

  it('throws if class cannot be found', () => {
    expect(() => model.getClass('class:MISSING' as Ref<Class<Doc>>))
      .toThrowError()
  })
})

describe('Model utilities', () => {
  const model = new Model('vdocs')
  model.loadModel(data)

  it('returns all attributes of class', () => {
    expect(model.getAllAttributes(CORE_CLASS_EMB).length)
      .toEqual(1) // It should contain _class

    const getAttrs = (id: string) => Object.entries<Attribute>(
      data.find((x: any) => x._id === id)?._attributes ?? {}
    )

    expect(model.getAllAttributes(CORE_CLASS_DOC).map(m => [m.name, m.attr]))
      .toEqual([
        getAttrs(CORE_CLASS_DOC),
        getAttrs(CORE_CLASS_OBJ)
      ].reduce((r, x) => r.concat(x)))

    expect(model.getAllAttributes(CORE_CLASS_ATTRIBUTE).map(m => [m.name, m.attr]))
      .toEqual([
        getAttrs(CORE_CLASS_ATTRIBUTE),
        getAttrs(CORE_CLASS_EMB),
        getAttrs(CORE_CLASS_OBJ)
      ].reduce((r, x) => r.concat(x)))
  })

  it('returns primary key of class', () => {
    expect(model.getPrimaryKey(CORE_CLASS_EMB))
      .toBeNull()
    expect(model.getPrimaryKey('core.class.TaskObj' as Ref<Class<Doc>>))
      .toEqual('name')
    expect(model.getPrimaryKey('core.class.DerivedTaskObj' as Ref<Class<Doc>>))
      .toEqual('name')
  })
})

describe('Model mixin', () => {
  const mixin = 'mixin:core.ShortID' as Ref<Mixin<any>>

  it('creates new proto with \'as\' method', () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const shortId = 'short-id'
    const target = {
      ...doc1,
      [mixinKey(mixin, 'shortId')]: shortId
    }
    Model.includeMixin(target, mixin)
    const res = model.as({ ...target }, mixin)

    expect(res.__layout).toEqual(target)
    expect(res.shortId).toEqual(shortId)

    res.shortId = 'another-short-id'

    expect(res.shortId).toBe('another-short-id')
  })

  it('reuses proto with \'as\' method', () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const shortId = 'short-id'
    const target = {
      ...doc1,
      [mixinKey(mixin, 'shortId')]: shortId
    }
    Model.includeMixin(target, mixin)
    model.as({ ...target }, mixin)
    const res = model.as(target, mixin)

    expect(res.__layout).toEqual(target)
    expect(res.shortId).toEqual(shortId)

    res.shortId = 'another-short-id'

    expect(res.shortId).toBe('another-short-id')
  })

  it('casts doc', () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const shortId = 'short-id'
    const target = {
      ...doc1,
      [mixinKey(mixin, 'shortId')]: shortId
    }
    const res = model.cast({ ...target }, mixin)

    const expectedLayout = {
      ...target,
      _mixins: [mixin]
    }

    expect(res.__layout).toEqual(expectedLayout)
    expect(res.shortId).toEqual(shortId)

    res.shortId = 'another-short-id'

    expect(res.shortId).toBe('another-short-id')
  })

  it('checks if mixin list includes target', () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const withMixin = {
      ...doc1,
      _mixins: [mixin]
    }

    expect(model.isMixedIn(doc1, mixin as Ref<Mixin<Doc>>))
      .toEqual(false)
    expect(model.isMixedIn(withMixin, mixin as Ref<Mixin<Doc>>))
      .toEqual(true)
    expect(model.isMixedIn(withMixin, 'mixin:missing.one' as Ref<Mixin<Doc>>))
      .toEqual(false)
  })
})

describe('Model assign tools', () => {
  const model = new Model('vdocs')
  model.loadModel(data)

  it('assigns class if missing', () => {
    const res = model.assign({}, taskIds.class.Task, {})

    expect(res).toEqual({ _class: taskIds.class.Task })
  })

  it('doesn\'t change class if it exists', () => {
    const res = model.assign(
      { _class: taskIds.class.Task as Ref<Class<Obj>> },
      taskIds.class.TaskComment as Ref<Class<Obj>>,
      {}
    )

    expect(res).toEqual({ _class: taskIds.class.Task })
  })

  it('assigns own properties', () => {
    const res = model.assign(
      {},
      taskIds.class.Task as Ref<Class<Obj>>,
      { rate: 42 as PropertyType }
    )

    expect(res).toEqual({ _class: taskIds.class.Task, rate: 42 })
  })

  it('assigns mixin properties', () => {
    const mixin = 'mixin:core.ShortID' as Ref<Mixin<any>>
    const mKey = mixinKey(mixin, 'shortId')
    const res = model.assign(
      {},
      taskIds.class.Task as Ref<Class<Obj>>,
      { [mKey]: 42 as PropertyType }
    )

    expect(res).toEqual({ _class: taskIds.class.Task, [mKey]: 42 })
  })

  it('creates new doc', () => {
    const res = model.newDoc(
      taskIds.class.Task,
      'id' as Ref<Doc>,
      { rate: 42 }
    )

    expect(res).toEqual({
      _id: 'id',
      _class: taskIds.class.Task,
      rate: 42
    })
  })

  it('compares classes', () => {
    expect(model.is(
      CORE_CLASS_DOC,
      CORE_CLASS_DOC
    )).toEqual(true)

    expect(model.is(
      CORE_CLASS_DOC,
      CORE_CLASS_OBJ
    )).toEqual(true)

    expect(model.is(
      CORE_CLASS_OBJ,
      CORE_CLASS_DOC
    )).toEqual(false)
  })

  it('dumps properly', () => {
    const dump = model.dump()

    expect(dump.length).toEqual(data.length)
    expect(dump).toEqual(expect.arrayContaining(data))
  })

  it('loads domain properly', async () => {
    const dump = await model.loadDomain('vdocs')

    expect(dump.length).toEqual(data.length)
    expect(dump).toEqual(expect.arrayContaining(data))
  })
})

describe('Model storage', () => {
  it('pushes attributes', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const doc = model.newDoc(taskIds.class.Task, doc1._id, doc1)
    model.add(doc)

    const existingSubtasks = [...doc.tasks ?? []]
    const newSubtask = createSubtask('subtask3', 34)
    const expectedDoc = {
      ...doc,
      tasks: [...existingSubtasks, newSubtask]
    }

    await model.push(
      txContext(),
      '' as Ref<Class<Doc>>,
      doc._id,
      'tasks',
      newSubtask as unknown as AnyLayout
    )

    const updatedDoc = model.get(doc._id) as Task

    expect(updatedDoc).toEqual(expectedDoc)
  })

  it('updates doc', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const doc = model.newDoc(taskIds.class.Task, doc1._id, doc1)
    model.add(doc)

    const newName = 'your-space'
    const expectedDoc = {
      ...doc,
      name: newName
    }

    await model.update(
      txContext(),
      '' as Ref<Class<Doc>>,
      doc._id,
      [{ kind: TxOperationKind.Set, _attributes: { name: newName as PropertyType } } as TxOperation]
    )

    const updatedDoc = model.get(doc._id) as Task

    expect(updatedDoc).toEqual(expectedDoc)
  })

  it('removes doc', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const doc = model.newDoc(taskIds.class.Task, doc1._id, doc1)
    model.add(doc)

    await model.remove(
      txContext(),
      '' as Ref<Class<Doc>>,
      doc._id
    )

    expect(() => model.get(doc._id)).toThrowError()
  })
})

describe('mixin tools', () => {
  const noSpecCharsKey = 'key'
  const specCharsKey = 'prefix|a~b'

  const noSpecCharsMixin = {
    mixin: 'key' as Ref<Mixin<Obj>>,
    key: ''
  }
  const specCharsMixin = {
    mixin: 'a.b' as Ref<Mixin<Obj>>,
    key: 'prefix'
  }

  it('builds mixin without special chars', () =>
    expect(mixinFromKey(noSpecCharsKey))
      .toEqual(noSpecCharsMixin)
  )

  it('builds mixin with special chars', () =>
    expect(mixinFromKey(specCharsKey))
      .toEqual(specCharsMixin)
  )

  it('builds key from mixin without special chars', () =>
    expect(mixinKey(noSpecCharsMixin.mixin, noSpecCharsMixin.key))
      .toEqual(`|${noSpecCharsKey}`)
  )

  it('builds key from mixin with special chars', () =>
    expect(mixinKey(specCharsMixin.mixin, specCharsMixin.key))
      .toEqual(specCharsKey)
  )

  it('document query specification test', () => {
    console.log('cool', {
      name: 's1',
      users: { userId: 'qwe' }
    } as DocumentQuery<Space>)

    console.log('cool', {
      name: 's1',
      users: [{ userId: 'qwe' }]
    } as DocumentQuery<Space>)
  })
})
