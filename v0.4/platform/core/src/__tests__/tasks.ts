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

import { Component, identify } from '@anticrm/status'
import { Class, Collection, Doc, Emb, Enum, Mixin, Obj, Ref } from '../classes'
import { DocumentValue } from '../storage'

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const data = require('./model.json')

export interface TaskComment extends Emb {
  message: string
  author: string
  date: Date
}

export enum TaskStatus {
  Open,
  Close,
  Resolved = 100,
  InProgress
}

export enum TaskReproduce {
  Always='always',
  Rare='rare',
  Sometimes='sometimes'
}

export interface Task extends Doc {
  name: string
  description: string
  rate?: number
  comments?: Collection<TaskComment>
  eta?: TaskEstimate
  status?: TaskStatus
  reproduce?: TaskReproduce
}

/**
 * Define ROM and Estimated Time to arrival
 */
export interface TaskEstimate extends Obj {
  rom: number // in hours
  eta: number // in hours
}

export interface TaskMixin extends Task {
  textValue?: string
}

export interface TaskWithSecond extends Task {
  secondTask: string | null
}

export const taskIds = identify('core' as Component, {
  class: {
    Task: '' as Ref<Class<Task>>,
    TaskEstimate: '' as Ref<Class<TaskEstimate>>,
    TaskComment: '' as Ref<Class<TaskComment>>
  },
  mixin: {
    TaskMixin: '' as Ref<Mixin<TaskMixin>>
  },
  enum: {
    TaskStatus: '' as Ref<Enum<TaskStatus>>,
    TaskReproduce: '' as Ref<Enum<TaskReproduce>>
  }
})

/**
 * Create a random task with name specified
 * @param name
 */
export function createTask (name: string, rate: number, description: string): DocumentValue<Task> {
  return {
    name,
    description,
    rate
  }
}

export const doc1: Task = {
  _id: 'd1' as Ref<Doc>,
  _class: taskIds.class.Task,
  name: 'my-space',
  description: 'some-value',
  rate: 20
}
