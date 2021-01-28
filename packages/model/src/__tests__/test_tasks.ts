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

import core, { Class$, Prop, ArrayOf$, Builder, InstanceOf$, Primary } from '..'
import { Ref, Doc, Emb, Class, MODEL_DOMAIN } from '@anticrm/core'
import { TDoc, TEmb, TObj } from '../__model__'

export interface TaskComment extends Emb {
  _id: string
  message: string
  author: string
  date: Date
  oldVersion: TaskComment[]
}

export interface SubTask extends Emb {
  name: string
  rate?: number
  comments?: TaskComment[]
}

export interface Task extends Doc {
  name: string
  description: string
  lists: string[]
  tasks?: SubTask[]
  mainTask?: SubTask
  rate?: number
  comments?: TaskComment[]
}

export const taskIds = {
  class: {
    Task: 'core.class.TaskObj' as Ref<Class<Task>>,
    Subtask: 'core.class.SubTask' as Ref<Class<SubTask>>,
    TaskComment: 'core.class.TaskComment' as Ref<Class<TaskComment>>
  }
}

export function createSubtask (name: string, rate = 30): SubTask {
  return {
    name: name,
    rate: rate,
    __embedded: true,
    _class: taskIds.class.Subtask
  } as SubTask
}

export const doc1 = {
  _id: 'd1' as Ref<Doc>,
  _class: taskIds.class.Task,
  name: 'my-space',
  description: 'some-value',
  lists: ['val1', 'val2'],
  rate: 20,
  mainTask: createSubtask('main-subtask', 30),
  tasks: [
    createSubtask('subtask1', 31),
    createSubtask('subtask2', 33)
  ]
} as Task

@Class$(taskIds.class.Task, core.class.Doc, MODEL_DOMAIN)
export class TTask extends TDoc implements Task {
  @Primary()
  @Prop() name!: string
  @Prop() description!: string

  @Prop() rate!: number

  @Prop() lists!: string[]

  @InstanceOf$(taskIds.class.Subtask) mainTask!: SubTask

  @ArrayOf$()
  @InstanceOf$(taskIds.class.Subtask)
  tasks?: SubTask[]

  @ArrayOf$()
  @InstanceOf$(taskIds.class.TaskComment)
  comments?: TaskComment[]
}

@Class$(taskIds.class.Subtask, core.class.Emb, MODEL_DOMAIN)
export class TSubTask extends TEmb implements SubTask {
  @Prop() name!: string
  @Prop() rate!: number

  @ArrayOf$()
  @InstanceOf$(taskIds.class.TaskComment)
  comments?: TaskComment[]
}

@Class$(taskIds.class.TaskComment, core.class.Emb, MODEL_DOMAIN)
export class TTaskComment extends TEmb implements TaskComment {
  @Prop()
  _id!: string

  @Prop()
  message!: string

  @Prop()
  author!: string

  @Prop()
  date!: Date

  @ArrayOf$()
  @InstanceOf$(taskIds.class.TaskComment)
  oldVersion!: TaskComment[]
}

export function model (S: Builder): void {
  S.add(TTask, TSubTask, TTaskComment)
}

export function fullModel (S: Builder): void {
  S.add(TObj, TEmb, TDoc)
  model(S)
}
