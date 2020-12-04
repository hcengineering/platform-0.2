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

import {
  Ref,
  Doc,
  Property,
  Emb,
  Class,
  Obj,
  Type,
  ClassifierKind,
  AllAttributes,
  Attribute,
  CORE_CLASS_CLASS,
  CORE_CLASS_ATTRIBUTE,
  CORE_CLASS_ARRAY,
  CORE_CLASS_INSTANCE
} from '@anticrm/core'
import { Model } from '../model'

import { ModelClass, Prop, Array, InstanceOf, InstOf, Builder } from '@anticrm/model'

/* eslint-env jest */

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

const doc1 = {
  _id: 'd1' as Ref<Doc>,
  _class: core.class.Task,
  name: 'my-space',
  lists: ['val1', 'val2'],
  rate: 20,
  mainTask: {
    name: 'main-subtask',
    rate: 30,
    _class: core.class.Subtask,
    __embedded: true
  } as SubTask,
  tasks: [
    {
      name: 'subtask1',
      rate: 31,
      _class: core.class.Subtask,
      __embedded: true
    } as SubTask,
    {
      name: 'subtask2',
      rate: 33,
      _class: core.class.Subtask,
      __embedded: true
    } as SubTask
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

  @InstOf(core.class.Subtask) mainTask!: SubTask
  @Array(InstanceOf(core.class.Subtask)) tasks?: SubTask[]
}

@ModelClass(core.class.Subtask, core.class.Emb)
class TSubTask extends TEmb implements SubTask {
  @Prop() name!: string
  @Prop() rate!: number
}

const model = new Model('vdoc')

let b = new Builder(model)
b.add(TObj, TEmb, TDoc, TTask, TSubTask)

describe('matching', () => {
  it('match object value', () => {
    expect(model.matchQuery(core.class.Task, doc1, { name: 'my-space' as Property<string, string> })).toEqual(true)
  })
  it('match list value', () => {
    expect(model.matchQuery(core.class.Task, doc1, { lists: ['val1' as Property<string, string>, 'val2' as Property<string, string>] })).toEqual(true)
  })

  it('match embedded value', () => {
    expect(
      model.matchQuery(core.class.Task, doc1, {
        mainTask: {
          name: 'main-subtask' as Property<string, string>
        }
      })
    ).toEqual(true)
  })
  it('match embedded list value', () => {
    expect(
      model.matchQuery(core.class.Task, doc1, {
        tasks: [
          {
            name: 'subtask1' as Property<string, string>
          },
          {
            rate: 33 as Property<number, number>
          }
        ]
      })
    ).toEqual(true)
  })
})
