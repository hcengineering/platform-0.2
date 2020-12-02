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
  CORE_CLASS_TYPE,
  CORE_CLASS_CLASS,
  CORE_CLASS_ATTRIBUTE,
  CORE_CLASS_ARRAY,
  CORE_CLASS_INSTANCE
} from '@anticrm/core'
import { Model } from '../model'

/* eslint-env jest */

interface SubTask extends Emb {
  name: string
  rate?: number
}

interface TaskObj extends Doc {
  name: string
  lists: string[]
  tasks?: SubTask[]
  mainTask?: SubTask
  rate?: number
}

const ClassTask = 'core.class.TaskObj' as Ref<Class<TaskObj>>
const ClassSubtask = 'core.class.SubTask' as Ref<Class<SubTask>>

const doc1 = {
  _id: 'd1' as Ref<Doc>,
  _class: ClassTask,
  name: 'my-space',
  lists: ['val1', 'val2'],
  rate: 20,
  mainTask: {
    name: 'main-subtask',
    rate: 30,
    _class: ClassSubtask,
    __embedded: true
  } as SubTask,
  tasks: [
    {
      name: 'subtask1',
      rate: 31,
      _class: ClassSubtask,
      __embedded: true
    } as SubTask,
    {
      name: 'subtask2',
      rate: 33,
      _class: ClassSubtask,
      __embedded: true
    } as SubTask
  ]
} as TaskObj

const model = new Model('vdoc')

function prop(_class: Ref<Class<Emb>> = CORE_CLASS_ATTRIBUTE, extra: Record<string, unknown> = {}): Attribute {
  return ({
    _class: CORE_CLASS_ATTRIBUTE,
    type: ({
      ...extra,
      _class: _class
    } as unknown) as Type
  } as unknown) as Attribute
}

model.loadModel([
  {
    _kind: ClassifierKind.CLASS,
    _id: ClassTask,
    _class: CORE_CLASS_CLASS,
    _attributes: {
      name: prop(),
      lists: prop(),
      tasks: prop(CORE_CLASS_ARRAY, {
        of: { _class: CORE_CLASS_INSTANCE, of: ClassSubtask }
      }),
      mainTask: prop(CORE_CLASS_INSTANCE, {
        of: ClassSubtask
      }),
      rate: prop()
    } as AllAttributes<TaskObj, Doc>
  } as Class<TaskObj>,
  {
    _kind: ClassifierKind.CLASS,
    _id: ClassSubtask,
    _class: CORE_CLASS_CLASS,
    _attributes: {
      name: prop(),
      rate: prop()
    } as AllAttributes<SubTask, Obj>
  } as Class<SubTask>
])

describe('matching', () => {
  it('match object value', () => {
    expect(model.matchQuery(ClassTask, doc1, { name: 'my-space' as Property<string, string> })).toEqual(true)
  })
  it('match list value', () => {
    expect(model.matchQuery(ClassTask, doc1, { lists: ['val1' as Property<string, string>, 'val2' as Property<string, string>] })).toEqual(true)
  })

  it('match embedded value', () => {
    expect(
      model.matchQuery(ClassTask, doc1, {
        mainTask: {
          name: 'main-subtask' as Property<string, string>
        }
      })
    ).toEqual(true)
  })
  it('match embedded list value', () => {
    expect(
      model.matchQuery(ClassTask, doc1, {
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
