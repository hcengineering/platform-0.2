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

import { describe, expect, it } from '@jest/globals'
import core from '..'
import { Class, Doc, Mixin, Obj, Ref } from '../classes'
import { mixinFromKey, mixinKey, Model } from '../model'
import { createTask, data, doc1, Task, taskIds, TaskWithSecond } from './tasks'

describe('matching', () => {
  const model = new Model('vdocs')
  model.loadModel(data)

  it('match object value', () => {
    expect(model.matchQuery(taskIds.class.Task, doc1, { name: 'my-space' })).toEqual(true)
  })

  it('match regex value', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    model.add(model.createDocument(taskIds.class.Task, createTask('t1', 10, 'test task1')))
    model.add(model.createDocument(taskIds.class.Task, createTask('t2t', 11, 'test task2')))

    const result = await model.find<Task>(taskIds.class.Task, { name: { $regex: 't.*t' } })

    expect(result.length).toEqual(1)
  })

  it('remove document without "query" argument', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const doc = model.createDocument(taskIds.class.Task, doc1)
    model.add(doc)

    // call to find() initialzes lazy loaded byClass model's attribute
    await model.find<Task>(taskIds.class.Task, { name: doc.name })

    model.del(doc._id)
    const result = await model.find<Task>(taskIds.class.Task, { name: doc.name })
    expect(result.length).toEqual(0)
  })
})

describe('invalid cases', () => {
  it('throws on adding existing doc', () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const doc = model.createDocument(taskIds.class.Task, createTask('', 0, ''))

    model.add(doc)
    expect(() => model.add(doc)).toThrowError()
  })

  it('throws on deleting missing doc', () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    expect(() => model.del('id' as Ref<Doc>)).toThrowError()
  })

  it('throws on getting missing doc', () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    expect(() => model.get('id' as Ref<Doc>)).toThrowError()
  })

  it('throws on loading non-matching domain', async () => {
    const mdl = new Model('vdocs')
    const p = mdl.loadDomain('vdocs2')
    try {
      await p
      expect(p).toBeUndefined() // eslint-disable-line
    } catch (err) {
      expect(err.message).toEqual('domain does not match')
    }
  })
})

describe('Model domain', () => {
  const model = new Model('vdocs')
  model.loadModel(data)

  it('returns domains', () => {
    expect(model.getDomain(core.class.Class))
      .toEqual('model')
    // expect(model.getDomain('class:core.Title' as Ref<Class<Doc>>))
    //   .toEqual('title')
  })

  it('throws if domain does not exist', () => {
    expect(() => model.getDomain(core.class.Doc))
      .toThrowError()
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
    expect(model.getAllAttributes(core.class.Emb).length)
      .toEqual(2) // It should contain _class

    const getAttrs = (id: string): any =>
      data.find((x: any) => x._id === id)?._attributes.items ?? []

    expect(model.getAllAttributes(core.class.Doc).map(m => m.attr))
      .toEqual([
        getAttrs(core.class.Doc),
        getAttrs(core.class.Obj)
      ].reduce((r, x) => r.concat(...x)))

    expect(model.getAllAttributes(core.class.Attribute).map(m => m.attr))
      .toEqual([
        getAttrs(core.class.Attribute),
        getAttrs(core.class.Emb),
        getAttrs(core.class.Obj)
      ].reduce((r, x) => r.concat(...x)))
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

  it('builds mixin without special chars', () => {
    expect(mixinFromKey(noSpecCharsKey)).toEqual(noSpecCharsMixin)
  }
  )

  it('builds mixin with special chars', () => {
    expect(mixinFromKey(specCharsKey)).toEqual(specCharsMixin)
  }
  )

  it('builds key from mixin without special chars', () => {
    expect(mixinKey(noSpecCharsMixin.mixin, noSpecCharsMixin.key))
      .toEqual(`|${noSpecCharsKey}`)
  }
  )

  it('builds key from mixin with special chars', () => {
    expect(mixinKey(specCharsMixin.mixin, specCharsMixin.key))
      .toEqual(specCharsKey)
  }
  )

  it('null vs undefined testing', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    const t: TaskWithSecond = { _class: taskIds.class.Task, name: '', description: '', _id: 'qwe' as Ref<Doc>, secondTask: null }

    expect(undefined == null).toBeTruthy()
    expect(undefined === null).toBeFalsy()
    expect(null === undefined).toBeFalsy() // eslint-disable-line
    expect(null == undefined).toBeTruthy() // eslint-disable-line

    expect(t.secondTask === undefined).toBeFalsy()
    expect(t.secondTask === null).toBeTruthy()
    expect(t.secondTask == null).toBeTruthy()
  })

  it('find embedded object', async () => {
    const model = new Model('vdocs')
    model.loadModel(data)

    model.add(model.createDocument<Task>(taskIds.class.Task, {
      name: 't1',
      description: 'test tasl1',
      rate: 10,
      eta: {
        eta: 10,
        rom: 20
      }
    }))
    model.add(model.createDocument<Task>(taskIds.class.Task, createTask('t2t', 11, 'test task2')))

    const result = await model.find<Task>(taskIds.class.Task, { eta: { eta: 10 } })
    expect(result.length).toEqual(1)

    const result2 = await model.find<Task>(taskIds.class.Task, { eta: { eta: 11 } })
    expect(result2.length).toEqual(0)
  })
})
