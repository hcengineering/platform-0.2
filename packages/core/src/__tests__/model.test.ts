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

import { Ref, Doc, Property, Emb, Class, Obj } from '@anticrm/core'
import { Model } from '../model'

import { ModelClass, Prop, Collection, Builder, Reference } from '@anticrm/model'
import { AnyLayout, StringProperty } from '../core'

interface SubTask extends Emb {
  name: string
  rate?: number
}

interface Task extends Doc {
  name: string
  lists: string[]
  tasks?: SubTask[]
  mainTask?: SubTask
  rate?: number
}

const core = {
  class: {
    Obj: 'core.class.Obj' as Ref<Class<Obj>>,
    Emb: 'core.class.Emb' as Ref<Class<Emb>>,
    Doc: 'core.class.Doc' as Ref<Class<Doc>>,
    Task: 'core.class.TaskObj' as Ref<Class<Task>>,
    Subtask: 'core.class.SubTask' as Ref<Class<SubTask>>
  }
}

function createSubtask (name: string, rate = 30): SubTask {
  return {
    name: name,
    rate: rate,
    __embedded: true
  } as SubTask
}

const doc1 = {
  _id: 'd1' as Ref<Doc>,
  _class: core.class.Task,
  name: 'my-space',
  lists: ['val1', 'val2'],
  rate: 20,
  mainTask: createSubtask('main-subtask', 30),
  tasks: [
    createSubtask('subtask1', 31),
    createSubtask('subtask2', 33)
  ]
} as Task

@ModelClass(core.class.Obj, core.class.Obj)
class TObj implements Obj {
  _class!: Ref<Class<Obj>>
}

@ModelClass(core.class.Emb, core.class.Obj)
export class TEmb extends TObj implements Emb {
  __embedded!: true
}

@ModelClass(core.class.Doc, core.class.Obj)
class TDoc extends TObj implements Doc {
  _class!: Ref<Class<Doc>>
  @Prop() _id!: Ref<Doc>
}

@ModelClass(core.class.Task, core.class.Doc)
class TTask extends TDoc implements Task {
  @Prop() name!: string
  @Prop() rate!: number
  @Prop() lists!: string[]

  @Reference(core.class.Subtask) mainTask!: SubTask

  @Collection()
  @Reference(core.class.Subtask)
  tasks?: SubTask[]
}

@ModelClass(core.class.Subtask, core.class.Emb)
class TSubTask extends TEmb implements SubTask {
  @Prop() name!: string
  @Prop() rate!: number
}

const model = new Model('vdoc')

const b = new Builder(model)
b.add(TObj, TEmb, TDoc, TTask, TSubTask)

describe('matching', () => {
  it('match object value', () => {
    expect(model.matchQuery(core.class.Task, doc1, { name: 'my-space' as StringProperty })).toEqual(true)
  })
  it('match list value', () => {
    expect(model.matchQuery(core.class.Task, doc1, { lists: ['val1' as StringProperty, 'val2' as StringProperty] })).toEqual(true)
  })

  it('match embedded value', () => {
    expect(
      model.matchQuery(core.class.Task, doc1, {
        mainTask: {
          name: 'main-subtask' as StringProperty
        }
      })
    ).toEqual(true)
  })
  it('match embedded list value', () => {
    expect(
      model.matchQuery(core.class.Task, doc1, {
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
    const clone = Object.assign(doc1)
    model.updateDocument(clone, { name: 'changed' as StringProperty } as AnyLayout)

    expect(clone.name).toEqual('changed')
  })
  it('apply number value', () => {
    const clone = Object.assign(doc1)
    model.updateDocument(clone, { rate: 10 as Property<number, number> } as AnyLayout)

    expect(clone.rate).toEqual(10)
  })

  it('apply array value', () => {
    const clone = Object.assign(doc1)
    model.updateDocument(clone, { lists: ['A' as StringProperty, 'B' as StringProperty] } as AnyLayout)

    expect(clone.lists).toEqual(['A', 'B'])
  })

  it('apply task value', () => {
    const clone = Object.assign(doc1) as Task
    clone.mainTask = undefined
    model.updateDocument(clone, { mainTask: createSubtask('subtask4') } as AnyLayout)

    expect(clone.mainTask).toBeDefined()
    expect(clone.mainTask!.name).toEqual('subtask4')
  })

  it('push subtask value', () => {
    const clone = Object.assign(doc1)
    model.pushDocument(clone, 'tasks' as StringProperty, (createSubtask('subtask3', 34) as unknown) as AnyLayout)

    expect(clone.tasks.length).toEqual(3)
  })

  it('push a new subtask value', () => {
    const clone = Object.assign(doc1)
    clone.tasks = undefined
    model.pushDocument(clone, 'tasks' as StringProperty, (createSubtask('subtask3', 34) as unknown) as AnyLayout)

    expect(clone.tasks.length).toEqual(1)
  })
})
