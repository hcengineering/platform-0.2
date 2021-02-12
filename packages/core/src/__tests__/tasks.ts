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

import { Class, Doc, Emb, Ref } from '../classes'
import { generateId } from '../storage'

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

/**
 * Create a random task with name specified
 * @param name
 */
export function createTask (name: string, rate: number, description: string): Task {
  return {
    _id: generateId() as Ref<Doc>,
    _class: taskIds.class.Task,
    name,
    description,
    lists: [name],
    rate
  } as Task
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
